import express, { NextFunction, Request, Response } from "express";
import { createUser, getAllTasks, loginUser } from "./userController";

const userRouter = express.Router();

userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "User Route" });
});
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/:userId/tasks", getAllTasks);

export default userRouter;
