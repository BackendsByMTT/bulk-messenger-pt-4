import { NextFunction, Request, Response } from "express";
import taskModel from "./taskModel";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import {
  fetchTaskAndSchedule,
  isPendingTask,
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

  try {
    const isPending = await isPendingTask(agent);
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

const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  const taskId = req.params.taskId;

  const task = await taskModel.findOne({ _id: taskId });

  if (!task) {
    return next(createHttpError(404, "Task not found"));
  }

  await taskModel.deleteOne({ _id: taskId });
  res.status(204).json({ message: "Task deleted" });
};

export { createTask, getTasks, getTaskById, deleteTask };
