const { Coupon } = require("../models/coupon");
const express = require("express");
const router = express.Router();

const mapCoupon = (doc) => ({
  _id: doc._id,
  id: doc._id,
  code: doc.code,
  discountType: doc.discountType,
  discountValue: doc.discountValue,
  minOrderValue: doc.minOrderValue || 0,
  maxDiscount: doc.maxDiscount || 0,
  startDate: doc.startDate,
  expiryDate: doc.expiryDate,
  usageLimit: doc.usageLimit || 0,
  usageCount: doc.usageCount || 0,
  status: doc.status || "active",
  dateCreated: doc.createdAt,
});

function deriveStatus(coupon) {
  if (coupon.status === "inactive") return "inactive";
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return "expired";
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) return "expired";
  return coupon.status || "active";
}

router.get("/", async (req, res) => {
  try {
    const list = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      couponList: list.map((item) => {
        const mapped = mapCoupon(item);
        mapped.status = deriveStatus(item);
        return mapped;
      }),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load coupons." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Coupon.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }
    const mapped = mapCoupon(item);
    mapped.status = deriveStatus(item);
    return res.status(200).json(mapped);
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load coupon." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const entry = new Coupon({
      code: String(body.code || "").trim().toUpperCase(),
      discountType: body.discountType || "percentage",
      discountValue: Number(body.discountValue) || 0,
      minOrderValue: Number(body.minOrderValue) || 0,
      maxDiscount: Number(body.maxDiscount) || 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      usageLimit: Number(body.usageLimit) || 0,
      usageCount: Number(body.usageCount) || 0,
      status: body.status || "active",
    });

    const saved = await entry.save();
    return res.status(201).json(mapCoupon(saved));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }
    return res.status(500).json({ success: false, message: "Failed to create coupon." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code: String(body.code || "").trim().toUpperCase(),
        discountType: body.discountType || "percentage",
        discountValue: Number(body.discountValue) || 0,
        minOrderValue: Number(body.minOrderValue) || 0,
        maxDiscount: Number(body.maxDiscount) || 0,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        usageLimit: Number(body.usageLimit) || 0,
        usageCount: Number(body.usageCount) || 0,
        status: body.status || "active",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }

    return res.status(200).json(mapCoupon(updated));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: "Coupon code already exists." });
    }
    return res.status(500).json({ success: false, message: "Failed to update coupon." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }
    return res.status(200).json({ success: true, message: "Coupon deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete coupon." });
  }
});

module.exports = router;
