import poolPromise from "@/config/database";
import envConfig from "@/config/env";
import { Role, Status } from "@/constants/type";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  let userId: string | undefined;

  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET);

    if (!decoded || typeof decoded === "string" || !("userId" in decoded)) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    userId = (decoded as jwt.JwtPayload).userId;

    const pool = await poolPromise;
    if (!pool) throw new Error("Database connection not established");
    const result = await pool
      .request()
      .input("userId", userId)
      .query(
        "SELECT user_id, first_name, last_name, sex, created_at, updated_at, email, avatar_url, country, role, timezone, status, google_id, provider FROM users WHERE user_id = @userId"
      );
    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      sex: user.sex,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email: user.email,
      avatar_url: user.avatar_url,
      country: user.country,
      role: user.role,
      timezone: user.timezone,
      status: user.status,
      google_id: user.google_id,
      provider: user.provider,
    };

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error);

    // If token is expired or invalid, set user status to Inactive
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      if (userId) {
        try {
          const pool = await poolPromise;
          if (pool) {
            await pool
              .request()
              .input("userId", userId)
              .input("status", Status.Inactive)
              .query("UPDATE users SET status = @status, updated_at = GETDATE() WHERE user_id = @userId");

            console.log(`User ${userId} status set to Inactive due to token expiration/invalid`);
          }
        } catch (updateError) {
          console.log("Error updating user status to Inactive:", updateError);
        }
      }

      // Clear the invalid cookie
      res.clearCookie("token", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      return res.status(401).json({ message: "Token expired or invalid - Please login again" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== Role.Admin) {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
  }
  next();
};
