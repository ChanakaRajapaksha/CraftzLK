const express = require('express');
const axios = require('axios');
const Product = require('../models/products.js');  // Use require for MongoDB model

const router = express.Router();

router.post('/compare-products', async (req, res) => {
    try {
        const { product1Id, product2Id, subcategoryId } = req.body;

        // Validate request data
        if (!product1Id || !product2Id) {
            return res.status(400).json({ message: "Missing product IDs" });
        }

        // Fetch products from MongoDB based on subcategoryId
        const product1 = await Product.findOne({ _id: product1Id, subCatId: subcategoryId });
        const product2 = await Product.findOne({ _id: product2Id, subCatId: subcategoryId });

        if (!product1 || !product2) {
            return res.status(404).json({ message: "One or both products not found or not in the same subcategory!" });
        }

        // Ensure both products are in the same subcategory
        if (product1.subcategory !== product2.subCatId) {
            return res.status(400).json({ message: "Products belong to different subcategories!" });
        }

        // Prepare data for AI comparison
        const aiPrompt = {
            input: {
                product1: { name: product1.name, features: product1.features, price: product1.price },
                product2: { name: product2.name, features: product2.features, price: product2.price }
            }
        };

        // Call AI API (like Google Gemini or another API)
        const response = await axios.post(process.env.REACT_APP_GEMINI_API_URL, aiPrompt, {
            headers: { 
                "Authorization": `Bearer ${process.env.REACT_APP_GOOGLE_API_KEY}`, 
                "Content-Type": "application/json" 
            }
        });

        if (!response.data || !response.data.generatedText) {
            return res.status(500).json({ message: "Invalid AI response" });
        }

        res.json({
            product1: product1.name,
            product2: product2.name,
            comparison: response.data.generatedText
        });

    } catch (error) {
        console.error("Compare Products Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Helper function to fetch external data
const fetchExternalData = async (product1, product2) => {
    // Here you can implement additional logic to fetch external data (e.g., reviews, competitor prices)
    return {
        expertReviews: [
            { source: "TechRadar", rating: 4.5, comment: "Great for gaming." },
            { source: "GSMArena", rating: 4.2, comment: "Long battery life." }
        ],
        competitorPrices: [
            { store: "Amazon", product: product1.name, price: 1200 },
            { store: "Amazon", product: product2.name, price: 1100 }
        ]
    };
};

// Export router using CommonJS
module.exports = router;
