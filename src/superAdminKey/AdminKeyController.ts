import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import AdminKeyModel from "./AdminKeyModel";
import { Keys } from "./AdminKeyTypes";
const createAdminKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { key } = req.body;
  if (!key) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  if (key.length < 4) {
    next(createHttpError("Key should be at least 4 characters"));
  }

  try {
    const keys = await AdminKeyModel.findOne({ key });
    if (keys) {
      const error = createHttpError(400, "key already created");
      return next(error);
    }
    // const hashedkey = await bcrypt.hash(key, 4);
    let newKeys: Keys;
    newKeys = await AdminKeyModel.create({
      key,
    });
    res.status(201).json({ message: "Key created succesfully" });
  } catch (error) {
    return next(createHttpError(500, "Error while creating keys"));
  }
};
export default createAdminKey;
