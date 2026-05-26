import jwt, { type JwtPayload } from "jsonwebtoken";

import { config } from "../config";
import type { RUser } from "../modules/auth/auth.interface";

export const verifyToken = (token: string, type: "access" | "refresh") => {
  const secret = type === "refresh" ? config.refresh_secret : config.secret;
  const decoded = jwt.verify(token, secret) as JwtPayload;
  return decoded;
};

export const signToken = (payload: RUser) => {
  const accessToken = jwt.sign(payload, config.secret, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign(payload, config.refresh_secret, {
    expiresIn: "30d",
  });

  return { accessToken, refreshToken };
};
