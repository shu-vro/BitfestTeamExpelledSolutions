import pg from "pg";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
dotenv.config({
    path: "../.env",
});

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    max_tokens: null,
    timeout: null,
    max_retries: 2,
    // other params...
});

// const client = new pg.Client({
//     user: "postgres",
//     password: "postgres",
//     host: "127.0.0.1",
//     port: 5432,
//     database: "postgres",
// });

// async function fetchIngredients() {
//     try {
//         await client.connect();
//         const result = await client.query(
//             "SELECT name, quantity FROM ingredients"
//         );
//         await client.end();
//         return result.rows;
//     } catch (err) {
//         console.error("Database error:", err);
//         return [];
//     }
// }

// const ingredients = await fetchIngredients();
// const ingredientList = ingredients
// .map((ing) => `${ing.name}: (${ing.quantity})`)
// .join(", ");

// const context = `
//     Available ingredients: ${ingredientList}
//     Suggest a recipe based on the available ingredients. The recipe should be simple and easy to follow.
//     `;

async function fetchRecipe(ingredients = "") {
    const messages = [
        {
            role: "system",
            content: `
Available ingredients: ${ingredients}
Suggest a recipe based on the available ingredients. The recipe should be simple and easy to follow.
`,
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
        {
            role: "user",
            content: ingredients,
        },
    ];

    const ai_msg = await llm.invoke(messages);
    messages.push({ role: "assistant", content: ai_msg.content });
    return ai_msg.content;
}

async function chatbot(prevChats = []) {
    // const ingredients = await fetchIngredients();
    // const ingredientList = ingredients
    //     .map((ing) => `${ing.name}: (${ing.quantity})`)
    //     .join(", ");
    let messages = [
        {
            role: "system",
            content: `You are a helpful chatbot that suggests recipes based on Available ingredients.`,
        },
    ];
    messages.push(...prevChats);
    const ai_msg = await llm.invoke(messages);
    messages.push({ role: "assistant", content: ai_msg.content });

    // console.log(messages);
    return {
        response: ai_msg.content,
    };
}

// const recipeSuggestion = await addMessage();
// console.log(recipeSuggestion);

export { fetchRecipe, chatbot };
