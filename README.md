# BitfestTeamExpelledSolutions

## Challenge 2

This project is an Express.js API that provides endpoints for managing favorite recipes and ingredients. The API includes routes for adding, updating, and retrieving recipes and ingredients.

### Getting Started

#### Prerequisites

-   Node.js
-   npm

#### Installation

1. Clone the repository
2. Navigate to the `challange2` directory
3. Install the dependencies

```sh
npm install
```

4. Create a `.env` file in the challange2
   directory with the following content:

```
DATABASE_URL=your_database_url
GROQ_API_KEY=your_groq_api_key
```

#### Running the Server

To start the server in development mode:

```sh
npm run dev
```

To start the server in production mode:

```sh
npm start
```

The server will start at `http://localhost:3000`.

### API Endpoints

#### Recipes

##### Add a New Favorite Recipe

-   **URL:** `/api/v1/recipes/add`
-   **Method:** `POST`
-   **Request Body:**
    ```json
    {
        "recipeText": "Your recipe text here"
    }
    ```
-   **Response:**
    ```json
    {
        "message": "Recipe added successfully.",
        "favoriteRecipes": ["Your recipe text here"]
    }
    ```

##### Retrieve All Favorite Recipes

-   **URL:** `/api/v1/recipes`
-   **Method:** `GET`
-   **Response:**
    ```json
    {
        "favoriteRecipes": ["Your recipe text here"]
    }
    ```

#### Ingredients

##### Add New Ingredients

-   **URL:** `/api/v1/ingredients/add`
-   **Method:** `POST`
-   **Request Body:**
    ```json
    {
        "items": [
            { "name": "ingredient1", "quantity": 1 },
            { "name": "ingredient2", "quantity": 2 }
        ]
    }
    ```
-   **Response:**
    ```json
    {
        "message": "Ingredients added successfully.",
        "ingredients": [
            { "name": "ingredient1", "quantity": 1 },
            { "name": "ingredient2", "quantity": 2 }
        ]
    }
    ```

##### Update Ingredients

-   **URL:** `/api/v1/ingredients/update`
-   **Method:** `PUT`
-   **Request Body:**
    ```json
    {
        "name": "ingredient1",
        "quantity": 3
    }
    ```
-   **Response:**
    ```json
    {
        "message": "Ingredient updated successfully.",
        "ingredient": { "name": "ingredient1", "quantity": 3 }
    }
    ```

##### Get All Available Ingredients

-   **URL:** `/api/v1/ingredients`
-   **Method:** `GET`
-   **Response:**
    ```json
    {
        "ingredients": [
            { "name": "ingredient1", "quantity": 1 },
            { "name": "ingredient2", "quantity": 2 }
        ]
    }
    ```

### Middleware

The API uses the following middleware:

-   `express.json()` and express.urlencoded()
    for parsing JSON and URL-encoded request bodies
-   `morgan`
    for logging HTTP requests
-   `helmet`
    for securing HTTP headers
-   `express-rate-limit`
    for rate limiting
