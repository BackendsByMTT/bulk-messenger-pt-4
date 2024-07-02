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
exports.getAllTasks = exports.getUserByUsername = exports.getAgentByUsername = exports.getAllAgents = exports.updateAgent = exports.deleteAgent = exports.getAllUser = exports.loginUser = exports.createUser = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("./userModel"));
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config/config");
const AdminKeyModel_1 = __importDefault(require("../superAdminKey/AdminKeyModel"));
const jwt = require("jsonwebtoken");
const taskModel_1 = __importDefault(require("../task/taskModel"));
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, name, password, role, status } = req.body;
    if (!username || !name || !password || !role) {
        const error = (0, http_errors_1.default)(400, "All fields are required");
        return next(error);
    }
    if (password.length < 6) {
        const error = (0, http_errors_1.default)(400, "Password should be at least 6 characters");
        return next(error);
    }
    const key = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        if (role == "admin") {
            if (!key) {
                return next((0, http_errors_1.default)(401, "Authorization key is required for admin role"));
            }
            const keys = yield AdminKeyModel_1.default.findOne({ key });
            if (!keys) {
                return next((0, http_errors_1.default)(401, "Invalid Authorization Key"));
            }
            else if (keys.key !== key) {
                return next((0, http_errors_1.default)(401, "Invalid Authorization Key"));
            }
        }
        const existingUser = yield userModel_1.default.findOne({ username: username });
        if (existingUser) {
            return next((0, http_errors_1.default)(400, "Username already registered"));
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = yield userModel_1.default.create({
            username,
            name,
            password: hashedPassword,
            role,
            status: status || "active",
        });
        res
            .status(201)
            .json({ message: "User created successfully", data: newUser });
    }
    catch (err) {
        console.error("Error while creating user:", err.message);
        return next((0, http_errors_1.default)(500, "Error while creating user."));
    }
});
exports.createUser = createUser;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return next((0, http_errors_1.default)(400, "All fields are required"));
    }
    try {
        const user = yield userModel_1.default.findOne({ username });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return next((0, http_errors_1.default)(400, "Username or password incorrect!"));
        }
        const token = (0, jsonwebtoken_1.sign)({ name: user.username, role: user.role, userId: user._id }, config_1.config.jwtSecret, {
            expiresIn: "7d",
            algorithm: "HS256",
        });
        res.cookie("accessToken", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            id: user._id,
            username: user.username,
            role: user.role,
            token,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.loginUser = loginUser;
const getAllUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AllUsers = yield userModel_1.default.find();
        res.status(200).json(AllUsers);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Failed to get users"));
    }
});
exports.getAllUser = getAllUser;
const getAllAgents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allAgents = yield userModel_1.default.find({ role: "agent" });
        res.status(200).json(allAgents);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Failed to get agents"));
    }
});
exports.getAllAgents = getAllAgents;
const getUserByUsername = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username: userToFind } = req.params;
        const agent = yield userModel_1.default.findOne({
            username: userToFind,
            role: "agent",
        });
        if (!agent) {
            return next((0, http_errors_1.default)(404, "Agent not found"));
        }
        return res.status(200).json({ agent });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "Failed to get agent"));
    }
});
exports.getUserByUsername = getUserByUsername;
const getAgentByUsername = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username: AgentToFind } = req.params;
        const agent = yield userModel_1.default.findOne({
            username: AgentToFind,
            role: "agent",
        });
        if (!agent) {
            return next((0, http_errors_1.default)(404, "Agent not found"));
        }
        return res.status(200).json({ agent });
    }
    catch (error) {
        next((0, http_errors_1.default)(400, "Failed to get agent"));
    }
});
exports.getAgentByUsername = getAgentByUsername;
const deleteAgent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username: userToDelete } = req.params;
        const user = yield userModel_1.default.findOne({
            username: userToDelete,
            role: "agent",
        });
        if (!user || !user.role || user.role !== "agent") {
            return next((0, http_errors_1.default)(403, "User is not an agent"));
        }
        const agent = yield userModel_1.default.deleteOne({ username: userToDelete });
        if (agent.deletedCount === 0) {
            return next((0, http_errors_1.default)(404, "Agent not found"));
        }
        res.status(200).json({ message: "Agent deleted successfully" });
    }
    catch (error) {
        return next((0, http_errors_1.default)(500, "Internal server error"));
    }
});
exports.deleteAgent = deleteAgent;
const updateAgent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username: agentToBeUpdated } = req.params;
        const { name, username, password, status } = req.body;
        const agent = yield userModel_1.default.findOne({
            username: agentToBeUpdated,
            role: "agent",
        });
        if (!agent) {
            return next((0, http_errors_1.default)(403, "User not found or user is not an agent"));
        }
        if (name) {
            agent.name = name;
            yield agent.save();
        }
        if (password) {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            agent.password = hashedPassword;
            yield agent.save();
        }
        if (status) {
            agent.status = status;
            yield agent.save();
        }
        if (username) {
            agent.username = username;
            yield agent.save();
        }
        return res
            .status(200)
            .json({ success: true, message: "Agent updated successfully" });
    }
    catch (error) {
        console.error("Error updating user:", error);
        next((0, http_errors_1.default)(500, "Unable to update agent"));
    }
});
exports.updateAgent = updateAgent;
const getAllTasks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const tasks = yield taskModel_1.default.find({ agent: userId });
        res.json(tasks);
    }
    catch (error) {
        return next((0, http_errors_1.default)(500, "Error fetching tasks"));
    }
});
exports.getAllTasks = getAllTasks;
