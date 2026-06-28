const promoDiscountsService = require('../services/promoDiscountsService');

class PromoDiscountsController {
  async list(req, res) {
    try {
      const list = await promoDiscountsService.list();
      return res.status(200).json({
        success: true,
        discountList: list.map((item) => {
          const mapped = promoDiscountsService.mapDiscount(item);
          mapped.status = promoDiscountsService.deriveStatus(item);
          return mapped;
        }),
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load discounts.' });
    }
  }

  async getById(req, res) {
    try {
      const item = await promoDiscountsService.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Discount not found.' });
      }
      const mapped = promoDiscountsService.mapDiscount(item);
      mapped.status = promoDiscountsService.deriveStatus(item);
      return res.status(200).json(mapped);
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load discount.' });
    }
  }

  async create(req, res) {
    try {
      const saved = await promoDiscountsService.create(req.body);
      return res.status(201).json(promoDiscountsService.mapDiscount(saved));
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to create discount.' });
    }
  }

  async update(req, res) {
    try {
      const updated = await promoDiscountsService.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Discount not found.' });
      }

      return res.status(200).json(promoDiscountsService.mapDiscount(updated));
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to update discount.' });
    }
  }

  async remove(req, res) {
    try {
      const deleted = await promoDiscountsService.deleteById(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Discount not found.' });
      }
      return res.status(200).json({ success: true, message: 'Discount deleted.' });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to delete discount.' });
    }
  }
}

module.exports = new PromoDiscountsController();
