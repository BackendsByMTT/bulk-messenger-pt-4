"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("./taskController");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
const taskRouter = express_1.default.Router();
taskRouter.post("/", authenticate_1.default, taskController_1.createTask);
taskRouter.get("/", authenticate_1.default, taskController_1.getTasks);
taskRouter.get("/:taskId", authenticate_1.default, taskController_1.getTaskById);
taskRouter.delete("/", taskController_1.deleteMultipleNonScheduledTasks);
taskRouter.delete("/:taskId", authenticate_1.default, taskController_1.deleteTask);
exports.default = taskRouter;
