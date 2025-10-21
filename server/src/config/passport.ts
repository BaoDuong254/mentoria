import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import envConfig from "@/config/env";
import { findOrCreateGoogleUser } from "@/services/google.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log("Google profile:", profile);
      try {
        // Prepare user data from Google profile
        const names = profile.displayName?.split(" ") || ["Unknown", "User"];
        const userData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "",
          firstName: names[0] || "Unknown",
          lastName: names.slice(1).join(" ") || "User",
          avatarUrl: profile.photos?.[0]?.value || undefined,
        };

        // Use the service to find or create user
        const user = await findOrCreateGoogleUser(userData);
        return cb(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return cb(error, false);
      }
    }
  )
);

export default passport;
