const { User } = require("../models/user");
const { Orders } = require("../models/orders");
const { ProductReviews } = require("../models/productReviews");
const { MyList } = require("../models/myList");
const express = require("express");

const router = express.Router();

function getCustomerName(user) {
  if (user.fullName) return user.fullName;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return user.name || user.email || "Customer";
}

function formatAddress(address) {
  if (!address) return "";
  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);
  return parts.join(", ");
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
    phone: user.phone || "",
    images: user.images || [],
    address: user.address || {},
    addressLine: formatAddress(user.address),
    status: user.isActive !== false ? "active" : "inactive",
    orderCount: stats.orderCount,
    totalSpend: stats.totalSpend,
    joinedAt: user.createdAt,
  };
}

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    const customerList = [];

    for (const user of users) {
      const stats = await buildOrderStats(user._id, user.email);
      customerList.push(mapCustomerSummary(user, stats));
    }

    return res.status(200).json({ customerList });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const customerCount = await User.countDocuments({ role: { $ne: "admin" } });
    return res.send({ customerCount });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "Customer not found." });
    }

    const stats = await buildOrderStats(user._id, user.email);
    const reviews = await ProductReviews.find({ customerId: String(user._id) }).sort({ dateCreated: -1 });
    const wishlist = await MyList.find({ userId: String(user._id) });

    const customerData = {
      ...mapCustomerSummary(user, stats),
      orders: stats.orders.map((order) => ({
        _id: order._id,
        id: order._id,
        orderNumber: order.orderNumber || `#${String(order._id).slice(-6).toUpperCase()}`,
        amount: order.amount,
        status: order.status || "placed",
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

    return res.status(200).json({ customerData });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.status !== "inactive" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const stats = await buildOrderStats(user._id, user.email);
    return res.send(mapCustomerSummary(user, stats));
  } catch (error) {
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
