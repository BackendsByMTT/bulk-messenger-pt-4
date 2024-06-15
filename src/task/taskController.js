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
exports.deleteTask = exports.deleteMultipleNonScheduledTasks = exports.getTaskById = exports.getTasks = exports.createTask = void 0;
const taskModel_1 = __importDefault(require("./taskModel"));
const http_errors_1 = __importDefault(require("http-errors"));
const util_1 = require("../utils/util");
const trashModel_1 = __importDefault(require("../trash/trashModel"));
const createTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //   const _req = req as AuthRequest;
    //   const agent = _req.userId;
    const { message, users, interval, usersPerInterval, agent } = req.body;
    console.log("Request : ", req.body);
    if (!message || !users || !interval || !usersPerInterval || !agent) {
        return next((0, http_errors_1.default)(400, "Missing required fields in the request."));
    }
    if (users.length === 0) {
        return next((0, http_errors_1.default)(400, "Please provide users to send messages"));
    }
    try {
        const isPending = yield (0, util_1.isExistingTask)(agent);
        if (isPending) {
            return next((0, http_errors_1.default)(403, "Cannot schedule new messages. \nPlease complete existing tasks first."));
        }
        yield (0, util_1.calculateTaskScheduleTime)(message, users, parseInt(interval), parseInt(usersPerInterval), agent);
        yield (0, util_1.fetchTaskAndSchedule)(agent, parseInt(interval));
        res.status(201).json({ message: "Tasks Added to Database" });
    }
    catch (error) {
        console.log(error);
        return next((0, http_errors_1.default)(500, "Unable to Add Tasks"));
    }
});
exports.createTask = createTask;
const getTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _req = req;
    try {
        let tasks;
        if (_req.userRole === "admin") {
            tasks = yield taskModel_1.default.find();
        }
        else if (_req.userRole === "agent") {
            tasks = yield taskModel_1.default.find({ agent: _req.userId });
        }
        else {
            return next((0, http_errors_1.default)(403, "Access denied: Suspicious activity detected."));
        }
        res.status(200).json(tasks);
    }
    catch (error) {
        console.log(error);
        return next((0, http_errors_1.default)(500, "Error fetching trashes"));
    }
});
exports.getTasks = getTasks;
const getTaskById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.taskId;
    try {
        const task = yield taskModel_1.default.findOne({ _id: taskId });
        if (!task) {
            return next((0, http_errors_1.default)(404, "Task not found"));
        }
        return res.json(task);
    }
    catch (error) {
        return next((0, http_errors_1.default)(500, "Error while getting a task"));
    }
});
exports.getTaskById = getTaskById;
const deleteMultipleNonScheduledTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskIds, type, reason } = req.body;
    console.log("REQ : ", req.body);
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return next((0, http_errors_1.default)(400, "No task IDs provided."));
    }
    if (!type) {
        return next((0, http_errors_1.default)(400, "Unable to find type of tasks"));
    }
    if (type !== "normal" && type !== "scheduled") {
        return next((0, http_errors_1.default)(400, "Invalid task type. Type must be either 'normal' or 'scheduled'."));
    }
    try {
        if (type === "normal") {
            const tasksToMove = yield taskModel_1.default.find({ _id: { $in: taskIds } });
            for (const task of tasksToMove) {
                const trashTask = new trashModel_1.default({
                    sent_to: task.sent_to,
                    message: task.message,
                    status: task.status,
                    agent: task.agent,
                    scheduledAt: task.scheduledAt,
                    reason: reason, // Optional: Add a reason or note
                });
                yield trashTask.save(); // Save the task to the trash collection
            }
            yield taskModel_1.default.deleteMany({ _id: { $in: taskIds } });
            return res.status(200).json({ message: "Non Scheduled Task Deleted" });
        }
        else if (type === "scheduled") {
            const taskToMove = yield taskModel_1.default.find({ _id: { $in: taskIds } });
            for (const task of taskToMove) {
                console.log("TO BE DELETED : ", task._id);
                const taskIdString = task._id.toString();
                const job = util_1.scheduledTasks.get(taskIdString);
                console.log(`Job for task ${task._id}:`, job);
                if (job) {
                    job.cancel();
                    console.log(`Cancelled job for task ${task._id}`);
                }
                else {
                    console.log(`No job found for task ${task._id}`);
                }
                const trashTask = new trashModel_1.default({
                    sent_to: task.sent_to,
                    message: task.message,
                    status: task.status,
                    agent: task.agent,
                    scheduledAt: task.scheduledAt,
                    reason: reason, // Optional: Add a reason or note
                });
                yield trashTask.save();
            }
            yield taskModel_1.default.deleteMany({ _id: { $in: taskIds } });
            return res.status(200).json({ message: "Scheduled Task Deleted" });
        }
        res.status(200).json({ message: "Tasks deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting tasks:", error);
        return next((0, http_errors_1.default)(500, "Failed to delete tasks."));
    }
});
exports.deleteMultipleNonScheduledTasks = deleteMultipleNonScheduledTasks;
const deleteTask = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.taskId;
    const task = yield taskModel_1.default.findOne({ _id: taskId });
    if (!task) {
        return next((0, http_errors_1.default)(404, "Task not found"));
    }
    yield taskModel_1.default.deleteOne({ _id: taskId });
    res.status(204).json({ message: "Task deleted" });
});
exports.deleteTask = deleteTask;
