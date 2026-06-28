const { Artisan } = require('../models/artisan');
const { Product } = require('../models/products');

function buildArtisanFilter({ search, status }) {
  const and = [];

  if (status === 'active') and.push({ status: 'active' });
  if (status === 'inactive') and.push({ status: 'inactive' });

  if (search) {
    and.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (!and.length) return {};
  return { $and: and };
}

async function getProductCountsByArtisan(artisans) {
  const counts = {};

  await Promise.all(
    artisans.map(async (artisan) => {
      const count = await Product.countDocuments({
        brand: {
          $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        },
      });
      counts[String(artisan._id)] = count;
    })
  );

  return counts;
}

async function getArtisanStats() {
  const artisans = await Artisan.find({}, 'name status').lean();
  const productCounts = await getProductCountsByArtisan(artisans);
  const activeCount = artisans.filter((a) => (a.status || 'active') === 'active').length;
  const productTotal = Object.values(productCounts).reduce((sum, n) => sum + n, 0);

  return {
    total: artisans.length,
    activeCount,
    inactiveCount: artisans.length - activeCount,
    productTotal,
  };
}

function mapAdminArtisanRow(artisan, productCounts) {
  const id = String(artisan._id);
  return {
    _id: artisan._id,
    id: artisan._id,
    name: artisan.name,
    slug: artisan.slug || '',
    images: artisan.images || [],
    bio: artisan.bio || '',
    location: artisan.location || '',
    story: artisan.story || '',
    social: artisan.social || {},
    status: artisan.status || 'active',
    productCount: productCounts[id] || 0,
    dateCreated: artisan.createdAt,
  };
}

async function listArtisansForAdmin({
  page = 1,
  perPage = 10,
  search = '',
  status = 'all',
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePerPage = Math.min(100, Math.max(1, Number(perPage) || 10));
  const filter = buildArtisanFilter({
    search: String(search || '').trim(),
    status,
  });

  const [total, artisans, stats] = await Promise.all([
    Artisan.countDocuments(filter),
    Artisan.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safePerPage)
      .limit(safePerPage)
      .lean(),
    getArtisanStats(),
  ]);

  const productCounts = await getProductCountsByArtisan(artisans);

  return {
    artisans: artisans.map((artisan) => mapAdminArtisanRow(artisan, productCounts)),
    total,
    page: safePage,
    perPage: safePerPage,
    totalPages: Math.max(1, Math.ceil(total / safePerPage)),
    stats,
  };
}

module.exports = {
  buildArtisanFilter,
  listArtisansForAdmin,
  getArtisanStats,
  getProductCountsByArtisan,
  mapAdminArtisanRow,
};
