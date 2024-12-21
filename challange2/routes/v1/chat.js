import express from "express";
import { body, query, validationResult } from "express-validator";
import { chatbot } from "../../llm/model.js";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({
    path: "../.env",
});

const router = express.Router();

let prevChats = [];

async function fetchIngredients() {
    const client = new pg.Client({
        user: "postgres",
        password: "postgres",
        host: "127.0.0.1",
        port: 5432,
        database: "postgres",
    });

    try {
        await client.connect();
        const result = await client.query(
            "SELECT name, quantity FROM ingredients"
        );
        await client.end();
        return result.rows
            .map((ing) => `${ing.name}: (${ing.quantity})`)
            .join(", ");
    } catch (err) {
        console.error("Database error:", err);
        return [];
    }
}

// Route: Chatbot interaction
router.get(
    "/",
    query("message").isString().withMessage("Message is required."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { message } = req.query;

        try {
            const ingredients = await fetchIngredients();
            prevChats.push({
                role: "human",
                content: `available ingredients: ${ingredients}`,
            });
            prevChats.push({ role: "human", content: message });
            const chatResponse = await chatbot(prevChats || []);
            res.json(chatResponse.response);
            prevChats.push({ role: "ai", content: chatResponse.response });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error processing chat message." });
        }
    }
);

export default router;
