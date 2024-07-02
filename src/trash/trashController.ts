import { NextFunction, Request, Response } from "express";
import taskModel from "./trashModel";
import createHttpError from "http-errors";
import { Trash } from "./trashTypes";
import trashModel from "./trashModel";
import { AuthRequest } from "../utils/util";

async function createTrash(trashData: Trash): Promise<Trash | null> {
  try {
    const newTrash = await trashModel.create(trashData);
    return newTrash;
  } catch (error) {
    // Handle any errors
    console.error("Error creating trash:", error);
    return null;
  }
}

export const getAllTrashes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const _req = req as AuthRequest;

  try {
    let trashData;
    if (_req.userRole === "admin") {
      trashData = await trashModel.find().populate("agent", "name");
    } else if (_req.userRole === "agent") {
      trashData = await trashModel.find({ agent: _req.userId });
    } else {
      return next(
        createHttpError(403, "Access denied: Suspicious activity detected.")
      );
    }
    res.status(200).json(trashData);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error fetching trashes"));
  }
};
