import type { NextFunction, Request, Response } from "express";

import authService from "../modules/auth/auth.service";
import type { Role } from "../modules/auth/auth.interface";
import { verifyToken } from "../utils/jwt";
import { sendResponse } from "../utils/sendResponse";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse(
        res,
        { message: "Access token is missing", error: true },
        401,
      );
    }

    const tokenWithoutBearer = token.split(" ")[1];

    const payload = verifyToken(tokenWithoutBearer as string, "refresh");
    if (!payload) {
      return sendResponse(
        res,
        { message: "Invalid access token", error: true },
        401,
      );
    }
    const user = await authService.getUserById(payload.id);

    if (!user) {
      return sendResponse(res, { message: "User not found", error: true }, 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendResponse(_res, { message: "Unauthorized", error: true }, 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(
        _res,
        { message: "Forbidden - you don't have permission", error: true },
        403,
      );
    }

    return next();
  };
};
