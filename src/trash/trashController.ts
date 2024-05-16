import { NextFunction, Request, Response } from "express";
import taskModel from "./trashModel";
import createHttpError from "http-errors";
import { Trash } from "./trashTypes";
import trashModel from "./trashModel";

export interface AuthRequest extends Request {
  userId: string;
}

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
