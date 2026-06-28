const { User } = require('../models/user');
const { Orders } = require('../models/orders');
const { ProductReviews } = require('../models/productReviews');
const { MyList } = require('../models/myList');

function getCustomerName(user) {
  if (user.fullName) return user.fullName;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.name || user.email || 'Customer';
}

function formatAddress(address) {
  if (!address) return '';
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(', ');
}

async function buildOrderStats(userId, email) {
  const orders = await Orders.find({
    $or: [{ userid: String(userId) }, { email: email?.toLowerCase?.() || email }],
  });

  const orderCount = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);

  return { orderCount, totalSpend, orders };
}

function mapCustomerSummary(user, stats) {
  return {
    _id: user._id,
    id: user._id,
    name: getCustomerName(user),
    email: user.email,
    phone: user.phone || '',
    images: user.images || [],
    address: user.address || {},
    addressLine: formatAddress(user.address),
    status: user.isActive !== false ? 'active' : 'inactive',
    orderCount: stats.orderCount,
    totalSpend: stats.totalSpend,
    joinedAt: user.createdAt,
  };
}

class CustomerService {
  async list() {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    const customerList = [];

    for (const user of users) {
      const stats = await buildOrderStats(user._id, user.email);
      customerList.push(mapCustomerSummary(user, stats));
    }

    return customerList;
  }

  async getCount() {
    return User.countDocuments({ role: { $ne: 'admin' } });
  }

  async getById(id) {
    const user = await User.findById(id);
    if (!user || user.role === 'admin') {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    const stats = await buildOrderStats(user._id, user.email);
    const reviews = await ProductReviews.find({ customerId: String(user._id) }).sort({ dateCreated: -1 });
    const wishlist = await MyList.find({ userId: String(user._id) });

    return {
      ...mapCustomerSummary(user, stats),
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
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: status !== 'inactive' },
      { new: true }
    );

    if (!user) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    const stats = await buildOrderStats(user._id, user.email);
    return mapCustomerSummary(user, stats);
  }
}

module.exports = new CustomerService();
