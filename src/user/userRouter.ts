import express, { NextFunction, Request, Response } from "express";
import { createUser, loginUser } from "./userController";

const userRouter = express.Router();

userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "User Route" });
});
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

export default userRouter;
