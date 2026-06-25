const { Category } = require("../models/category");
const { Product } = require("../models/products");

function buildCategoryFilter({ search, status, parentType }) {
  const and = [];

  if (status === "active") and.push({ status: "active" });
  if (status === "inactive") and.push({ status: "inactive" });

  if (parentType === "main") {
    and.push({
      $or: [{ parentId: null }, { parentId: { $exists: false } }],
    });
  }

  if (parentType === "sub") {
    and.push({ parentId: { $exists: true, $ne: null } });
  }

  if (search) {
    and.push({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (!and.length) return {};
  return { $and: and };
}

async function getProductCountMap() {
  const products = await Product.find({}, "catId subCatId category").lean();
  const map = {};

  products.forEach((product) => {
    const catId = product.catId || (product.category ? String(product.category) : "");
    const subCatId = product.subCatId;

    if (catId) map[catId] = (map[catId] || 0) + 1;
    if (subCatId) map[subCatId] = (map[subCatId] || 0) + 1;
  });

  return map;
}

async function getCategoryStats() {
  const [total, mainCount, subCount, activeCount] = await Promise.all([
    Category.countDocuments(),
    Category.countDocuments({
      $or: [{ parentId: null }, { parentId: { $exists: false } }],
    }),
    Category.countDocuments({ parentId: { $exists: true, $ne: null } }),
    Category.countDocuments({ status: "active" }),
  ]);

  return { total, mainCount, subCount, activeCount };
}

function mapAdminCategoryRow(category, parentMap, productCounts) {
  const id = String(category._id);
  const parentId = category.parentId ? String(category.parentId) : null;
  const isMain = !parentId;

  return {
    _id: category._id,
    id: category._id,
    name: category.name,
    images: category.images || [],
    color: category.color || "",
    slug: category.slug || "",
    parentId,
    parentName: parentId ? parentMap.get(parentId) || "—" : "—",
    description: category.description || "",
    status: category.status || "active",
    seo: category.seo || {},
    isMain,
    productCount: productCounts[id] || 0,
  };
}

async function listCategoriesForAdmin({ page = 1, perPage = 10, search = "", status = "all", parentType = "all" }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePerPage = Math.min(100, Math.max(1, Number(perPage) || 10));
  const filter = buildCategoryFilter({
    search: String(search || "").trim(),
    status,
    parentType,
  });

  const [total, categories, productCounts, stats, parents] = await Promise.all([
    Category.countDocuments(filter),
    Category.find(filter)
      .sort({ parentId: 1, name: 1 })
      .skip((safePage - 1) * safePerPage)
      .limit(safePerPage)
      .lean(),
    getProductCountMap(),
    getCategoryStats(),
    Category.find({}, "name").lean(),
  ]);

  const parentMap = new Map(parents.map((item) => [String(item._id), item.name]));

  return {
    categories: categories.map((category) =>
      mapAdminCategoryRow(category, parentMap, productCounts)
    ),
    total,
    page: safePage,
    perPage: safePerPage,
    totalPages: Math.max(1, Math.ceil(total / safePerPage)),
    stats,
  };
}

module.exports = {
  buildCategoryFilter,
  listCategoriesForAdmin,
  getCategoryStats,
  getProductCountMap,
};
