import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import { query, validationResult } from "express-validator";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    morgan('[:date[clf]] ":method :url" :remote-addr :status :response-time ms')
);
app.use(helmet());
app.use("/static", express.static("public"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
});
app.use(limiter);

import apiRoutes from "./routes/api.js";

app.use("/api", apiRoutes);

// Start the Express server
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
