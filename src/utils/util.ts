import { scheduleJob, Job } from "node-schedule";
import taskModel from "../task/taskModel";
import wss from "../socket";
import { Task } from "../task/taskTypes";
import { WebSocket } from "ws";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export const clients = new Map();
export const scheduledTasks = new Map();

export interface AuthRequest extends Request {
  userId: string;
  userRole: string;
}
export interface CustomJwtPayload extends JwtPayload {
  role: string;
}

export const calculateTaskScheduleTime = async (
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
          scheduledAt: scheduledTime,
        });
      }
    } catch (error) {
      throw error;
    }
  }
};

export const isExistingTask = async (agentId: string) => {
  const tasks: Task[] = await taskModel.find({
    $or: [{ status: "pending" }, { status: "scheduled" }],
    agent: agentId,
  });

  return tasks.length > 0 ? true : false;
};

export const fetchTaskAndSchedule = async (agent: string, interval: number) => {
  try {
    const tasks = await taskModel
      .find({
        $or: [{ status: "pending" }],
        agent: agent,
      })
      .limit(2);
    if (tasks.length === 0) {
      console.log("No more pending or scheduled tasks");
      return;
    }

    for (const task of tasks) {
      const date = new Date(task.scheduledAt);
      const currentDate = new Date();
      if (date < currentDate) {
        console.log(`Attempting to cancel job for task ${task._id}`);
        const job = scheduledTasks.get(task._id);
        console.log(`Job for task ${task._id}:`, job);

        if (job) {
          job.cancel();
          console.log(`Cancelled job for task ${task._id}`);
        } else {
          console.log(`No job found for task ${task._id}`);
        }

        const payload = {
          action: "sendMessageToUser",
          task: task,
        };

        const client = clients.get(agent);
        if (client) {
          if (client.socketID) {
            if (client.socketID.readyState === WebSocket.OPEN) {
              client.socketID.send(JSON.stringify(payload));
            } else {
              await taskModel.updateOne(
                { _id: task._id },
                { status: "failed", reason: "SOCKET CONNECTION FAILED" }
              );
            }
          }
        } else {
          await taskModel.updateOne(
            { _id: task._id },
            { status: "failed", reason: "SOCKET CONNECTION FAILED" }
          );
        }
        await taskModel.updateOne({ _id: task._id }, { status: "scheduled" });
      } else {
        await taskModel.updateOne({ _id: task._id }, { status: "scheduled" });
        const job = scheduleJob(date, async () => {
          console.log(
            `Executed Sucessfully : ${task.sent_to} : ${task.message} : ${task._id}`
          );

          const payload = {
            action: "sendMessageToUser",
            task: task,
          };

          const client = clients.get(agent);

          if (client) {
            if (client.socketID) {
              if (client.socketID.readyState === WebSocket.OPEN) {
                client.socketID.send(JSON.stringify(payload));
              } else {
                await taskModel.updateOne(
                  { _id: task._id },
                  { status: "failed", reason: "SOCKET CONNECTION FAILED" }
                );
              }
            }
          } else {
            await taskModel.updateOne(
              { _id: task._id },
              { status: "failed", reason: "SOCKET CONNECTION FAILED" }
            );
          }
        });

        const taskIdString = task._id.toString();
        scheduledTasks.set(taskIdString, job);
        console.log("Sch : ", scheduledTasks);
      }
    }

    await fetchTaskAndSchedule(agent, interval);

    console.log("fetchTaskAndSchedule : ", agent);
  } catch (error) {
    console.error("Error scheduling tasks:", error);
  }
};

export const updateTaskStatus = async (
  taskID: string,
  status: string,
  reason: string
) => {
  try {
    await taskModel.updateOne(
      { _id: taskID },
      { status: status, reason: reason }
    );
    console.log(taskID, status, reason, "TASK UPDATED WITH THIS");
  } catch (error) {
    console.log(error);
  }
};
