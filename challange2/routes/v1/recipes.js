import express from "express";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
import pg from "pg";
import { fetchRecipe } from "../../llm/model.js";

dotenv.config({
    path: "../.env",
});

const router = express.Router();

const clientConfig = {
    user: "postgres",
    password: "postgres",
    host: "127.0.0.1",
    port: 5432,
    database: "postgres",
};

async function createTableIfNotExists() {
    const client = new pg.Client(clientConfig);

    try {
        await client.connect();
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
        await client.end();
    }
}

async function fetchIngredients() {
    const client = new pg.Client(clientConfig);

    try {
        await client.connect();
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
        await client.end();
    }
}

createTableIfNotExists();

// Route: Suggest a recipe from model.js
router.get("/suggest", async (req, res) => {
    try {
        const ingredients = await fetchIngredients();
        const response = await fetchRecipe(ingredients);

        // Add response to db
        const client = new pg.Client(clientConfig);
        await client.connect();
        await client.query(
            "INSERT INTO favorite_recipes (recipe_text) VALUES ($1)",
            [response]
        );
        await client.end();

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

        const client = new pg.Client(clientConfig);

        try {
            await client.connect();
            await client.query(
                "INSERT INTO favorite_recipes (recipe_text) VALUES ($1)",
                [recipeText]
            );
            res.json({ message: "Recipe added successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Database error." });
        } finally {
            await client.end();
        }
    }
);

// Route: Retrieve all favorite recipes
router.get("/", async (req, res) => {
    const client = new pg.Client(clientConfig);

    try {
        await client.connect();
        const result = await client.query("SELECT * FROM favorite_recipes");
        res.json({ favoriteRecipes: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    } finally {
        await client.end();
    }
});

export default router;
