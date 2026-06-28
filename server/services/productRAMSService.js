const { ProductRams } = require('../models/productRAMS.js');

class ProductRAMSService {
  async list() {
    return ProductRams.find();
  }

  async findById(id) {
    return ProductRams.findById(id);
  }

  async create(body) {
    const productRAMS = new ProductRams({
      productRam: body.productRam,
    });

    return productRAMS.save();
  }

  async deleteById(id) {
    return ProductRams.findByIdAndDelete(id);
  }

  async update(id, body) {
    return ProductRams.findByIdAndUpdate(
      id,
      {
        productRam: body.productRam,
      },
      { new: true }
    );
  }
}

module.exports = new ProductRAMSService();
