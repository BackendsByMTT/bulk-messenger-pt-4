import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
} from "./taskController";
import authenticate from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/middleAuth";
const taskRouter = express.Router();

taskRouter.post("/", authenticate, createTask);
taskRouter.get("/", authenticate, getTasks);
taskRouter.get("/:taskId", authenticate, getTaskById);
taskRouter.delete("/:taskId", authenticate, deleteTask);

export default taskRouter;
