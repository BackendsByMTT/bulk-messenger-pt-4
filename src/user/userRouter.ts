import express from "express";
import { createUser } from "./userController";

const userRouter = express.Router();

userRouter.get("/register", createUser);

export default userRouter;
