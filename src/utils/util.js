"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.fetchTaskAndSchedule = exports.isExistingTask = exports.calculateTaskScheduleTime = exports.scheduledTasks = exports.clients = void 0;
const node_schedule_1 = require("node-schedule");
const taskModel_1 = __importDefault(require("../task/taskModel"));
const ws_1 = require("ws");
exports.clients = new Map();
exports.scheduledTasks = new Map();
const calculateTaskScheduleTime = (message, users, intervalMinutes, usersPerInterval, agent) => __awaiter(void 0, void 0, void 0, function* () {
    const totalGroups = Math.ceil(users.length / usersPerInterval);
    const currentTime = new Date();
    let scheduledTime = currentTime;
    for (let i = 0; i < totalGroups; i++) {
        const startIndex = i * usersPerInterval;
        const endIndex = Math.min(startIndex + usersPerInterval, users.length);
        if (i === 0) {
            scheduledTime = currentTime;
        }
        else {
            scheduledTime = new Date(scheduledTime.getTime() + intervalMinutes * 60 * 1000);
        }
        const groupUsers = users.slice(startIndex, endIndex);
        try {
            for (const user of groupUsers) {
                yield taskModel_1.default.create({
                    sent_to: user,
                    message,
                    agent,
                    scheduledAt: scheduledTime,
                });
            }
        }
        catch (error) {
            throw error;
        }
    }
});
exports.calculateTaskScheduleTime = calculateTaskScheduleTime;
const isExistingTask = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield taskModel_1.default.find({
        $or: [{ status: "pending" }, { status: "scheduled" }],
        agent: agentId,
    });
    return tasks.length > 0 ? true : false;
});
exports.isExistingTask = isExistingTask;
const fetchTaskAndSchedule = (agent, interval) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield taskModel_1.default
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
                const job = exports.scheduledTasks.get(task._id);
                console.log(`Job for task ${task._id}:`, job);
                if (job) {
                    job.cancel();
                    console.log(`Cancelled job for task ${task._id}`);
                }
                else {
                    console.log(`No job found for task ${task._id}`);
                }
                const payload = {
                    action: "sendMessageToUser",
                    task: task,
                };
                const client = exports.clients.get(agent);
                if (client) {
                    if (client.socketID) {
                        if (client.socketID.readyState === ws_1.WebSocket.OPEN) {
                            client.socketID.send(JSON.stringify(payload));
                        }
                        else {
                            yield taskModel_1.default.updateOne({ _id: task._id }, { status: "failed", reason: "SOCKET CONNECTION FAILED" });
                        }
                    }
                }
                else {
                    yield taskModel_1.default.updateOne({ _id: task._id }, { status: "failed", reason: "SOCKET CONNECTION FAILED" });
                }
                yield taskModel_1.default.updateOne({ _id: task._id }, { status: "scheduled" });
            }
            else {
                yield taskModel_1.default.updateOne({ _id: task._id }, { status: "scheduled" });
                const job = (0, node_schedule_1.scheduleJob)(date, () => __awaiter(void 0, void 0, void 0, function* () {
                    console.log(`Executed Sucessfully : ${task.sent_to} : ${task.message} : ${task._id}`);
                    const payload = {
                        action: "sendMessageToUser",
                        task: task,
                    };
                    const client = exports.clients.get(agent);
                    if (client) {
                        if (client.socketID) {
                            if (client.socketID.readyState === ws_1.WebSocket.OPEN) {
                                client.socketID.send(JSON.stringify(payload));
                            }
                            else {
                                yield taskModel_1.default.updateOne({ _id: task._id }, { status: "failed", reason: "SOCKET CONNECTION FAILED" });
                            }
                        }
                    }
                    else {
                        yield taskModel_1.default.updateOne({ _id: task._id }, { status: "failed", reason: "SOCKET CONNECTION FAILED" });
                    }
                }));
                const taskIdString = task._id.toString();
                exports.scheduledTasks.set(taskIdString, job);
                console.log("Sch : ", exports.scheduledTasks);
            }
        }
        yield (0, exports.fetchTaskAndSchedule)(agent, interval);
        console.log("fetchTaskAndSchedule : ", agent);
    }
    catch (error) {
        console.error("Error scheduling tasks:", error);
    }
});
exports.fetchTaskAndSchedule = fetchTaskAndSchedule;
const updateTaskStatus = (taskID, status, reason) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield taskModel_1.default.updateOne({ _id: taskID }, { status: status, reason: reason });
        console.log(taskID, status, reason, "TASK UPDATED WITH THIS");
    }
    catch (error) {
        console.log(error);
    }
});
exports.updateTaskStatus = updateTaskStatus;
