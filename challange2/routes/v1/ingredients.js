import express from "express";
const router = express.Router();
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
dotenv.config();
import pg from "pg";

const client = new pg.Client({
    user: "postgres",
    password: "postgres",
    host: "127.0.0.1",
    port: 5432,
    database: "postgres",
});

client
    .connect()
    .then(() => {
        console.log("Connected to database");

        client
            .query(
                `
        CREATE TABLE IF NOT EXISTS ingredients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            quantity INTEGER NOT NULL
        );
    `
            )
            .then(() => {
                console.log("Table `ingredients` created successfully");
            })
            .catch((error) => {
                console.log("Error creating table", error);
            });
    })
    .catch((error) => {
        console.log("Error connecting to database", error);
        console.log("please connect to a postgres database.");
    });

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

// Route: Add new ingredients
router.post("/add", validateItem, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { items } = req.body;
    if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items should be an array." });
    }

    const uniqueItems = removeDuplicates(items);

    try {
        for (const item of uniqueItems) {
            await client.query(
                "INSERT INTO ingredients (name, quantity) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET quantity = EXCLUDED.quantity",
                [item.name, item.quantity]
            );
        }
        res.json({ message: "Ingredients added successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

// Route: Update an ingredient
router.put("/update", async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, quantity } = req.body;
    if (!name || !quantity) {
        return res
            .status(400)
            .json({ message: "Name and quantity are required." });
    }

    try {
        const result = await client.query(
            "UPDATE ingredients SET quantity = $1 WHERE name = $2 RETURNING *",
            [quantity, name]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Ingredient not found." });
        }
        res.json({
            message: "Ingredient updated successfully.",
            ingredient: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

// Route: Cook an ingredient (decrease quantity)
router.put(
    "/cook",
    body("name").isString().withMessage("Name is required."),
    body("quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, quantity } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required." });
        }

        try {
            const result = await client.query(
                "SELECT quantity FROM ingredients WHERE name = $1",
                [name]
            );
            if (result.rows.length === 0) {
                return res
                    .status(404)
                    .json({ message: "Ingredient not found." });
            }

            const currentQuantity = result.rows[0].quantity;
            const newQuantity = currentQuantity - quantity;

            if (newQuantity < 0) {
                return res
                    .status(400)
                    .json({ message: "Insufficient quantity to cook." });
            }

            const updateResult = await client.query(
                "UPDATE ingredients SET quantity = $1 WHERE name = $2 RETURNING *",
                [newQuantity, name]
            );

            res.json({
                message: "Ingredient cooked successfully.",
                ingredient: updateResult.rows[0],
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Database error." });
        }
    }
);

// Route: Get all available ingredients
router.get("/", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM ingredients");
        res.json({ ingredients: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

export default router;
