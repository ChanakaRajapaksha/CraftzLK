const { ProductSize } = require('../models/productSize');

class ProductSizeService {
  async list() {
    return ProductSize.find();
  }

  async findById(id) {
    return ProductSize.findById(id);
  }

  async create(body) {
    const productsize = new ProductSize({
      size: body.size,
    });

    return productsize.save();
  }

  async deleteById(id) {
    return ProductSize.findByIdAndDelete(id);
  }

  async update(id, body) {
    return ProductSize.findByIdAndUpdate(
      id,
      {
        size: body.size,
      },
      { new: true }
    );
  }
}

module.exports = new ProductSizeService();
