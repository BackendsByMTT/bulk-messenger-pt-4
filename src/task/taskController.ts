import { NextFunction, Request, Response } from "express";
import taskModel from "./taskModel";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import {
  fetchTaskAndSchedule,
  isExistingTask,
  calculateTaskScheduleTime,
  scheduledTasks,
  AuthRequest,
} from "../utils/util";
import trashModel from "../trash/trashModel";

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
  const _req = req as AuthRequest;
  try {
    let tasks;
    if (_req.userRole === "admin") {
      tasks = await taskModel.find().populate("agent", "name");
    } else if (_req.userRole === "agent") {
      tasks = await taskModel
        .find({ agent: _req.userId })
        .populate("agent", "name");
    } else {
      return next(
        createHttpError(403, "Access denied: Suspicious activity detected.")
      );
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error fetching trashes"));
  }
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
  const { taskIds, type, reason } = req.body;
  console.log("REQ : ", req.body);

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return next(createHttpError(400, "No task IDs provided."));
  }

  if (!type) {
    return next(createHttpError(400, "Unable to find type of tasks"));
  }

  if (type !== "normal" && type !== "scheduled") {
    return next(
      createHttpError(
        400,
        "Invalid task type. Type must be either 'normal' or 'scheduled'."
      )
    );
  }

  try {
    if (type === "normal") {
      const tasksToMove = await taskModel.find({ _id: { $in: taskIds } });

      for (const task of tasksToMove) {
        const trashTask = new trashModel({
          sent_to: task.sent_to,
          message: task.message,
          status: task.status,
          agent: task.agent,
          scheduledAt: task.scheduledAt,
          reason: reason, // Optional: Add a reason or note
        });
        await trashTask.save(); // Save the task to the trash collection
      }
      await taskModel.deleteMany({ _id: { $in: taskIds } });
      return res.status(200).json({ message: "Non Scheduled Task Deleted" });
    } else if (type === "scheduled") {
      const taskToMove = await taskModel.find({ _id: { $in: taskIds } });

      for (const task of taskToMove) {
        console.log("TO BE DELETED : ", task._id);
        const taskIdString = task._id.toString();

        const job = scheduledTasks.get(taskIdString);
        console.log(`Job for task ${task._id}:`, job);

        if (job) {
          job.cancel();
          console.log(`Cancelled job for task ${task._id}`);
        } else {
          console.log(`No job found for task ${task._id}`);
        }
        const trashTask = new trashModel({
          sent_to: task.sent_to,
          message: task.message,
          status: task.status,
          agent: task.agent,
          scheduledAt: task.scheduledAt,
          reason: reason, // Optional: Add a reason or note
        });

        await trashTask.save();
      }
      await taskModel.deleteMany({ _id: { $in: taskIds } });
      return res.status(200).json({ message: "Scheduled Task Deleted" });
    }
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
