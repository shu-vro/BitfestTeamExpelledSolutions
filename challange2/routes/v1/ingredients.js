import express from "express";
const router = express.Router();

let ingredients = [];

// Route: Add new ingredients
router.post("/add", (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items should be an array." });
    }
    ingredients = [...new Set([...ingredients, ...items])]; // Avoid duplicates
    res.json({ message: "Ingredients added successfully.", ingredients });
});

// Route: Update ingredients (e.g., after shopping or cooking)
router.put("/update", (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items should be an array." });
    }
    ingredients = items; // Replace with the provided list
    res.json({ message: "Ingredients updated successfully.", ingredients });
});

// Route: Get all available ingredients
router.get("/", (req, res) => {
    res.json({ ingredients });
});

export default router;
