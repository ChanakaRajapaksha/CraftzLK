const { Artisan } = require('../models/artisan');
const { Product } = require('../models/products');
const { ImageUpload } = require('../models/imageUpload');
const slugify = require('slugify');
const { destroyAsset, getPublicIdFromUrl, removeLocalFile } = require('../utils/cloudinaryAssets');
const { isCloudinaryConfigured } = require('../utils/cloudinary');
const { listArtisansForAdmin } = require('../utils/artisanAdmin');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const mapArtisan = (artisan, productCount = 0) => ({
  _id: artisan._id,
  id: artisan._id,
  name: artisan.name,
  slug: artisan.slug,
  images: artisan.images || [],
  bio: artisan.bio || '',
  location: artisan.location || '',
  story: artisan.story || '',
  social: artisan.social || {},
  status: artisan.status || 'active',
  productCount,
  dateCreated: artisan.createdAt,
});

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

async function destroyArtisanImages(images = []) {
  await Promise.all(
    images.map(async (imgUrl) => {
      const publicId = getPublicIdFromUrl(imgUrl);
      if (publicId) await destroyAsset(publicId);
    })
  );
}

class ArtisanService {
  async uploadImages(files) {
    const imagesArr = [];

    for (let i = 0; i < (files?.length || 0); i++) {
      const file = files[i];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'craftzlk/artisans',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      });
      imagesArr.push(result.secure_url);
      removeLocalFile(file.path);
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return imagesArr;
  }

  cleanupUploadFiles(files) {
    (files || []).forEach((file) => removeLocalFile(file.path));
  }

  async adminList(query) {
    return listArtisansForAdmin({
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      status: query.status,
    });
  }

  async list() {
    const artisanList = await Artisan.find().sort({ createdAt: -1 });

    if (!artisanList) {
      const error = new Error('Failed to load artisans');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    const productCounts = await getProductCountsByArtisan(artisanList);

    return {
      artisanList: artisanList.map((artisan) =>
        mapArtisan(artisan, productCounts[String(artisan._id)] || 0)
      ),
    };
  }

  async getCount() {
    const artisanCount = await Artisan.countDocuments();
    return { artisanCount };
  }

  async getById(id) {
    const artisan = await Artisan.findById(id);

    if (!artisan) {
      const error = new Error('The artisan with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    const productCount = await Product.countDocuments({
      brand: {
        $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      },
    });

    return {
      success: true,
      artisan: mapArtisan(artisan, productCount),
      artisanData: [mapArtisan(artisan, productCount)],
    };
  }

  async create(body) {
    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];

    if (!body.name?.trim()) {
      const error = new Error('Artisan name is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!body.location?.trim()) {
      const error = new Error('Location is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    try {
      const artisan = await Artisan.create({
        name: body.name.trim(),
        slug: body.slug || slugify(body.name, { lower: true }),
        images,
        bio: body.bio || '',
        location: body.location.trim(),
        story: body.story || '',
        social: body.social || {},
        status: body.status === 'inactive' ? 'inactive' : 'active',
      });

      return { success: true, artisan };
    } catch (error) {
      if (error?.code === 11000) {
        const dupError = new Error('An artisan with this slug already exists.');
        dupError.statusCode = 409;
        dupError.payload = { success: false, message: dupError.message };
        throw dupError;
      }
      throw error;
    }
  }

  async deleteImage(imgUrl) {
    const publicId = getPublicIdFromUrl(imgUrl);

    if (!publicId) {
      const error = new Error('Invalid image URL.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return cloudinary.uploader.destroy(publicId);
  }

  async remove(id) {
    const artisan = await Artisan.findById(id);

    if (!artisan) {
      const error = new Error('Artisan not found!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    const productCount = await Product.countDocuments({
      brand: {
        $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      },
    });

    if (productCount > 0) {
      const error = new Error('Cannot delete an artisan that has linked products.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    await destroyArtisanImages(artisan.images || []);
    await Artisan.findByIdAndDelete(id);

    return { success: true, message: 'Artisan deleted!' };
  }

  async update(id, body) {
    const existing = await Artisan.findById(id);

    if (!existing) {
      const error = new Error('Artisan cannot be updated!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : existing.images;

    if (!body.name?.trim()) {
      const error = new Error('Artisan name is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!body.location?.trim()) {
      const error = new Error('Location is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    try {
      const artisan = await Artisan.findByIdAndUpdate(
        id,
        {
          name: body.name.trim(),
          slug: body.slug || slugify(body.name || '', { lower: true }),
          images,
          bio: body.bio || '',
          location: body.location.trim(),
          story: body.story || '',
          social: body.social || {},
          status: body.status === 'inactive' ? 'inactive' : 'active',
        },
        { new: true }
      );

      return { success: true, artisan };
    } catch (error) {
      if (error?.code === 11000) {
        const dupError = new Error('An artisan with this slug already exists.');
        dupError.statusCode = 409;
        dupError.payload = { success: false, message: dupError.message };
        throw dupError;
      }
      throw error;
    }
  }
}

module.exports = new ArtisanService();
