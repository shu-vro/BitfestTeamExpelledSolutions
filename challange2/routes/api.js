import express from "express";
const router = express.Router();

// const v1Routes = require("./v1");
import v1Routes from "./v1/index.js";

router.use("/v1", v1Routes);

export default router;
