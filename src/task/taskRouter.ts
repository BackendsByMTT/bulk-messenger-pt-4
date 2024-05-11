import express from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
} from "./taskController";
import authenticate from "../middlewares/authenticate";

const taskRouter = express.Router();

taskRouter.post("/", createTask);
taskRouter.get("/", getTasks);
taskRouter.get("/:taskId", getTaskById);
taskRouter.delete("/:taskId", deleteTask);

export default taskRouter;
