import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();
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

app.use(globalErrorHandler);

export default app;
