const axios = require('axios');
const { Product } = require('../models/products');

class CompareService {
  async compareProducts(body) {
    const { product1Id, product2Id, subcategoryId } = body;

    if (!product1Id || !product2Id) {
      const error = new Error('Missing product IDs');
      error.statusCode = 400;
      error.payload = { message: error.message };
      throw error;
    }

    const product1 = await Product.findOne({ _id: product1Id, subCatId: subcategoryId });
    const product2 = await Product.findOne({ _id: product2Id, subCatId: subcategoryId });

    if (!product1 || !product2) {
      const error = new Error('One or both products not found or not in the same subcategory!');
      error.statusCode = 404;
      error.payload = { message: error.message };
      throw error;
    }

    if (product1.subcategory !== product2.subCatId) {
      const error = new Error('Products belong to different subcategories!');
      error.statusCode = 400;
      error.payload = { message: error.message };
      throw error;
    }

    const aiPrompt = {
      input: {
        product1: { name: product1.name, features: product1.features, price: product1.price },
        product2: { name: product2.name, features: product2.features, price: product2.price },
      },
    };

    const response = await axios.post(process.env.REACT_APP_GEMINI_API_URL, aiPrompt, {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_GOOGLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data || !response.data.generatedText) {
      const error = new Error('Invalid AI response');
      error.statusCode = 500;
      error.payload = { message: error.message };
      throw error;
    }

    return {
      product1: product1.name,
      product2: product2.name,
      comparison: response.data.generatedText,
    };
  }
}

module.exports = new CompareService();
