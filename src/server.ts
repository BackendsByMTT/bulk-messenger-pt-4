import express from "express";
import http from "http";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import taskRouter from "./task/taskRouter";
import adminKeyRouter from "./superAdminKey/AdminKeyRoutes";
import trashRouter from "./trash/trashRouter";
import cors from 'cors'
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
// ROUTES
app.get("/", (req, res, next) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };
  res.status(200).json(health);
});

app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/trashes", trashRouter);
app.use("/api/keys", adminKeyRouter);
app.use(globalErrorHandler);

export default server;
