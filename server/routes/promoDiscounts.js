const { PromoDiscount } = require("../models/promoDiscount");
const express = require("express");
const router = express.Router();

const mapDiscount = (doc) => ({
  _id: doc._id,
  id: doc._id,
  name: doc.name,
  type: doc.type,
  discountType: doc.discountType,
  discountValue: doc.discountValue,
  productIds: doc.productIds || [],
  productNames: doc.productNames || [],
  categoryId: doc.categoryId || "",
  categoryName: doc.categoryName || "",
  description: doc.description || "",
  startDate: doc.startDate,
  endDate: doc.endDate,
  status: doc.status || "active",
  dateCreated: doc.createdAt,
});

function deriveStatus(discount) {
  if (discount.status === "inactive") return "inactive";
  const now = new Date();
  if (discount.startDate && new Date(discount.startDate) > now) return "scheduled";
  if (discount.endDate && new Date(discount.endDate) < now) return "expired";
  return discount.status || "active";
}

router.get("/", async (req, res) => {
  try {
    const list = await PromoDiscount.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      discountList: list.map((item) => {
        const mapped = mapDiscount(item);
        mapped.status = deriveStatus(item);
        return mapped;
      }),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load discounts." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await PromoDiscount.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Discount not found." });
    }
    const mapped = mapDiscount(item);
    mapped.status = deriveStatus(item);
    return res.status(200).json(mapped);
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load discount." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const entry = new PromoDiscount({
      name: body.name,
      type: body.type,
      discountType: body.discountType || "percentage",
      discountValue: Number(body.discountValue) || 0,
      productIds: body.productIds || [],
      productNames: body.productNames || [],
      categoryId: body.categoryId || "",
      categoryName: body.categoryName || "",
      description: body.description || "",
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status || "active",
    });

    const saved = await entry.save();
    return res.status(201).json(mapDiscount(saved));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to create discount." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await PromoDiscount.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        type: body.type,
        discountType: body.discountType || "percentage",
        discountValue: Number(body.discountValue) || 0,
        productIds: body.productIds || [],
        productNames: body.productNames || [],
        categoryId: body.categoryId || "",
        categoryName: body.categoryName || "",
        description: body.description || "",
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "active",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Discount not found." });
    }

    return res.status(200).json(mapDiscount(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update discount." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await PromoDiscount.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Discount not found." });
    }
    return res.status(200).json({ success: true, message: "Discount deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete discount." });
  }
});

module.exports = router;
