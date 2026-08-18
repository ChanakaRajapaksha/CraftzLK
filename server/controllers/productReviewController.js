const productReviewService = require('../services/productReviewService');
const adminNotificationsService = require('../services/adminNotificationsService');

class ProductReviewController {
  async list(req, res) {
    try {
      const result = await productReviewService.list(req.query);

      if (result.type === 'storefront') {
        return res.status(200).json({
          success: true,
          reviewList: result.reviewList,
          averageRating: result.averageRating,
          reviewCount: result.reviewCount,
        });
      }

      return res.status(200).json({
        success: true,
        reviewList: result.reviewList,
      });
    } catch (error) {
      console.error('Failed to load reviews:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load reviews.',
      });
    }
  }

  async listAdmin(_req, res) {
    try {
      const result = await productReviewService.list({});
      return res.status(200).json({
        success: true,
        reviewList: result.reviewList || [],
      });
    } catch (error) {
      console.error('Failed to load admin reviews:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load reviews.',
      });
    }
  }

  async getCount(_req, res) {
    try {
      const productsReviews = await productReviewService.getCount();
      return res.send({ productsReviews });
    } catch {
      return res.status(500).json({ success: false });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await productReviewService.getApprovedStats(req.query?.productId);
      return res.status(200).json({
        success: true,
        averageRating: stats.averageRating,
        reviewCount: stats.reviewCount,
        distribution: stats.distribution,
      });
    } catch (error) {
      console.error('Failed to load review stats:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load review stats.',
      });
    }
  }

  async getAll(req, res) {
    try {
      const result = await productReviewService.getAll(req.query);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Failed to load reviews:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load reviews.',
      });
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
      const body = {
        ...req.body,
        email: req.user?.email || req.body?.email || "",
        customerId: req.user?._id
          ? String(req.user._id)
          : req.body?.customerId,
      };
      const review = await productReviewService.add(body);
      try {
        await adminNotificationsService.notifyNewReview({
          productName: review.productName || body.productName,
          customerRating: review.customerRating || body.customerRating,
        });
      } catch (notifyError) {
        console.error('Failed to create admin review notification:', notifyError);
      }
      return res.status(201).json({ success: true, ...review });
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 401) {
        return res.status(error.statusCode).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
  }

  async upload(req, res) {
    try {
      const imagesArr = await productReviewService.upload(req.files);
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.error('Failed to upload review image:', error);
      return res.status(500).json({ success: false, message: 'Failed to upload image.' });
    }
  }

  async deleteImage(req, res) {
    try {
      const response = await productReviewService.deleteImage(req.query.img);
      return res.status(200).send(response || { success: true });
    } catch (error) {
      console.error('Failed to delete review image:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete image.' });
    }
  }

  async approve(req, res) {
    try {
      const review = await productReviewService.approve(req.params.id);
      return res.status(200).json({ success: true, ...review });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to approve review.' });
    }
  }

  async reject(req, res) {
    try {
      const review = await productReviewService.reject(req.params.id);
      return res.status(200).json({ success: true, ...review });
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to reject review.' });
    }
  }

  async updateStatus(req, res) {
    try {
      const review = await productReviewService.updateStatus(req.params.id, req.body.status);
      return res.status(200).json({ success: true, ...review });
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
