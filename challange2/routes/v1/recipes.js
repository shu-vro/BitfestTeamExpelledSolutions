import express from "express";
import dotenv from "dotenv";
import { body, query, validationResult } from "express-validator";
import pg from "pg";
import { fetchRecipe } from "../../llm/model.js";
import { inferFromImage } from "../../llm/imagemodel.js";

dotenv.config({
    path: "../.env",
});

const router = express.Router();

const clientConfig = {
    connectionString: process.env.DATABASE_URL,
};

const pool = new pg.Pool(clientConfig);

async function createTableIfNotExists() {
    const client = await pool.connect();

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS favorite_recipes (
                id SERIAL PRIMARY KEY,
                recipe_text TEXT NOT NULL
            );
        `);
        console.log("Table `favorite_recipes` created successfully");
    } catch (error) {
        console.error("Error creating table", error);
    } finally {
        client.release();
    }
}

async function fetchIngredients() {
    const client = await pool.connect();

    try {
        const result = await client.query(
            "SELECT name, quantity FROM ingredients"
        );
        return result.rows
            .map((ing) => `${ing.name}: (${ing.quantity})`)
            .join(", ");
    } catch (err) {
        console.error("Database error:", err);
        return [];
    } finally {
        client.release();
    }
}

createTableIfNotExists();

// Route: Suggest a recipe from model.js
router.get("/suggest", async (req, res) => {
    try {
        let { message } = req.query;
        if (!message) {
            message = "Suggest a recipe based on the following ingredients.";
        }
        const ingredients = await fetchIngredients();
        const response = await fetchRecipe(ingredients, message);

        // Add response to db
        const client = await pool.connect();
        try {
            await client.query(
                "INSERT INTO favorite_recipes (recipe_text) VALUES ($1)",
                [response]
            );
        } finally {
            client.release();
        }

        res.json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error suggesting recipe." });
    }
});

// Route: Add a new favorite recipe
router.post(
    "/add",
    body("recipeText").isString().withMessage("Recipe text is required."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { recipeText } = req.body;

        const client = await pool.connect();

        try {
            await client.query(
                "INSERT INTO favorite_recipes (recipe_text) VALUES ($1)",
                [recipeText]
            );
            res.json({ message: "Recipe added successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Database error." });
        } finally {
            client.release();
        }
    }
);

// Route: Add a new favorite recipe from image
router.post(
    "/add-from-image",
    body("recipeImageUrl")
        .isString()
        .withMessage("Recipe image URL is required."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { recipeImageUrl } = req.body;

        const client = await pool.connect();

        try {
            const recipeText = await inferFromImage(recipeImageUrl);
            await client.query(
                "INSERT INTO favorite_recipes (recipe_text) VALUES ($1)",
                [recipeText]
            );
            res.json({ response: recipeText });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Database error." });
        } finally {
            client.release();
        }
    }
);

// Route: Retrieve all favorite recipes
router.get("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query("SELECT * FROM favorite_recipes");
        res.json({ favoriteRecipes: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    } finally {
        client.release();
    }
});

export default router;
