"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const userRouter_1 = __importDefault(require("./user/userRouter"));
const taskRouter_1 = __importDefault(require("./task/taskRouter"));
const AdminKeyRoutes_1 = __importDefault(require("./superAdminKey/AdminKeyRoutes"));
const trashRouter_1 = __importDefault(require("./trash/trashRouter"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
}));
// ROUTES
app.get("/", (req, res, next) => {
    const health = {
        uptime: process.uptime(),
        message: "OK",
        timestamp: new Date().toLocaleDateString(),
    };
    res.status(200).json(health);
});
app.use("/api/users", userRouter_1.default);
app.use("/api/tasks", taskRouter_1.default);
app.use("/api/trashes", trashRouter_1.default);
app.use("/api/keys", AdminKeyRoutes_1.default);
app.use(globalErrorHandler_1.default);
exports.default = server;
