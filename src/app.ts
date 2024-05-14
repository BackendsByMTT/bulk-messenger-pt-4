import express from "express";
import http from "http";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import taskRouter from "./task/taskRouter";
import adminKeyRouter from "./superAdminKey/AdminKeyRoutes";

const app = express();
const server = http.createServer(app);
app.use(express.json());

// ROUTES
app.get("/", (req, res, next) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };

  res.json(health);
});

app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/keys", adminKeyRouter);
app.use(globalErrorHandler);

export default server;
