import express from "express";
const router = express.Router();

import ingredientRoutes from "./ingredients.js";
import recipeRoutes from "./recipes.js";
import chatRoutes from "./chat.js";

router.use("/ingredients", ingredientRoutes);
router.use("/recipes", recipeRoutes);
router.use("/chat", chatRoutes);

export default router;
