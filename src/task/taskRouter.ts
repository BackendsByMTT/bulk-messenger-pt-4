import express from "express";
import {
  createTask,
  deleteMultipleNonScheduledTasks,
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
taskRouter.delete("/", deleteMultipleNonScheduledTasks);
taskRouter.delete("/:taskId", authenticate, deleteTask);

export default taskRouter;
