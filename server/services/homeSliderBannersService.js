const { HomeSliderBanner } = require('../models/homeSliderBanner');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

const mapBanner = (doc) => ({
  _id: doc._id,
  id: doc._id,
  heading: doc.heading,
  title: doc.title || doc.heading,
  description: doc.description || '',
  buttonText: doc.buttonText || 'Shop Now',
  buttonUrl: doc.buttonUrl || '',
  link: doc.link || doc.buttonUrl || '',
  desktopImage: doc.desktopImage || '',
  mobileImage: doc.mobileImage || '',
  displayOrder: doc.displayOrder ?? 0,
  status: doc.status || 'active',
  dateCreated: doc.createdAt,
});

function getImageNameFromUrl(imgUrl) {
  const urlArr = imgUrl.split('/');
  const image = urlArr[urlArr.length - 1];
  return image.split('.')[0];
}

class HomeSliderBannersService {
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

    return imagesArr;
  }

  async list() {
    const list = await HomeSliderBanner.find().sort({ displayOrder: 1, createdAt: -1 });
    return {
      success: true,
      bannerList: list.map(mapBanner),
    };
  }

  async getById(id) {
    const item = await HomeSliderBanner.findById(id);
    if (!item) {
      const error = new Error('Banner not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return mapBanner(item);
  }

  async create(body) {
    if (!String(body?.heading || '').trim()) {
      const error = new Error('Heading is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const desktopImage = body.desktopImage || '';
    const mobileImage = body.mobileImage || '';
    if (!desktopImage && !mobileImage) {
      const error = new Error('Upload at least one banner image.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const entry = new HomeSliderBanner({
      heading: String(body.heading).trim(),
      title: body.title || body.heading,
      description: body.description || '',
      buttonText: body.buttonText || 'Shop Now',
      buttonUrl: body.buttonUrl || '',
      link: body.link || body.buttonUrl || '',
      desktopImage,
      mobileImage,
      displayOrder: Number(body.displayOrder) || 0,
      status: body.status || 'active',
    });

    const saved = await entry.save();
    return mapBanner(saved);
  }

  async update(id, body) {
    if (!String(body?.heading || '').trim()) {
      const error = new Error('Heading is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const desktopImage = body.desktopImage || '';
    const mobileImage = body.mobileImage || '';
    if (!desktopImage && !mobileImage) {
      const error = new Error('Upload at least one banner image.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const updated = await HomeSliderBanner.findByIdAndUpdate(
      id,
      {
        heading: String(body.heading).trim(),
        title: body.title || body.heading,
        description: body.description || '',
        buttonText: body.buttonText || 'Shop Now',
        buttonUrl: body.buttonUrl || '',
        link: body.link || body.buttonUrl || '',
        desktopImage,
        mobileImage,
        displayOrder: Number(body.displayOrder) || 0,
        status: body.status || 'active',
      },
      { new: true }
    );

    if (!updated) {
      const error = new Error('Banner not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    return mapBanner(updated);
  }

  async deleteImage(imgUrl) {
    const imageName = getImageNameFromUrl(imgUrl);
    return cloudinary.uploader.destroy(imageName, () => {});
  }

  async remove(id) {
    const item = await HomeSliderBanner.findById(id);
    if (!item) {
      const error = new Error('Banner not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    for (const img of [item.desktopImage, item.mobileImage].filter(Boolean)) {
      const imageName = getImageNameFromUrl(img);
      cloudinary.uploader.destroy(imageName, () => {});
    }

    await HomeSliderBanner.findByIdAndDelete(id);
    return { success: true, message: 'Banner deleted.' };
  }
}

module.exports = new HomeSliderBannersService();
