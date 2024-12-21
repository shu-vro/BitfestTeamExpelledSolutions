import express from "express";
const router = express.Router();

let favoriteRecipes = [];

// Route: Add a new favorite recipe (from image or text)
router.post("/add", (req, res) => {
    const { recipeText } = req.body;
    if (!recipeText) {
        return res.status(400).json({ message: "Recipe text is required." });
    }
    favoriteRecipes.push(recipeText);
    res.json({ message: "Recipe added successfully.", favoriteRecipes });
});

// Route: Retrieve all favorite recipes
router.get("/", (req, res) => {
    res.json({ favoriteRecipes });
});

export default router;
