import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";
import AdminKeyModel from "../superAdminKey/AdminKeyModel";
const jwt = require("jsonwebtoken");

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, name, password, role, status } = req.body;
  if (!username || !name || !password || !role) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  if (password.length < 6) {
    const error = createHttpError(
      400,
      "Password should be at least 6 characters"
    );
    return next(error);
  }

  const key = req.header("Authorization")?.split(" ")[1];
  console.log(key, "adminkeys");

  try {
    if (role === "admin") {
      const keys = await AdminKeyModel.findOne({ key });
      console.log(keys);
      if (!keys) {
        return next(createHttpError(401, "Invalid Authorization Key"));
      } else if (keys.key !== key) {
        return next(createHttpError(401, "Invalid Authorization Key"));
      }

      const existingUser = await userModel.findOne({ username });
      if (existingUser) {
        return next(createHttpError(400, "Username already registered"));
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = await userModel.create({
      username,
      name,
      password: hashedPassword,
      role,
      status: status || "active",
    });

    const token = sign(
      { name: newUser.username, role: newUser.role },
      config.jwtSecret as string,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    res
      .status(201)
      .json({ accessToken: token, message: "User created successfully" });
  } catch (err) {
    console.error("Error while creating user:", err);
    return next(createHttpError(500, "Error while creating user."));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return next(createHttpError(404, "User not found."));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(400, "Username or password incorrect!"));
    }

    const token = sign(
      { name: user.username, role: user.role, userId: user._id },
      config.jwtSecret as string,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );
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
    console.log(`USERLOGIN ${user.username} WITH ROLE ${user.role}`);
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AllUsers = await userModel.find();
    res.status(200).json(AllUsers);
  } catch (error) {
    next(createHttpError(500, "Failed to get users"));
  }
};

const getAllAgents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allAgents = await userModel.find({ role: "agent" });
    res.status(200).json(allAgents);
  } catch (error) {
    next(createHttpError(500, "Failed to get agents"));
  }
};

const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username: userToFind } = req.params;
    const agent = await userModel.findOne({
      username: userToFind,
      role: "agent",
    });
    if (!agent) {
      return next(createHttpError(404, "Agent not found"));
    }
    return res.status(200).json({ agent });
  } catch (error) {
    next(createHttpError(400, "Failed to get agent"));
  }
};

const getAgentByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username: AgentToFind } = req.params;
    const agent = await userModel.findOne({
      username: AgentToFind,
      role: "agent",
    });
    if (!agent) {
      return next(createHttpError(404, "Agent not found"));
    }
    return res.status(200).json({ agent });
  } catch (error) {
    next(createHttpError(400, "Failed to get agent"));
  }
};

const deleteAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username: userToDelete } = req.body;
    const user = await userModel.findOne({
      username: userToDelete,
      role: "agent",
    });
    if (!user || !user.role || user.role !== "agent") {
      return next(createHttpError(403, "User is not an agent"));
    }
    const agent = await userModel.deleteOne({ username: userToDelete });
    if (agent.deletedCount === 0) {
      return next(createHttpError(404, "Agent not found"));
    }
    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    return next(createHttpError(500, "Internal server error"));
  }
};

const updateAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username: agentToBeUpdated } = req.params;
    const { name, username, password, status } = req.body;

    const agent = await userModel.findOne({
      username: agentToBeUpdated,
      role: "agent",
    });
    if (!agent) {
      return next(
        createHttpError(403, "User not found or user is not an agent")
      );
    }
    if (name) {
      agent.name = name;
      await agent.save();
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      agent.password = hashedPassword;
      await agent.save();
    }

    if (status) {
      agent.status = status;
      await agent.save();
    }

    if (username) {
      agent.username = username;
      await agent.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Agent updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    next(createHttpError(500, "Unable to update agent"));
  }
};

export {
  createUser,
  loginUser,
  getAllUser,
  deleteAgent,
  updateAgent,
  getAllAgents,
  getAgentByUsername,
  getUserByUsername,
};
