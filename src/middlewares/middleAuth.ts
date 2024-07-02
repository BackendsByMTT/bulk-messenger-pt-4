import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "../user/userModel";
import { AuthRequest, CustomJwtPayload } from "../utils/util";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  try {
    if (!token) {
      return next(createHttpError(401, "Authorization token is missing"));
    }
    const accessToken = token.split(" ")[1];
    const decodedToken = jwt.verify(
      accessToken,
      config.jwtSecret as string
    ) as CustomJwtPayload;

    const user = decodedToken.name;
    const checkForAdmin = await userModel.findOne({
      username: user,
      role: "admin",
    });

    console.log(checkForAdmin);

    if (!checkForAdmin) {
      const _req = req as AuthRequest;
      _req.userId = decodedToken.userId;
      _req.userRole = decodedToken.role;

      return next(createHttpError(401, "You are not an Admin"));
    }
    next();
  } catch (error) {
    return next(createHttpError(401, "Admin Authentication Failed"));
  }
};

const checkUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.body;

  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const userStatus = user.status;
    if (userStatus === "inactive") {
      return next(createHttpError(403, "User is inactive and cannot log in"));
    }

    next();
  } catch (error: any) {
    console.error("Error checking user status:", error.message);
    return next(createHttpError(500, "Internal Server Error"));
  }
};

export { isAdmin, checkUserStatus };