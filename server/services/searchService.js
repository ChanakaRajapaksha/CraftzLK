const { Product } = require('../models/products.js');

class SearchService {
  buildSearchFilter(query) {
    return {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { catName: { $regex: query, $options: 'i' } },
      ],
    };
  }

  async searchWithPagination(query, page, perPage) {
    const items = await Product.find(this.buildSearchFilter(query)).populate('category');

    const totalPosts = await items.length;
    const totalPages = Math.ceil(totalPosts / perPage);

    return {
      products: items,
      totalPages,
      page,
    };
  }

  async searchAll(query) {
    return Product.find(this.buildSearchFilter(query));
  }
}

module.exports = new SearchService();
