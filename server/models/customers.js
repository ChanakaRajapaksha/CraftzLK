const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    userid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Sri Lanka' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

customerSchema.set('toJSON', {
  virtuals: true,
});

exports.Customers = mongoose.model('Customers', customerSchema);
exports.customerSchema = customerSchema;
