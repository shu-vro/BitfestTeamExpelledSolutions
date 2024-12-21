import pg from "pg";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
dotenv.config({
    path: "../.env",
});

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    // model: "llama-3.3-70b-versatile",
    temperature: 0,
    max_tokens: null,
    timeout: null,
    max_retries: 2,
    // other params...
});

const client = new pg.Client({
    user: "postgres",
    password: "postgres",
    host: "127.0.0.1",
    port: 5432,
    database: "postgres",
});

async function fetchIngredients() {
    try {
        await client.connect();
        const result = await client.query(
            "SELECT name, quantity FROM ingredients"
        );
        await client.end();
        return result.rows;
    } catch (err) {
        console.error("Database error:", err);
        return [];
    }
}

const ingredients = await fetchIngredients();
const ingredientList = ingredients
    .map((ing) => `${ing.name}: (${ing.quantity})`)
    .join(", ");

const context = `
    Available ingredients: ${ingredientList}
    Suggest a recipe based on the available ingredients. The recipe should be simple and easy to follow.
    `;

const messages = [
    {
        role: "system",
        content:
            "You are a helpful assistant that suggests recipes based on available ingredients.",
    },
    {
        role: "user",
        content: "Suggest a recipe based on the following ingredients.",
    },
    {
        role: "ai",
        content:
            "Sure, I can help with that. Please provide the list of available ingredients.",
    },
];

async function fetchRecipe(
    message = "Suggest a recipe based on the available ingredients."
) {
    const ingredients = await fetchIngredients();
    messages.push({
        role: "user",
        content: `Available ingredients: ${ingredientList}`,
    });

    const ingredientList = ingredients
        .map((ing) => `${ing.name}: (${ing.quantity})`)
        .join(", ");
    messages.push({ role: "user", content: message });

    const ai_msg = await llm.invoke(messages);
    messages.push({ role: "assistant", content: ai_msg.content });
    return ai_msg.content;
}

async function chatbot(
    prevChats = [],
    message = "Suggest a recipe based on the available ingredients."
) {
    const ingredients = await fetchIngredients();
    const ingredientList = ingredients
        .map((ing) => `${ing.name}: (${ing.quantity})`)
        .join(", ");
    let messages = [
        {
            role: "system",
            content: `You are a helpful chatbot that suggests recipes based on Available ingredients: ${ingredientList}`,
        },
    ];
    messages.push(...prevChats);
    const ai_msg = await llm.invoke(messages);
    messages.push({ role: "assistant", content: ai_msg.content });
    return {
        messages,
        response: ai_msg.content,
    };
}

// const recipeSuggestion = await addMessage();
// console.log(recipeSuggestion);

export { fetchRecipe, chatbot };
