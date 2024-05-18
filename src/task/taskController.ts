import { NextFunction, Request, Response } from "express";
import taskModel from "./taskModel";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import {
  fetchTaskAndSchedule,
  isExistingTask,
  calculateTaskScheduleTime,
} from "../utils/util";

export interface AuthRequest extends Request {
  userId: string;
}

const createTask = async (req: Request, res: Response, next: NextFunction) => {
  //   const _req = req as AuthRequest;
  //   const agent = _req.userId;

  const { message, users, interval, usersPerInterval, agent } = req.body;

  console.log("Request : ", req.body);
  if (!message || !users || !interval || !usersPerInterval || !agent) {
    return next(
      createHttpError(400, "Missing required fields in the request.")
    );
  }

  if (users.length === 0) {
    return next(createHttpError(400, "Please provide users to send messages"));
  }

  try {
    const isPending = await isExistingTask(agent);
    if (isPending) {
      return next(
        createHttpError(
          403,
          "Cannot schedule new messages. \nPlease complete existing tasks first."
        )
      );
    }
    await calculateTaskScheduleTime(
      message,
      users,
      parseInt(interval),
      parseInt(usersPerInterval),
      agent
    );

    await fetchTaskAndSchedule(agent, parseInt(interval));
    res.status(201).json({ message: "Tasks Added to Database" });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Unable to Add Tasks"));
  }
};

const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await taskModel.find({});
    res.json(tasks);
  } catch (error) {}
};

const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  const taskId = req.params.taskId;

  try {
    const task = await taskModel.findOne({ _id: taskId });
    if (!task) {
      return next(createHttpError(404, "Task not found"));
    }

    return res.json(task);
  } catch (error) {
    return next(createHttpError(500, "Error while getting a task"));
  }
};

const deleteMultipleNonScheduledTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { taskIds } = req.body;
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return next(createHttpError(400, "No task IDs provided."));
  }

  try {
    await taskModel.deleteMany({ _id: { $in: taskIds } });
    res.status(200).json({ message: "Tasks deleted successfully." });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return next(createHttpError(500, "Failed to delete tasks."));
  }
};

const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  const taskId = req.params.taskId;

  const task = await taskModel.findOne({ _id: taskId });

  if (!task) {
    return next(createHttpError(404, "Task not found"));
  }

  await taskModel.deleteOne({ _id: taskId });
  res.status(204).json({ message: "Task deleted" });
};

export {
  createTask,
  getTasks,
  getTaskById,
  deleteMultipleNonScheduledTasks,
  deleteTask,
};
