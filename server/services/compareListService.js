const { CompareList } = require('../models/compareList');

class CompareListService {
  async list(query) {
    return CompareList.find(query);
  }

  async findExisting(productId, userId) {
    return CompareList.find({ productId, userId });
  }

  async add(body) {
    const compareItem = new CompareList({
      productTitle: body.productTitle,
      image: body.image,
      rating: body.rating,
      price: body.price,
      productId: body.productId,
      userId: body.userId,
    });

    return compareItem.save();
  }

  async findById(id) {
    return CompareList.findById(id);
  }

  async deleteById(id) {
    return CompareList.findByIdAndDelete(id);
  }
}

module.exports = new CompareListService();
