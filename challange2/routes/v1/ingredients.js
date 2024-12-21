import express from "express";
const router = express.Router();
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
dotenv.config();

import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);

let ingredients = [];

const validateItem = [
    body("items").isArray().withMessage("Items should be an array"),
    body("items.*.name").isString().withMessage("Name must be a string"),
    body("items.*.quantity")
        .isNumeric()
        .withMessage("Quantity must be a number"),
];

const removeDuplicates = (items) => {
    const itemMap = new Map();
    items.forEach((item) => {
        itemMap.set(item.name, item);
    });
    return Array.from(itemMap.values());
};
// item: {name: string, quantity: number}

// Route: Add new ingredients
router.post("/add", validateItem, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { items } = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items should be an array." });
    }
    const uniqueItems = removeDuplicates([...ingredients, ...items]);
    ingredients = uniqueItems;
    res.json({ message: "Ingredients added successfully.", ingredients });
});

// Route: Update ingredients (e.g., after shopping or cooking)
router.put("/update", (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, quantity } = req.body;
    if (!name || !quantity) {
        return res
            .status(400)
            .json({ message: "ID, name, and quantity are required." });
    }

    // Assuming `ingredients` is an array of ingredient objects
    const ingredientIndex = ingredients.findIndex((item) => item.name === name);
    if (ingredientIndex === -1) {
        return res.status(404).json({ message: "Ingredient not found." });
    }

    ingredients[ingredientIndex] = { name, quantity };
    res.json({
        message: "Ingredient updated successfully.",
        ingredient: ingredients[ingredientIndex],
    });
});

// Route: Get all available ingredients
router.get("/", async (req, res) => {
    res.json({ ingredients });
});

export default router;
