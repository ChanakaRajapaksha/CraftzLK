const { Coupon } = require('../models/coupon');

class CouponsService {
  mapCoupon(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      code: doc.code,
      discountType: doc.discountType,
      discountValue: doc.discountValue,
      minOrderValue: doc.minOrderValue || 0,
      maxDiscount: doc.maxDiscount || 0,
      startDate: doc.startDate,
      expiryDate: doc.expiryDate,
      usageLimit: doc.usageLimit || 0,
      usageCount: doc.usageCount || 0,
      status: doc.status || 'active',
      dateCreated: doc.createdAt,
    };
  }

  deriveStatus(coupon) {
    if (coupon.status === 'inactive') return 'inactive';
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return 'expired';
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) return 'expired';
    return coupon.status || 'active';
  }

  async list() {
    return Coupon.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return Coupon.findById(id);
  }

  async create(body) {
    const entry = new Coupon({
      code: String(body.code || '').trim().toUpperCase(),
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue) || 0,
      minOrderValue: Number(body.minOrderValue) || 0,
      maxDiscount: Number(body.maxDiscount) || 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      usageLimit: Number(body.usageLimit) || 0,
      usageCount: Number(body.usageCount) || 0,
      status: body.status || 'active',
    });

    return entry.save();
  }

  async update(id, body) {
    return Coupon.findByIdAndUpdate(
      id,
      {
        code: String(body.code || '').trim().toUpperCase(),
        discountType: body.discountType || 'percentage',
        discountValue: Number(body.discountValue) || 0,
        minOrderValue: Number(body.minOrderValue) || 0,
        maxDiscount: Number(body.maxDiscount) || 0,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        usageLimit: Number(body.usageLimit) || 0,
        usageCount: Number(body.usageCount) || 0,
        status: body.status || 'active',
      },
      { new: true }
    );
  }

  async deleteById(id) {
    return Coupon.findByIdAndDelete(id);
  }
}

module.exports = new CouponsService();
