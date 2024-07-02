"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("./userController");
const userRouter = express_1.default.Router();
const middleAuth_1 = require("../middlewares/middleAuth");
const authenticate_1 = __importDefault(require("../middlewares/authenticate"));
userRouter.get("/", (req, res, next) => {
    res.json({ message: "User Route" });
});
// REGISTER
userRouter.post("/register", userController_1.createUser);
// LOGIN
userRouter.post("/login", middleAuth_1.checkUserStatus, userController_1.loginUser);
// GET ALL USERS
userRouter.get("/allUsers", authenticate_1.default, userController_1.getAllUser);
// GET ALL AGENTS
userRouter.get("/agents", middleAuth_1.isAdmin, userController_1.getAllAgents);
// GET ALL USERS
userRouter.get("/agents/:username", middleAuth_1.isAdmin, userController_1.getUserByUsername);
// DELETE A USER BY USERNAME
userRouter.delete("/agents/:username", middleAuth_1.isAdmin, userController_1.deleteAgent);
// UPDATE A USER BY USERNAME
userRouter.put("/agents/:username", middleAuth_1.isAdmin, userController_1.updateAgent);
// GET AGENT BY USERNAME
userRouter.get("/agents/:username", middleAuth_1.isAdmin, userController_1.getAgentByUsername);
// GET AGENT TASKS
userRouter.get("/:userId/tasks", authenticate_1.default, userController_1.getAllTasks);
exports.default = userRouter;
