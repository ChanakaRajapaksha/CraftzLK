const express = require("express");
const router = express.Router();
const { ShippingMethod } = require("../models/shippingMethod");

const mapMethod = (doc) => ({
  _id: doc._id,
  id: doc._id,
  name: doc.name,
  cost: doc.cost ?? 0,
  deliveryTime: doc.deliveryTime || "",
  zones: doc.zones || [],
  status: doc.status || "active",
  dateCreated: doc.createdAt,
});

router.get("/", async (req, res) => {
  try {
    const list = await ShippingMethod.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      methodList: list.map(mapMethod),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load shipping methods." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await ShippingMethod.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Shipping method not found." });
    }
    return res.status(200).json(mapMethod(item));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to load shipping method." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const entry = new ShippingMethod({
      name: body.name,
      cost: Number(body.cost) || 0,
      deliveryTime: body.deliveryTime || "",
      zones: body.zones || [],
      status: body.status || "active",
    });
    const saved = await entry.save();
    return res.status(201).json(mapMethod(saved));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to create shipping method." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const body = req.body;
    const updated = await ShippingMethod.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        cost: Number(body.cost) || 0,
        deliveryTime: body.deliveryTime || "",
        zones: body.zones || [],
        status: body.status || "active",
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Shipping method not found." });
    }

    return res.status(200).json(mapMethod(updated));
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update shipping method." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ShippingMethod.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Shipping method not found." });
    }
    return res.status(200).json({ success: true, message: "Shipping method deleted." });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete shipping method." });
  }
});

module.exports = router;
