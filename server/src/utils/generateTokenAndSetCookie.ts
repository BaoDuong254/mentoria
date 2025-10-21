import envConfig from "@/config/env";
import { Response } from "express";
import jwt from "jsonwebtoken";

interface GenerateTokenParams {
  userId: string;
  userRole: string;
  userStatus: string;
}

export const generateTokenAndSetCookie = (
  res: Response,
  { userId, userRole, userStatus }: GenerateTokenParams
): string => {
  const token = jwt.sign({ userId, userRole, userStatus }, envConfig.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: envConfig.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
