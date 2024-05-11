import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, name, password, role } = req.body;

  // Validation
  if (!username || !name || !password || !role) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  // Database call.
  try {
    const user = await userModel.findOne({ username });
    if (user) {
      const error = createHttpError(
        400,
        "User already exists with this email."
      );
      return next(error);
    }
  } catch (err) {
    return next(createHttpError(500, "Error while getting user"));
  }

  /// password -> hash

  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser: User;
  try {
    newUser = await userModel.create({
      username,
      name,
      password: hashedPassword,
      role,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while creating user."));
  }

  try {
    // Token generation JWT
    const token = sign(
      { name: newUser.username, role: newUser.role },
      config.jwtSecret as string,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );
    // Response
    res.status(201).json({ accessToken: token });
  } catch (err) {
    return next(createHttpError(500, "Error while signing the jwt token"));
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
      { name: user.username, role: user.role },
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
    res.status(200).send("Logged in successfully");
    console.log(`USERLOGIN ${user.username} WITH ROLE ${user.role}`);
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
};

export { createUser, loginUser };
