const mongoose = require('mongoose');

const ordersSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  shippingAddress: {
    type: String,
    default: '',
  },
  pincode: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userid: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    default: '',
  },
  products: [
    {
      productId: { type: String },
      productTitle: { type: String },
      variant: { type: String, default: '' },
      variantSku: { type: String, default: '' },
      quantity: { type: Number },
      price: { type: Number },
      image: { type: String },
      subTotal: { type: Number },
    },
  ],
  orderNumber: {
    type: String,
    default: '',
  },
  orderNotes: {
    type: String,
    default: '',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: '',
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  couponCode: {
    type: String,
    default: '',
  },
  tax: {
    type: Number,
    default: 0,
  },
  shipping: {
    type: Number,
    default: 0,
  },
  shippingMethodId: {
    type: String,
    default: '',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  courierName: {
    type: String,
    default: '',
  },
  trackingUrl: {
    type: String,
    default: '',
  },
  estimatedDeliveryDate: {
    type: Date,
    default: null,
  },
  actualShippingCost: {
    type: Number,
    default: null,
  },
  statusHistory: [
    {
      status: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    default: 'placed',
  },
  stockDeducted: {
    type: Boolean,
    default: false,
  },
  stockRestored: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

ordersSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ordersSchema.set('toJSON', {
  virtuals: true,
});

exports.Orders = mongoose.model('Orders', ordersSchema);
exports.ordersSchema = ordersSchema;
