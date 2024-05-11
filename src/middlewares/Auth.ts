const jwt = require("jsonwebtoken");
import { config } from "../config/config";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "../user/userModel";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      const error = createHttpError(401, "Authorization token is missing");
      return next(error);
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong with Authorization token",
    });
  }
};

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.cookies.accessToken) {
      const error = createHttpError(401, "Authorization token is missing");
      return next(error);
    }
    const accessToken = req.cookies.accessToken;
    const decodedToken = jwt.verify(accessToken, config.jwtSecret);
    const username = decodedToken.username;

    const checkForAdmin = await userModel.findOne({ username: username });

    if (!checkForAdmin) {
      const error = createHttpError(401, "You are not an Admin");
      return next(error);
    } else {
      console.log("YOU ARE ADMIN");
    }
    next();
  } catch (error) {
    createHttpError(401, "Admin Authentication Failed");
    return next(error);
  }
};

const checkUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.body;

  try {
    const user = await userModel.findOne(username);
    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }
    const userStatus = user.status;
    if (userStatus === "inactive") {
      const error = createHttpError(403, "User is inactive and cannot log in");
      return next(error);
    }
    next();
  } catch (error: any) {
    console.error("Error checking user status:", error.message);
    createHttpError(500, "Internal Server Error");
    return next(error);
  }
};

export { authenticate, isAdmin, checkUserStatus };
