import express from "express";

import authenticate from "../middlewares/authenticate";
const taskRouter = express.Router();

// taskRouter.post("/", authenticate, createTrash);

export default taskRouter;
