import express from "express";
import { body, query, validationResult } from "express-validator";
import { chatbot } from "../../llm/model.js";

const router = express.Router();

let prevChats = [];

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
            const chatResponse = await chatbot(prevChats || [], message);
            res.json(chatResponse.response);
            prevChats = chatResponse.messages;
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error processing chat message." });
        }
    }
);

export default router;
