import express from "express";

const app = express();

// ROUTES
app.get("/", (req, res, next) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };

  res.json(health);
});
export default app;
