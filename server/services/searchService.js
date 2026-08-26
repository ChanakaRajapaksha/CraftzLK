const { Product } = require('../models/products.js');
const { Category } = require('../models/category.js');
const { SubCategory } = require('../models/subCat.js');

const PREVIEW_LIMIT = 5;

class SearchService {
  buildSearchFilter(query) {
    return {
      status: 'active',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { catName: { $regex: query, $options: 'i' } },
        { subCatName: { $regex: query, $options: 'i' } },
      ],
    };
  }

  buildCategoryFilter(query) {
    return {
      status: 'active',
      name: { $regex: query, $options: 'i' },
    };
  }

  async searchWithPagination(query, page, perPage) {
    const filter = this.buildSearchFilter(query);
    const totalPosts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage) || 1;

    const products = await Product.find(filter)
      .populate('category')
      .skip((page - 1) * perPage)
      .limit(perPage);

    return {
      products,
      totalPages,
      page,
      totalProducts: totalPosts,
    };
  }

  async searchAll(query) {
    return Product.find(this.buildSearchFilter(query)).populate('category');
  }

  async searchPreview(query, limit = PREVIEW_LIMIT) {
    const productFilter = this.buildSearchFilter(query);
    const categoryFilter = this.buildCategoryFilter(query);

    const [products, categories, subCategories, totalProducts, totalCategories] =
      await Promise.all([
        Product.find(productFilter)
          .select('name price oldPrice discountPrice discount images slug catName subCatName')
          .limit(limit)
          .lean({ virtuals: true }),
        Category.find(categoryFilter)
          .select('name slug images')
          .limit(limit)
          .lean({ virtuals: true }),
        SubCategory.find({ subCat: { $regex: query, $options: 'i' } })
          .populate('category', 'name slug id status')
          .limit(limit)
          .lean(),
        Product.countDocuments(productFilter),
        Category.countDocuments(categoryFilter),
      ]);

    const activeSubCategories = subCategories.filter(
      (item) => !item.category || item.category.status !== 'inactive'
    );

    const suggestions = [
      ...categories.map((cat) => ({
        type: 'category',
        id: cat._id?.toString() || cat.id,
        name: cat.name,
        image: cat.images?.[0] || '',
        href: `/products/category/${cat._id?.toString() || cat.id}`,
      })),
      ...activeSubCategories.map((sub) => ({
        type: 'subcategory',
        id: sub._id?.toString() || sub.id,
        name: sub.subCat,
        image: sub.category?.images?.[0] || '',
        href: `/products/subCat/${sub._id?.toString() || sub.id}`,
      })),
    ].slice(0, limit);

    return {
      products,
      categories,
      subCategories: activeSubCategories,
      suggestions,
      totalProducts,
      totalCategories: totalCategories + activeSubCategories.length,
    };
  }

  async getPopularSearches(limit = 8) {
    const categories = await Category.find({ status: 'active' })
      .select('name slug images')
      .sort({ name: 1 })
      .limit(limit)
      .lean({ virtuals: true });

    return categories.map((cat) => ({
      id: cat._id?.toString() || cat.id,
      label: cat.name,
      query: cat.name,
      type: 'category',
      href: `/products/category/${cat._id?.toString() || cat.id}`,
    }));
  }
}

module.exports = new SearchService();
