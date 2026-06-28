const notificationService = require('../services/notificationService');

class NotificationController {
  async getSettings(req, res) {
    try {
      const settings = await notificationService.getSettings();
      return res.status(200).json({
        success: true,
        settings,
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load notification settings.' });
    }
  }

  async updateSettings(req, res) {
    try {
      const settings = await notificationService.updateSettings(req.body);
      return res.status(200).json({
        success: true,
        settings,
      });
    } catch (error) {
      console.error('[notifications/settings PUT]', error);
      return res.status(500).json({ success: false, message: 'Failed to update notification settings.' });
    }
  }

  async getTemplates(req, res) {
    try {
      const templateList = await notificationService.getTemplates();
      return res.status(200).json({
        success: true,
        templateList,
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load templates.' });
    }
  }

  async getTemplateById(req, res) {
    try {
      const template = await notificationService.getTemplateById(req.params.id);
      return res.status(200).json(template);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to load template.' });
    }
  }

  async updateTemplate(req, res) {
    try {
      const template = await notificationService.updateTemplate(req.params.id, req.body);
      return res.status(200).json(template);
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json(error.payload);
      }
      return res.status(500).json({ success: false, message: 'Failed to update template.' });
    }
  }
}

module.exports = new NotificationController();
