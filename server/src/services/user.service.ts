import poolPromise from "@/config/database";

const updateAvatarService = async (userId: number, avatarUrl: string) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Update user avatar
    await pool
      .request()
      .input("userId", userId)
      .input("avatarUrl", avatarUrl)
      .input("updatedAt", new Date())
      .query("UPDATE users SET avatar_url = @avatarUrl, updated_at = @updatedAt WHERE user_id = @userId");

    return {
      success: true,
      message: "Avatar updated successfully",
    };
  } catch (error) {
    console.error("Error in updateAvatarService:", error);
    throw error;
  }
};

export { updateAvatarService };
