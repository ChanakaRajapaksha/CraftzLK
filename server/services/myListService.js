const { MyList } = require('../models/myList');

class MyListService {
  async list(query) {
    return MyList.find(query);
  }

  async findExisting(productId, userId) {
    return MyList.find({ productId, userId });
  }

  async add(body) {
    const list = new MyList({
      productTitle: body.productTitle,
      image: body.image,
      rating: body.rating,
      price: body.price,
      productId: body.productId,
      userId: body.userId,
    });

    return list.save();
  }

  async findById(id) {
    return MyList.findById(id);
  }

  async deleteById(id) {
    return MyList.findByIdAndDelete(id);
  }
}

module.exports = new MyListService();
