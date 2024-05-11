import express from "express";
import http from "http";
import WebSocket from "ws";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
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

app.use(globalErrorHandler);

export { wss };
export default server;
