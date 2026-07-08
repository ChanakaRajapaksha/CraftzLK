const mongoose = require('mongoose');
const { Product } = require('../models/products');

function buildProductFilter({ search, status, catId, stock, minPrice, maxPrice }) {
  const and = [];

  if (status === 'active') and.push({ status: 'active' });
  if (status === 'inactive') and.push({ status: 'inactive' });

  if (catId && catId !== 'all') {
    const catOr = [{ catId: String(catId) }];
    if (mongoose.Types.ObjectId.isValid(catId)) {
      catOr.push({ category: new mongoose.Types.ObjectId(catId) });
    }
    and.push({ $or: catOr });
  }

  const min = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : NaN;
  const max = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : NaN;

  if (Number.isFinite(min)) and.push({ price: { $gte: min } });
  if (Number.isFinite(max)) and.push({ price: { $lte: max } });

  if (stock === 'in_stock') and.push({ countInStock: { $gt: 0 } });
  if (stock === 'out_of_stock') and.push({ countInStock: { $lte: 0 } });
  if (stock === 'low_stock') {
    and.push({
      $expr: {
        $and: [
          { $gt: ['$countInStock', 0] },
          { $lte: ['$countInStock', { $ifNull: ['$minStockAlert', 5] }] },
        ],
      },
    });
  }

  if (search) {
    and.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { catName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (!and.length) return {};
  return { $and: and };
}

function normalizePriceBounds(minPrice, maxPrice) {
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
    return { min: 500, max: 25000 };
  }

  let min = minPrice;
  let max = maxPrice;

  if (min === max) {
    min = Math.max(0, min - 500);
    max += 500;
  }

  min = Math.floor(min / 100) * 100;
  max = Math.ceil(max / 100) * 100;

  if (max <= min) max = min + 500;

  return { min, max };
}

async function getProductStats() {
  const [total, activeCount, inactiveCount, outOfStockCount, featuredCount, lowStockCount, priceAgg] =
    await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'inactive' }),
      Product.countDocuments({ countInStock: { $lte: 0 } }),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({
        countInStock: { $gt: 0 },
        $expr: { $lte: ['$countInStock', { $ifNull: ['$minStockAlert', 5] }] },
      }),
      Product.aggregate([
        { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
      ]),
    ]);

  let priceBounds = { min: 500, max: 25000 };
  if (priceAgg[0]) {
    const minPrice = Number(priceAgg[0].minPrice);
    const maxPrice = Number(priceAgg[0].maxPrice);
    if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
      priceBounds = normalizePriceBounds(minPrice, maxPrice);
    }
  }

  return {
    total,
    activeCount,
    inactiveCount,
    lowStockCount,
    outOfStockCount,
    featuredCount,
    priceBounds,
  };
}

function mapAdminProductRow(product) {
  return {
    _id: product._id,
    id: product._id,
    name: product.name,
    sku: product.sku || '',
    catName: product.catName || '',
    catId: product.catId || '',
    brand: product.brand || '',
    price: product.price,
    countInStock: product.countInStock,
    minStockAlert: product.minStockAlert ?? 5,
    status: product.status || 'active',
    isFeatured: Boolean(product.isFeatured),
    images: product.images || [],
    dateCreated: product.dateCreated,
  };
}

async function listProductsForAdmin({
  page = 1,
  perPage = 10,
  search = '',
  status = 'all',
  catId = 'all',
  stock = 'all',
  minPrice,
  maxPrice,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePerPage = Math.min(10000, Math.max(1, Number(perPage) || 10));
  const filter = buildProductFilter({
    search: String(search || '').trim(),
    status,
    catId,
    stock,
    minPrice,
    maxPrice,
  });

  const [total, products, stats] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort({ dateCreated: -1 })
      .skip((safePage - 1) * safePerPage)
      .limit(safePerPage)
      .lean(),
    getProductStats(),
  ]);

  return {
    products: products.map(mapAdminProductRow),
    total,
    page: safePage,
    perPage: safePerPage,
    totalPages: Math.max(1, Math.ceil(total / safePerPage)),
    stats,
  };
}

module.exports = {
  buildProductFilter,
  listProductsForAdmin,
  getProductStats,
  mapAdminProductRow,
};
