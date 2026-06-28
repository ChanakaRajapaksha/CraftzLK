const { Artisan } = require('../models/artisan');
const { Product } = require('../models/products');
const { ImageUpload } = require('../models/imageUpload');
const slugify = require('slugify');
const fs = require('fs');

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
        brand: { $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      counts[String(artisan._id)] = count;
    })
  );

  return counts;
}

function getImageNameFromUrl(imgUrl) {
  const urlArr = imgUrl.split('/');
  const image = urlArr[urlArr.length - 1];
  return image.split('.')[0];
}

class ArtisanService {
  async upload(files) {
    const imagesArr = [];

    for (let i = 0; i < files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      await cloudinary.uploader.upload(
        files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${files[i].filename}`);
        }
      );
    }

    const imagesUploaded = new ImageUpload({ images: imagesArr });
    await imagesUploaded.save();
    return imagesArr;
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
      error.payload = { message: error.message };
      throw error;
    }

    const productCount = await Product.countDocuments({
      brand: { $regex: new RegExp(`^${artisan.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    return { artisanData: [mapArtisan(artisan, productCount)] };
  }

  async create(body, uploadedImages) {
    const images =
      Array.isArray(body.images) && body.images.length ? body.images : uploadedImages;

    let artisan = new Artisan({
      name: body.name,
      slug: body.slug || slugify(body.name, { lower: true }),
      images,
      bio: body.bio || '',
      location: body.location || '',
      story: body.story || '',
      social: body.social || {},
      status: body.status === 'inactive' ? 'inactive' : 'active',
    });

    artisan = await artisan.save();
    return { artisan, clearedImages: [] };
  }

  async deleteImage(imgUrl) {
    const imageName = getImageNameFromUrl(imgUrl);
    return cloudinary.uploader.destroy(imageName, () => {});
  }

  async remove(id) {
    const artisan = await Artisan.findById(id);

    if (!artisan) {
      const error = new Error('Artisan not found!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    for (const img of artisan.images || []) {
      const imageName = getImageNameFromUrl(img);
      cloudinary.uploader.destroy(imageName, () => {});
    }

    await Artisan.findByIdAndDelete(id);

    return { success: true, message: 'Artisan deleted!' };
  }

  async update(id, body) {
    const artisan = await Artisan.findByIdAndUpdate(
      id,
      {
        name: body.name,
        slug: body.slug || slugify(body.name || '', { lower: true }),
        images: body.images,
        bio: body.bio || '',
        location: body.location || '',
        story: body.story || '',
        social: body.social || {},
        status: body.status === 'inactive' ? 'inactive' : 'active',
      },
      { new: true }
    );

    if (!artisan) {
      const error = new Error('Artisan cannot be updated!');
      error.statusCode = 500;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    return { artisan, clearedImages: [] };
  }
}

module.exports = new ArtisanService();
