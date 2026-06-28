const { ProductWeight } = require('../models/productWeight');

class ProductWeightService {
  async list() {
    return ProductWeight.find();
  }

  async findById(id) {
    return ProductWeight.findById(id);
  }

  async create(body) {
    const productWeight = new ProductWeight({
      productWeight: body.productWeight,
    });

    return productWeight.save();
  }

  async deleteById(id) {
    return ProductWeight.findByIdAndDelete(id);
  }

  async update(id, body) {
    return ProductWeight.findByIdAndUpdate(
      id,
      {
        productWeight: body.productWeight,
      },
      { new: true }
    );
  }
}

module.exports = new ProductWeightService();
