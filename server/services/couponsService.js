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

  async findByCode(code) {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) return null;
    return Coupon.findOne({ code: normalized });
  }

  calculateDiscountAmount(coupon, subtotal) {
    const sub = Number(subtotal) || 0;
    if (sub <= 0) return 0;

    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = Math.min(Number(coupon.discountValue) || 0, sub);
    } else {
      discount = (sub * (Number(coupon.discountValue) || 0)) / 100;
      const maxDiscount = Number(coupon.maxDiscount) || 0;
      if (maxDiscount > 0) {
        discount = Math.min(discount, maxDiscount);
      }
      discount = Math.min(discount, sub);
    }

    return Math.round(discount * 100) / 100;
  }

  formatCurrency(amount) {
    return Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  buildDiscountLabel(coupon) {
    if (coupon.discountType === 'fixed') {
      return `Rs ${this.formatCurrency(coupon.discountValue)} OFF`;
    }
    return `${Number(coupon.discountValue || 0)}% OFF`;
  }

  async validateCoupon(code, subtotal) {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized) {
      return {
        valid: false,
        reason: 'not_found',
        message: 'Coupon code not found.',
      };
    }

    const coupon = await this.findByCode(normalized);
    if (!coupon) {
      return {
        valid: false,
        reason: 'not_found',
        message: 'Coupon code not found.',
      };
    }

    if (coupon.status === 'inactive') {
      return {
        valid: false,
        reason: 'inactive',
        message: 'This coupon is currently unavailable.',
      };
    }

    const now = new Date();
    if (coupon.expiryDate) {
      const expiryEnd = new Date(coupon.expiryDate);
      expiryEnd.setHours(23, 59, 59, 999);
      if (now > expiryEnd) {
        return {
          valid: false,
          reason: 'expired',
          message: 'This coupon has expired.',
          subMessage: 'Please try another coupon.',
          disableApply: true,
        };
      }
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return {
        valid: false,
        reason: 'usage_limit',
        message: 'This coupon has reached its maximum usage limit.',
      };
    }

    const sub = Number(subtotal) || 0;
    const minOrder = Number(coupon.minOrderValue) || 0;
    if (minOrder > 0 && sub < minOrder) {
      const shortfall = Math.round((minOrder - sub) * 100) / 100;
      return {
        valid: false,
        reason: 'min_order',
        message: `Spend Rs ${this.formatCurrency(shortfall)} more to use this coupon.`,
        minOrderValue: minOrder,
        shortfall,
      };
    }

    const discount = this.calculateDiscountAmount(coupon, sub);
    const discountLabel = this.buildDiscountLabel(coupon);
    const successDetail =
      coupon.discountType === 'percentage'
        ? `${Number(coupon.discountValue || 0)}% discount has been applied.`
        : `Rs ${this.formatCurrency(coupon.discountValue)} discount has been applied.`;

    return {
      valid: true,
      code: coupon.code,
      couponId: String(coupon._id),
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountLabel,
      minOrderValue: minOrder,
      message: `Coupon "${coupon.code}" applied.`,
      successDetail,
    };
  }

  async incrementUsage(couponId) {
    if (!couponId) return null;
    return Coupon.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 } }, { new: true });
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
