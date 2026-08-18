const productQuestionService = require('../services/productQuestionService');

class ProductQuestionController {
  async listAdmin(_req, res) {
    try {
      const questionList = await productQuestionService.listAdmin();
      return res.status(200).json({
        success: true,
        questionList,
      });
    } catch (error) {
      console.error('Failed to load questions:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load questions.',
      });
    }
  }

  async listStorefront(req, res) {
    try {
      const questionList = await productQuestionService.listStorefront(req.query.productId);
      return res.status(200).json({
        success: true,
        questionList,
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json(error.payload);
      }
      console.error('Failed to load product questions:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load questions.',
      });
    }
  }

  async getById(req, res) {
    try {
      const question = await productQuestionService.getById(req.params.id);
      return res.status(200).json({ success: true, ...question });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false });
    }
  }

  async add(req, res) {
    try {
      const body = {
        ...req.body,
        email: req.user?.email || '',
        customerId: req.user?._id ? String(req.user._id) : req.body?.customerId,
      };
      const question = await productQuestionService.add(body);
      return res.status(201).json({ ...question, success: true });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 401) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to submit question.' });
    }
  }

  async remove(req, res) {
    try {
      const result = await productQuestionService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to delete question.' });
    }
  }

  async saveAnswer(req, res) {
    try {
      const question = await productQuestionService.saveAnswer(req.params.id, req.body);
      return res.status(200).json({ success: true, ...question });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to save answer.' });
    }
  }

  async approveAnswer(req, res) {
    try {
      const question = await productQuestionService.approveAnswer(req.params.id, req.body);
      return res.status(200).json({ success: true, ...question });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to approve answer.' });
    }
  }
}

module.exports = new ProductQuestionController();
