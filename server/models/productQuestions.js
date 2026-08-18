const mongoose = require('mongoose');

const productQuestionsSchema = mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    default: '',
  },
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: '',
  },
  question: {
    type: String,
    required: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'archived'],
    default: 'pending',
  },
  answer: {
    type: String,
    default: '',
  },
  answerAuthor: {
    type: String,
    default: 'CraftzLK',
  },
  answerDate: {
    type: Date,
    default: null,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

productQuestionsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

productQuestionsSchema.set('toJSON', {
  virtuals: true,
});

exports.ProductQuestions = mongoose.model('ProductQuestions', productQuestionsSchema);
exports.productQuestionsSchema = productQuestionsSchema;
