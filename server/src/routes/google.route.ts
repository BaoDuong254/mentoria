import express, { Router } from "express";
import passport from "passport";
import { generateTokenAndSetCookie } from "@/utils/generateTokenAndSetCookie";
import envConfig from "@/config/env";
import { Status } from "@/constants/type";

const router: Router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  try {
    if (!req.user) {
      console.error("No user found in Google OAuth callback");
      return res.redirect(`${envConfig.CLIENT_URL}/login?error=google_failed`);
    }

    const user = req.user as {
      user_id: string;
      role: string;
      status: string;
      first_name: string;
      last_name: string;
      email: string;
    };

    console.log("Google OAuth successful for user:", user.email);

    // Check account status before allowing login
    if (user.status === Status.Banned) {
      console.log("Banned user attempted Google login:", user.email);
      return res.redirect(`${envConfig.CLIENT_URL}/login?error=account_banned`);
    }

    const payload = {
      userId: user.user_id,
      userRole: user.role,
      userStatus: user.status,
    };

    generateTokenAndSetCookie(res, payload);
    return res.redirect(`${envConfig.CLIENT_URL}?login=success`);
  } catch (error) {
    console.error("Google login error:", error);
    return res.redirect(`${envConfig.CLIENT_URL}/login?error=google_failed`);
  }
});

export default router;
