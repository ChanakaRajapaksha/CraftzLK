const productReviewService = require('../services/productReviewService');

class ProductReviewController {
  async list(req, res) {
    try {
      const result = await productReviewService.list(req.query);

      if (result.type === 'raw') {
        return res.status(200).json(result.reviews);
      }

      return res.status(200).json({
        success: true,
        reviewList: result.reviewList,
      });
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getCount(req, res) {
    try {
      const productsReviews = await productReviewService.getCount();
      return res.send({ productsReviews });
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getById(req, res) {
    try {
      const review = await productReviewService.getById(req.params.id);
      return res.status(200).json(review);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false });
    }
  }

  async add(req, res) {
    try {
      const review = await productReviewService.add(req.body);
      return res.status(201).json(review);
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async updateStatus(req, res) {
    try {
      const review = await productReviewService.updateStatus(req.params.id, req.body.status);
      return res.status(200).json(review);
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 404) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to update review status.' });
    }
  }

  async remove(req, res) {
    try {
      const result = await productReviewService.remove(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to delete review.' });
    }
  }
}

module.exports = new ProductReviewController();
