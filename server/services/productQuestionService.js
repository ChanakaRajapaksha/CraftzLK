const mongoose = require('mongoose');
const { ProductQuestions } = require('../models/productQuestions');
const { Product } = require('../models/products');

function isValidObjectId(value) {
  if (!mongoose.Types.ObjectId.isValid(value)) return false;
  return String(new mongoose.Types.ObjectId(value)) === String(value);
}

async function resolveProductName(productId, fallback = '') {
  const trimmed = String(productId || '').trim();
  if (!trimmed) return fallback;
  if (!isValidObjectId(trimmed)) return fallback;

  const product = await Product.findById(trimmed).select('name');
  return product?.name || fallback;
}

function mapQuestion(doc) {
  return {
    _id: doc._id,
    id: doc._id,
    productId: doc.productId,
    productName: doc.productName || '',
    customerId: doc.customerId,
    customerName: doc.customerName,
    email: doc.email || '',
    question: doc.question || '',
    status: doc.status || 'pending',
    answer: doc.answer || '',
    answerAuthor: doc.answerAuthor || 'CraftzLK',
    answerDate: doc.answerDate || null,
    dateCreated: doc.dateCreated,
  };
}

function mapStorefrontQuestion(doc) {
  const mapped = mapQuestion(doc);
  return {
    _id: mapped._id,
    id: mapped.id,
    name: mapped.customerName,
    dateCreated: mapped.dateCreated,
    question: mapped.question,
    answer: mapped.answer,
    answerAuthor: mapped.answerAuthor,
    answerDate: mapped.answerDate,
  };
}

class ProductQuestionService {
  async listAdmin() {
    const questions = await ProductQuestions.find().sort({ dateCreated: -1 });
    return questions.map(mapQuestion);
  }

  async listStorefront(productId) {
    const trimmed = String(productId || '').trim();
    if (!trimmed) {
      const error = new Error('Product is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const questions = await ProductQuestions.find({
      productId: trimmed,
      status: 'answered',
      answer: { $nin: ['', null] },
    }).sort({ answerDate: -1, dateCreated: -1 });

    return questions.map(mapStorefrontQuestion);
  }

  async getById(id) {
    const question = await ProductQuestions.findById(id);
    if (!question) {
      const error = new Error('The question with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return mapQuestion(question);
  }

  async add(body) {
    const questionText = String(body.question || '').trim();
    if (!questionText) {
      const error = new Error('Question is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!String(body.productId || '').trim()) {
      const error = new Error('Product is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (!String(body.customerId || '').trim()) {
      const error = new Error('Login is required to submit a question.');
      error.statusCode = 401;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const productId = String(body.productId).trim();
    let productName = String(body.productName || '').trim();
    if (!productName) {
      productName = await resolveProductName(productId, productName);
    }

    const doc = await ProductQuestions.create({
      productId,
      productName,
      customerId: String(body.customerId),
      customerName: String(body.customerName || 'Customer').trim(),
      email: String(body.email || '').trim(),
      question: questionText,
      status: 'pending',
    });

    return mapQuestion(doc);
  }

  async remove(id) {
    const deleted = await ProductQuestions.findByIdAndDelete(id);
    if (!deleted) {
      const error = new Error('Question not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }
    return { success: true, message: 'Question deleted.' };
  }

  async saveAnswer(id, body = {}) {
    const answerText = String(body.answer || '').trim();
    if (!answerText) {
      const error = new Error('Answer is required.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    const question = await ProductQuestions.findById(id);
    if (!question) {
      const error = new Error('The question with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    question.answer = answerText;
    question.answerAuthor =
      String(body.answerAuthor || question.answerAuthor || 'CraftzLK').trim() || 'CraftzLK';

    await question.save();
    return mapQuestion(question);
  }

  async approveAnswer(id, body = {}) {
    const question = await ProductQuestions.findById(id);
    if (!question) {
      const error = new Error('The question with the given ID was not found.');
      error.statusCode = 404;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    if (body.answer !== undefined) {
      const answerText = String(body.answer || '').trim();
      if (!answerText) {
        const error = new Error('Answer is required.');
        error.statusCode = 400;
        error.payload = { success: false, message: error.message };
        throw error;
      }
      question.answer = answerText;
      question.answerAuthor =
        String(body.answerAuthor || question.answerAuthor || 'CraftzLK').trim() || 'CraftzLK';
    }

    const answerText = String(question.answer || '').trim();
    if (!answerText) {
      const error = new Error('Save an answer before approving.');
      error.statusCode = 400;
      error.payload = { success: false, message: error.message };
      throw error;
    }

    question.status = 'answered';
    question.answerDate = new Date();
    if (!question.answerAuthor) {
      question.answerAuthor = 'CraftzLK';
    }

    await question.save();
    return mapQuestion(question);
  }
}

module.exports = new ProductQuestionService();
