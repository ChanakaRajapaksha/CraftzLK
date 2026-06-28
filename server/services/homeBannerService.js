const { HomeBanner } = require('../models/homeBanner');
const { ImageUpload } = require('../models/imageUpload');
const fs = require('fs');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

function getImageNameFromUrl(imgUrl) {
  const urlArr = imgUrl.split('/');
  const image = urlArr[urlArr.length - 1];
  return image.split('.')[0];
}

class HomeBannerService {
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
    const bannerImagesList = await HomeBanner.find();

    if (!bannerImagesList) {
      const error = new Error('Failed to load home banners');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    return bannerImagesList;
  }

  async getById(id) {
    const slide = await HomeBanner.findById(id);

    if (!slide) {
      const error = new Error('The slide with the given ID was not found.');
      error.statusCode = 500;
      error.payload = { message: error.message };
      throw error;
    }

    return slide;
  }

  async create(uploadedImages) {
    let newEntry = new HomeBanner({
      images: uploadedImages,
    });

    if (!newEntry) {
      const error = new Error('Failed to create home banner');
      error.statusCode = 500;
      error.payload = { success: false };
      throw error;
    }

    newEntry = await newEntry.save();
    return { entry: newEntry, clearedImages: [] };
  }

  async deleteImage(imgUrl) {
    const imageName = getImageNameFromUrl(imgUrl);
    return cloudinary.uploader.destroy(imageName, () => {});
  }

  async remove(id) {
    const item = await HomeBanner.findById(id);
    const images = item.images;

    for (const img of images) {
      const imageName = getImageNameFromUrl(img);
      cloudinary.uploader.destroy(imageName, () => {});
    }

    const deletedItem = await HomeBanner.findByIdAndDelete(id);

    if (!deletedItem) {
      const error = new Error('Slide not found!');
      error.statusCode = 404;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    return { success: true, message: 'Slide Deleted!' };
  }

  async update(id, body) {
    const slideItem = await HomeBanner.findByIdAndUpdate(
      id,
      { images: body.images },
      { new: true }
    );

    if (!slideItem) {
      const error = new Error('Item cannot be updated!');
      error.statusCode = 500;
      error.payload = { message: error.message, success: false };
      throw error;
    }

    return { entry: slideItem, clearedImages: [] };
  }
}

module.exports = new HomeBannerService();
