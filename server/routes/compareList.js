const { CompareList } = require('../models/compareList');
const express = require('express');
const router = express.Router();

// Get all compared products
router.get(`/`, async (req, res) => {
    try {
        const compareList = await CompareList.find(req.query);
        if (!compareList) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(compareList);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Add a product to compare list
router.post('/add', async (req, res) => {
    try {
        const existingItem = await CompareList.find({
            productId: req.body.productId,
            userId: req.body.userId
        });

        if (existingItem.length === 0) {
            let compareItem = new CompareList({
                productTitle: req.body.productTitle,
                image: req.body.image,
                rating: req.body.rating,
                price: req.body.price,
                productId: req.body.productId,
                userId: req.body.userId
            });

            compareItem = await compareItem.save();
            return res.status(201).json(compareItem);
        } else {
            return res.status(401).json({ status: false, msg: "Product already added in the Compare List" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a product from compare list
router.delete('/:id', async (req, res) => {
    try {
        const item = await CompareList.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "The item with the given ID is not found!" });
        }
        await CompareList.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Item Deleted!'
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get a single compared product by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await CompareList.findById(req.params.id);
        if (!item) {
            return res.status(500).json({ message: 'The item with the given ID was not found.' });
        }
        return res.status(200).send(item);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
