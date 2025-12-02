import poolPromise from "@/config/database";
import bcrypt from "bcryptjs";

export interface UserSettings {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  role: string;
  bio?: string | null;
  headline?: string | null;
  social_links: { platform: string; link: string }[];
  skills?: string[];
}

export interface UpdateUserSettingsRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  headline?: string;
  socialLinks?: { platform: string; link: string }[];
  skills?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const getUserSettingsService = async (
  userId: string
): Promise<{ success: boolean; message: string; data?: UserSettings }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const userResult = await pool
      .request()
      .input("userId", userId)
      .query(
        "SELECT u.user_id, u.first_name, u.last_name, u.email, u.username, u.avatar_url, u.role, m.bio, m.headline FROM users u LEFT JOIN mentors m ON u.user_id = m.user_id WHERE u.user_id = @userId"
      );

    if (userResult.recordset.length === 0) {
      return { success: false, message: "User not found" };
    }

    const user = userResult.recordset[0];

    const socialLinksResult = await pool
      .request()
      .input("userId", userId)
      .query("SELECT platform, link FROM user_social_links WHERE user_id = @userId");

    let skills: string[] = [];
    if (user.role === "Mentor") {
      const skillsResult = await pool
        .request()
        .input("userId", userId)
        .query(
          "SELECT s.skill_name FROM set_skill ss INNER JOIN skills s ON ss.skill_id = s.skill_id WHERE ss.mentor_id = @userId"
        );
      skills = skillsResult.recordset.map((r: { skill_name: string }) => r.skill_name);
    }

    return {
      success: true,
      message: "User settings retrieved successfully",
      data: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
        bio: user.bio,
        headline: user.headline,
        social_links: socialLinksResult.recordset,
        skills,
      },
    };
  } catch (error) {
    console.error("Error in getUserSettingsService:", error);
    throw error;
  }
};

export const updateUserSettingsService = async (
  userId: string,
  data: UpdateUserSettingsRequest
): Promise<{ success: boolean; message: string }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const userCheck = await pool
      .request()
      .input("userId", userId)
      .query("SELECT user_id, role FROM users WHERE user_id = @userId");
    if (userCheck.recordset.length === 0) {
      return { success: false, message: "User not found" };
    }

    const userRole = userCheck.recordset[0].role;
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      const userUpdateFields: string[] = [];
      const userRequest = transaction.request().input("userId", userId);

      if (data.firstName !== undefined) {
        userUpdateFields.push("first_name = @firstName");
        userRequest.input("firstName", data.firstName);
      }
      if (data.lastName !== undefined) {
        userUpdateFields.push("last_name = @lastName");
        userRequest.input("lastName", data.lastName);
      }
      if (data.username !== undefined) {
        const usernameCheck = await transaction
          .request()
          .input("username", data.username)
          .input("userId", userId)
          .query("SELECT user_id FROM users WHERE username = @username AND user_id != @userId");
        if (usernameCheck.recordset.length > 0) {
          await transaction.rollback();
          return { success: false, message: "Username is already taken" };
        }
        userUpdateFields.push("username = @username");
        userRequest.input("username", data.username);
      }

      if (userUpdateFields.length > 0) {
        userUpdateFields.push("updated_at = GETDATE()");
        await userRequest.query("UPDATE users SET " + userUpdateFields.join(", ") + " WHERE user_id = @userId");
      }

      if (userRole === "Mentor") {
        const mentorUpdateFields: string[] = [];
        const mentorRequest = transaction.request().input("userId", userId);

        if (data.bio !== undefined) {
          mentorUpdateFields.push("bio = @bio");
          mentorRequest.input("bio", data.bio);
        }
        if (data.headline !== undefined) {
          mentorUpdateFields.push("headline = @headline");
          mentorRequest.input("headline", data.headline);
        }

        if (mentorUpdateFields.length > 0) {
          await mentorRequest.query("UPDATE mentors SET " + mentorUpdateFields.join(", ") + " WHERE user_id = @userId");
        }

        if (data.skills !== undefined) {
          await transaction.request().input("userId", userId).query("DELETE FROM set_skill WHERE mentor_id = @userId");

          for (const skillName of data.skills) {
            const skillResult = await transaction
              .request()
              .input("skillName", skillName)
              .query("SELECT skill_id FROM skills WHERE skill_name = @skillName");

            let skillId: number;
            if (skillResult.recordset.length === 0) {
              const insertResult = await transaction
                .request()
                .input("skillName", skillName)
                .query("INSERT INTO skills (skill_name) OUTPUT INSERTED.skill_id VALUES (@skillName)");
              skillId = insertResult.recordset[0].skill_id;
            } else {
              skillId = skillResult.recordset[0].skill_id;
            }

            await transaction
              .request()
              .input("userId", userId)
              .input("skillId", skillId)
              .query("INSERT INTO set_skill (mentor_id, skill_id) VALUES (@userId, @skillId)");
          }
        }
      }

      if (data.socialLinks !== undefined) {
        await transaction
          .request()
          .input("userId", userId)
          .query("DELETE FROM user_social_links WHERE user_id = @userId");

        for (const link of data.socialLinks) {
          if (link.link && link.link.trim() !== "") {
            await transaction
              .request()
              .input("userId", userId)
              .input("platform", link.platform)
              .input("link", link.link)
              .query("INSERT INTO user_social_links (user_id, platform, link) VALUES (@userId, @platform, @link)");
          }
        }
      }

      await transaction.commit();
      return { success: true, message: "Settings updated successfully" };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error in updateUserSettingsService:", error);
    throw error;
  }
};

export const changePasswordService = async (
  userId: string,
  data: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const userResult = await pool
      .request()
      .input("userId", userId)
      .query("SELECT password, provider FROM users WHERE user_id = @userId");

    if (userResult.recordset.length === 0) {
      return { success: false, message: "User not found" };
    }

    const user = userResult.recordset[0];

    if (user.provider === "Google" && !user.password) {
      return { success: false, message: "Cannot change password for Google-authenticated accounts" };
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    await pool
      .request()
      .input("userId", userId)
      .input("password", hashedPassword)
      .query("UPDATE users SET password = @password, updated_at = GETDATE() WHERE user_id = @userId");

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in changePasswordService:", error);
    throw error;
  }
};
