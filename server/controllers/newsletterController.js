const newsletterService = require("../services/newsletterService");

class NewsletterController {
  async subscribe(req, res) {
    try {
      const { email, source } = req.body || {};
      const result = await newsletterService.subscribe({ email, source });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || {
          success: false,
          message: error.message || "Failed to subscribe.",
        }
      );
    }
  }

  async status(req, res) {
    try {
      const email = req.body?.email || req.query?.email;
      const result = await newsletterService.getStatus(email);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || {
          success: false,
          message: error.message || "Failed to check subscription status.",
        }
      );
    }
  }

  async resendConfirmation(req, res) {
    try {
      const { email } = req.body || {};
      const result = await newsletterService.resendConfirmation(email);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || {
          success: false,
          message: error.message || "Failed to resend confirmation email.",
        }
      );
    }
  }

  async confirm(req, res) {
    try {
      const token = req.params.token || req.query.token || req.body?.token;
      const result = await newsletterService.confirmSubscription(token);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || {
          success: false,
          message: error.message || "Failed to confirm subscription.",
        }
      );
    }
  }

  async unsubscribe(req, res) {
    try {
      const token = req.params.token || req.query.token || req.body?.token;
      const result = await newsletterService.unsubscribe(token);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json(
        error.payload || {
          success: false,
          message: error.message || "Failed to unsubscribe.",
        }
      );
    }
  }

  async list(req, res) {
    try {
      const subscribers = await newsletterService.listSubscribers();
      return res.status(200).json({
        success: true,
        subscribers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load newsletter subscribers.",
      });
    }
  }
}

module.exports = new NewsletterController();
