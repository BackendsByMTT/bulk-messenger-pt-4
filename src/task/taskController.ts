import { NextFunction, Request, Response } from "express";
import taskModel from "./taskModel";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { getPendingTasks } from "../utils/util";

export interface AuthRequest extends Request {
  userId: string;
}

const createTask = async (req: Request, res: Response, next: NextFunction) => {
  //   const _req = req as AuthRequest;
  //   const agent = _req.userId;

  const { message, users, interval, usersPerInterval, agent } = req.body;
  console.log("Request : ", req.body);

  try {
    await calculateTaskScheduleTime(
      message,
      users,
      parseInt(interval),
      parseInt(usersPerInterval),
      agent
    );
    await getPendingTasks(agent, parseInt(usersPerInterval));

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

const calculateTaskScheduleTime = async (
  message: string,
  users: [],
  intervalMinutes: number,
  usersPerInterval: number,
  agent: string
) => {
  const totalGroups = Math.ceil(users.length / usersPerInterval);
  const currentTime = new Date();
  let scheduledTime = currentTime;

  for (let i = 0; i < totalGroups; i++) {
    const startIndex = i * usersPerInterval;
    const endIndex = Math.min(startIndex + usersPerInterval, users.length);

    if (i === 0) {
      scheduledTime = currentTime;
    } else {
      scheduledTime = new Date(
        scheduledTime.getTime() + intervalMinutes * 60 * 1000
      );
    }
    const groupUsers = users.slice(startIndex, endIndex);
    try {
      for (const user of groupUsers) {
        await taskModel.create({
          sent_to: user,
          message,
          agent,
          scheduled_at: scheduledTime,
        });
      }
    } catch (error) {
      throw error;
    }
  }
};

export { createTask, getTasks, getTaskById, deleteTask };
