import express from "express";

import authenticate from "../middlewares/authenticate";
import { getAllTrashes } from "./trashController";
const trashRouter = express.Router();

trashRouter.get("/", authenticate, getAllTrashes);

export default trashRouter;
