// llama-3.2-90b-vision-preview
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
dotenv.config({
    path: "../.env",
});

const llm = new ChatGroq({
    model: "llama-3.2-90b-vision-preview",
    temperature: 0,
    max_tokens: null,
    timeout: null,
    max_retries: 2,
    // other params...
});

async function inferFromImage(url) {
    let message = new HumanMessage({
        content: JSON.stringify([
            {
                type: "text",
                text: "list ingredients and how to make this?",
            },
            {
                type: "image_url",
                image_url: {
                    url: `${url}`,
                },
            },
        ]),
    });

    const systemMessage = new SystemMessage({
        content:
            "You will be provided with an image and you need to list the ingredients and how to make it. If it's not a dish, please throw exception!",
    });

    const data = await llm.invoke([systemMessage, message]);

    return data.content;
}

export { inferFromImage };
