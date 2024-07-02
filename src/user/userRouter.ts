import express, { NextFunction, Request, Response } from "express";
import {
  createUser,
  loginUser,
  getAllUser,
  deleteAgent,
  updateAgent,
  getAllAgents,
  getAgentByUsername,
  getUserByUsername,
  getAllTasks,
} from "./userController";

const userRouter = express.Router();
import { checkUserStatus, isAdmin } from "../middlewares/middleAuth";
import authenticate from "../middlewares/authenticate";

userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "User Route" });
});
// REGISTER
userRouter.post("/register", createUser);
// LOGIN
userRouter.post("/login", checkUserStatus, loginUser);
// GET ALL USERS
userRouter.get("/allUsers", authenticate, getAllUser);
// GET ALL AGENTS
userRouter.get("/agents", isAdmin, getAllAgents);
// GET ALL USERS
userRouter.get("/agents/:username", isAdmin, getUserByUsername);
// DELETE A USER BY USERNAME
userRouter.delete("/agents/:username", isAdmin, deleteAgent);
// UPDATE A USER BY USERNAME
userRouter.put("/agents/:username", isAdmin, updateAgent);
// GET AGENT BY USERNAME
userRouter.get("/agents/:username", isAdmin, getAgentByUsername);

// GET AGENT TASKS
userRouter.get("/:userId/tasks", authenticate, getAllTasks);

export default userRouter;
