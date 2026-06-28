const { ShippingMethod } = require('../models/shippingMethod');

class ShippingMethodsService {
  mapMethod(doc) {
    return {
      _id: doc._id,
      id: doc._id,
      name: doc.name,
      cost: doc.cost ?? 0,
      deliveryTime: doc.deliveryTime || '',
      zones: doc.zones || [],
      status: doc.status || 'active',
      dateCreated: doc.createdAt,
    };
  }

  async list() {
    return ShippingMethod.find().sort({ createdAt: -1 });
  }

  async findById(id) {
    return ShippingMethod.findById(id);
  }

  async create(body) {
    const entry = new ShippingMethod({
      name: body.name,
      cost: Number(body.cost) || 0,
      deliveryTime: body.deliveryTime || '',
      zones: body.zones || [],
      status: body.status || 'active',
    });

    return entry.save();
  }

  async update(id, body) {
    return ShippingMethod.findByIdAndUpdate(
      id,
      {
        name: body.name,
        cost: Number(body.cost) || 0,
        deliveryTime: body.deliveryTime || '',
        zones: body.zones || [],
        status: body.status || 'active',
      },
      { new: true }
    );
  }

  async deleteById(id) {
    return ShippingMethod.findByIdAndDelete(id);
  }
}

module.exports = new ShippingMethodsService();
