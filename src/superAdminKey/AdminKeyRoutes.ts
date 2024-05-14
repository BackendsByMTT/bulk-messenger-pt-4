import express from "express";
import createAdminKey from "./AdminKeyController";
const adminKeyRouter = express.Router();
import authenticate from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/middleAuth";

adminKeyRouter.post("/createAdminKey", isAdmin, createAdminKey);

export default adminKeyRouter;
