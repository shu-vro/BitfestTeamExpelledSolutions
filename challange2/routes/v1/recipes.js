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
        CREATE TABLE IF NOT EXISTS favorite_recipes (
            id SERIAL PRIMARY KEY,
            recipe_text TEXT NOT NULL
        );
    `
            )
            .then(() => {
                console.log("Table `favorite_recipes` created successfully");
            })
            .catch((error) => {
                console.log("Error creating table", error);
            });
    })
    .catch((error) => {
        console.log("Error connecting to database", error);
        console.log("please connect to a postgres database.");
    });

// Route: Add a new favorite recipe (from image or text)
router.post(
    "/add",
    body("recipeText").isString().withMessage("Recipe text is required."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { recipeText } = req.body;
        if (!recipeText) {
            return res
                .status(400)
                .json({ message: "Recipe text is required." });
        }

        try {
            await client.query(
                "INSERT INTO favorite_recipes (recipe_text) VALUES ($1)",
                [recipeText]
            );
            res.json({ message: "Recipe added successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Database error." });
        }
    }
);

// Route: Retrieve all favorite recipes
router.get("/", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM favorite_recipes");
        res.json({ favoriteRecipes: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error." });
    }
});

export default router;
