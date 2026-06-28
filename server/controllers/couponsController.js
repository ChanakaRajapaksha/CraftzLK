const couponsService = require('../services/couponsService');

class CouponsController {
  async list(req, res) {
    try {
      const list = await couponsService.list();
      return res.status(200).json({
        success: true,
        couponList: list.map((item) => {
          const mapped = couponsService.mapCoupon(item);
          mapped.status = couponsService.deriveStatus(item);
          return mapped;
        }),
      });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load coupons.' });
    }
  }

  async getById(req, res) {
    try {
      const item = await couponsService.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Coupon not found.' });
      }
      const mapped = couponsService.mapCoupon(item);
      mapped.status = couponsService.deriveStatus(item);
      return res.status(200).json(mapped);
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to load coupon.' });
    }
  }

  async create(req, res) {
    try {
      const saved = await couponsService.create(req.body);
      return res.status(201).json(couponsService.mapCoupon(saved));
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
      }
      return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
    }
  }

  async update(req, res) {
    try {
      const updated = await couponsService.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Coupon not found.' });
      }

      return res.status(200).json(couponsService.mapCoupon(updated));
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
      }
      return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
    }
  }

  async remove(req, res) {
    try {
      const deleted = await couponsService.deleteById(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Coupon not found.' });
      }
      return res.status(200).json({ success: true, message: 'Coupon deleted.' });
    } catch {
      return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
    }
  }
}

module.exports = new CouponsController();
