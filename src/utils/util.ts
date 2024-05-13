import { scheduleJob } from "node-schedule";
import taskModel from "../task/taskModel";
import wss from "../socket";
import { Task } from "../task/taskTypes";

export const clients = new Map();
export const scheduledClient = new Map();

// export const scheduleTasks = async (agentId: string, count: number) => {
//   const pendingTasks = await getTaskbyStatus("pending", agentId);
//   pendingTasks.sort(
//     (a, b) =>
//       new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
//   );

//
// };

export const getPendingTasks = async (agentId: string, count: number) => {
  const tasks: Task[] = await taskModel
    .find({ status: "pending", agent: agentId })
    .limit(count);

  scheduleTask(tasks);
  return tasks;
};

const scheduleTask = (tasks: Task[]) => {
  for (const task of tasks) {
    const date = new Date(task.scheduledAt);
    scheduleJob(date, async () => {
      console.log(`Executing task ${task.agent} at ${date} : ${task.message}`);

    //   wss.clients.forEach
    });
  }
};
