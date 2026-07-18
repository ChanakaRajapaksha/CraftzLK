const User = require('../models/user');
const { Customers } = require('../models/customers');
const { Orders } = require('../models/orders');
const { ProductReviews } = require('../models/productReviews');
const { MyList } = require('../models/myList');

let hasSyncedFromOrders = false;

function formatAddress(address) {
  if (!address) return '';
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
}

function parseAddressFromOrder(order) {
  const pincode = String(order.pincode || '').trim();
  const addressStr = String(order.address || '').trim();
  const parts = addressStr.split(',').map((part) => part.trim()).filter(Boolean);

  let city = '';
  let street = addressStr;

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const pincodeMatchesLast = pincode && lastPart === pincode;
    const lastLooksLikePincode = /^\d{4,6}$/.test(lastPart);

    if (pincodeMatchesLast || lastLooksLikePincode) {
      city = parts.length >= 3 ? parts[parts.length - 2] : '';
      street = parts.slice(0, parts.length - (city ? 2 : 1)).join(', ');
    } else if (parts.length >= 2) {
      city = parts[parts.length - 1];
      street = parts.slice(0, -1).join(', ');
    }
  }

  return {
    street: street || addressStr,
    city,
    state: '',
    zipCode: pincode,
    country: 'Sri Lanka',
  };
}

async function loadUserProfile(userid) {
  if (!userid) return { images: [], status: 'active' };

  const user = await User.findById(userid).select('images isActive');
  if (!user) return { images: [], status: 'active' };

  return {
    images: user.images || [],
    status: user.isActive === false ? 'inactive' : 'active',
  };
}

function mapCustomerSummary(customer) {
  return {
    _id: customer._id,
    id: customer._id,
    name: customer.name || 'Customer',
    email: customer.email || '',
    phone: customer.phone || '',
    images: customer.images || [],
    address: customer.address || {},
    addressLine: formatAddress(customer.address),
    status: customer.status || 'active',
    orderCount: Number(customer.orderCount) || 0,
    totalSpend: Number(customer.totalSpend) || 0,
    joinedAt: customer.createdAt,
  };
}

function buildOrderStats(orders) {
  const orderCount = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
  return { orderCount, totalSpend, orders };
}

class CustomerService {
  async syncAllFromOrders() {
    const orders = await Orders.find().sort({ date: 1 });
    const ordersByUser = new Map();

    for (const order of orders) {
      const userid = String(order.userid || '');
      if (!userid) continue;

      if (!ordersByUser.has(userid)) {
        ordersByUser.set(userid, []);
      }
      ordersByUser.get(userid).push(order);
    }

    for (const [userid, userOrders] of ordersByUser.entries()) {
      const latestOrder = userOrders[userOrders.length - 1];
      const stats = buildOrderStats(userOrders);
      const profile = await loadUserProfile(userid);

      const customer = await Customers.findOneAndUpdate(
        { userid },
        {
          $set: {
            name: latestOrder.name || 'Customer',
            email: (latestOrder.email || '').toLowerCase(),
            phone: latestOrder.phoneNumber || '',
            address: parseAddressFromOrder(latestOrder),
            images: profile.images,
            status: profile.status,
            orderCount: stats.orderCount,
            totalSpend: stats.totalSpend,
            lastOrderDate: latestOrder.date,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await Orders.updateMany(
        { userid, customerId: { $in: [null, ''] } },
        { $set: { customerId: String(customer._id) } }
      );
    }
  }

  async ensureSyncedFromOrders() {
    if (hasSyncedFromOrders) return;
    await this.syncAllFromOrders();
    hasSyncedFromOrders = true;
  }

  async upsertFromOrder(order) {
    const userid = String(order.userid || '');
    if (!userid) return null;

    const orderAmount = parseFloat(order.amount) || 0;
    const profile = await loadUserProfile(userid);
    const address = parseAddressFromOrder(order);
    const email = (order.email || '').toLowerCase();

    let customer = await Customers.findOne({ userid });

    if (customer) {
      customer.name = order.name || customer.name;
      customer.email = email || customer.email;
      customer.phone = order.phoneNumber || customer.phone;
      customer.address = address;
      if (profile.images.length) customer.images = profile.images;
      customer.orderCount = Number(customer.orderCount || 0) + 1;
      customer.totalSpend = Number(customer.totalSpend || 0) + orderAmount;
      customer.lastOrderDate = order.date || new Date();
      if (customer.status !== 'inactive') {
        customer.status = profile.status;
      }
      await customer.save();
    } else {
      customer = await Customers.create({
        userid,
        name: order.name || 'Customer',
        email,
        phone: order.phoneNumber || '',
        images: profile.images,
        address,
        status: profile.status,
        orderCount: 1,
        totalSpend: orderAmount,
        lastOrderDate: order.date || new Date(),
      });
    }

    if (!order.customerId) {
      order.customerId = String(customer._id);
      await order.save();
    }

    return customer;
  }

  async list() {
    await this.ensureSyncedFromOrders();
    const customers = await Customers.find().sort({ createdAt: -1 });
    return customers.map(mapCustomerSummary);
  }

  async getCount() {
    await this.ensureSyncedFromOrders();
    return Customers.countDocuments();
  }

  async getById(id) {
    const customer = await Customers.findById(id);
    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    const orders = await Orders.find({ userid: String(customer.userid) }).sort({ date: -1 });
    const stats = buildOrderStats(orders);
    const reviews = await ProductReviews.find({ customerId: String(customer.userid) }).sort({
      dateCreated: -1,
    });
    const wishlist = await MyList.find({ userId: String(customer.userid) });

    return {
      ...mapCustomerSummary({
        ...customer.toObject(),
        orderCount: stats.orderCount,
        totalSpend: stats.totalSpend,
      }),
      orders: stats.orders.map((order) => ({
        _id: order._id,
        id: order._id,
        orderNumber: order.orderNumber || `#${String(order._id).slice(-6).toUpperCase()}`,
        amount: order.amount,
        status: order.status || 'placed',
        date: order.date,
      })),
      reviews: reviews.map((review) => ({
        _id: review._id,
        id: review._id,
        productId: review.productId,
        review: review.review,
        rating: review.customerRating,
        date: review.dateCreated,
      })),
      wishlist: wishlist.map((item) => ({
        _id: item._id,
        id: item._id,
        productId: item.productId,
        productTitle: item.productTitle,
        image: item.image,
        price: item.price,
        rating: item.rating,
      })),
    };
  }

  async updateStatus(id, status) {
    const customer = await Customers.findByIdAndUpdate(
      id,
      { status: status === 'inactive' ? 'inactive' : 'active' },
      { new: true }
    );

    if (!customer) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    if (customer.userid) {
      await User.findByIdAndUpdate(customer.userid, {
        isActive: status !== 'inactive',
      });
    }

    return mapCustomerSummary(customer);
  }
}

module.exports = new CustomerService();
