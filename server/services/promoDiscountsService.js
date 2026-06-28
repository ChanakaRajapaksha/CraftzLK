const { PromoDiscount } = require('../models/promoDiscount');

class PromoDiscountsService {
  mapDiscount(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      name: doc.name,
      type: doc.type,
      discountType: doc.discountType,
      discountValue: doc.discountValue,
      productIds: doc.productIds || [],
      productNames: doc.productNames || [],
      categoryId: doc.categoryId || '',
      categoryName: doc.categoryName || '',
      description: doc.description || '',
      startDate: doc.startDate,
      endDate: doc.endDate,
      status: doc.status || 'active',
      dateCreated: doc.createdAt,
    };
  }

  deriveStatus(discount) {
    if (discount.status === 'inactive') return 'inactive';
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) return 'scheduled';
    if (discount.endDate && new Date(discount.endDate) < now) return 'expired';
    return discount.status || 'active';
  }

  async list() {
    return PromoDiscount.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return PromoDiscount.findById(id);
  }

  async create(body) {
    const entry = new PromoDiscount({
      name: body.name,
      type: body.type,
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue) || 0,
      productIds: body.productIds || [],
      productNames: body.productNames || [],
      categoryId: body.categoryId || '',
      categoryName: body.categoryName || '',
      description: body.description || '',
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || 'active',
    });

    return entry.save();
  }

  async update(id, body) {
    return PromoDiscount.findByIdAndUpdate(
      id,
      {
        name: body.name,
        type: body.type,
        discountType: body.discountType || 'percentage',
        discountValue: Number(body.discountValue) || 0,
        productIds: body.productIds || [],
        productNames: body.productNames || [],
        categoryId: body.categoryId || '',
        categoryName: body.categoryName || '',
        description: body.description || '',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || 'active',
      },
      { new: true }
    );
  }

  async deleteById(id) {
    return PromoDiscount.findByIdAndDelete(id);
  }
}

module.exports = new PromoDiscountsService();
