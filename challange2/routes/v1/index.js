import express from "express";
const router = express.Router();

import ingredientRoutes from "./ingredients.js";
import recipeRoutes from "./recipes.js";

router.use("/ingredients", ingredientRoutes);
router.use("/recipes", recipeRoutes);

export default router;
