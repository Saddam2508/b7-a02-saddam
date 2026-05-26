import type { Request, Response } from "express";

import { signToken, verifyToken } from "../../utils/jwt";
import { sendResponse } from "../../utils/sendResponse";
import authService from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const user = await authService.createUser({ name, email, password, role });

  if (!user) {
    return sendResponse(
      res,
      { message: "Failed to create user", error: true },
      400,
    );
  }

  sendResponse(
    res,
    { message: "User registered successfully", data: user },
    200,
  );
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.validateUser(email, password);

  if (!user) {
    return sendResponse(
      res,
      { message: "Invalid email or password", error: true },
      401,
    );
  }

  const { accessToken, refreshToken } = signToken(user);

  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  });

  const result = {
    accessToken,
    refreshToken,
    user: user,
  };

  sendResponse(res, { message: "User login successfully!", data: result });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return sendResponse(
      res,
      { message: "No active session found", error: true },
      400,
    );
  }

  res.clearCookie("refreshToken", {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  });

  sendResponse(res, { message: "Logged out successfully" }, 200);
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return sendResponse(
      res,
      { message: "Refresh token not provided", error: true },
      401,
    );
  }

  const payload = verifyToken(refreshToken, "refresh");

  if (!payload) {
    return sendResponse(
      res,
      { message: "Invalid or expired refresh token", error: true },
      403,
    );
  }

  const user = await authService.getUserById(payload.id);

  if (!user) {
    return sendResponse(res, { message: "User not found", error: true }, 404);
  }

  const { accessToken, refreshToken: newRefreshToken } = signToken(user);

  res.cookie("refreshToken", newRefreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  });

  sendResponse(
    res,
    { message: "Token refreshed successfully", data: { accessToken } },
    200,
  );
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return sendResponse(res, { message: "Unauthorized", error: true }, 401);
  }
  const userId = verifyToken(accessToken, "access")?.id;

  const user = await authService.getUserById(userId);

  if (!user) {
    return sendResponse(res, { message: "User not found", error: true }, 404);
  }

  sendResponse(res, { message: "User fetched successfully", data: user }, 200);
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendResponse(res, { message: "Unauthorized", error: true }, 401);
  }

  const { name, email, password } = req.body;

  const updated = await authService.updateUser(userId, {
    name,
    email,
    password,
  });

  if (!updated) {
    return sendResponse(
      res,
      { message: "Failed to update user", error: true },
      400,
    );
  }

  sendResponse(
    res,
    { message: "User updated successfully", data: updated },
    200,
  );
};

export const deleteAccount = async (req: Request, res: Response) => {
  const id = req.user?.id;

  if (!id) {
    return sendResponse(res, { message: "Unauthorized", error: true }, 401);
  }

  const deleted = await authService.deleteUser(id);

  if (!deleted) {
    return sendResponse(
      res,
      { message: "Failed to delete account", error: true },
      400,
    );
  }

  res.clearCookie("refreshToken", {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  });

  sendResponse(res, { message: "Account deleted successfully" }, 200);
};
