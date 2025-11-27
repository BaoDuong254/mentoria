import poolPromise from "@/config/database";

interface GoogleUserData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | undefined;
}

interface GoogleUserResult {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  google_id: string;
  avatar_url?: string;
  provider: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  created_at: string;
}

const findOrCreateGoogleUser = async (userData: GoogleUserData): Promise<GoogleUserResult> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const { googleId, email, firstName, lastName, avatarUrl } = userData;

  // Check if user exists with this Google ID
  const existingUser = await pool
    .request()
    .input("googleId", googleId)
    .query("SELECT * FROM users WHERE google_id = @googleId");

  if (existingUser.recordset.length > 0) {
    return existingUser.recordset[0];
  }

  // Check if user exists with this email (from another provider)
  const existingEmailUser = await pool
    .request()
    .input("email", email)
    .query("SELECT * FROM users WHERE email = @email");

  if (existingEmailUser.recordset.length > 0) {
    // Update existing user with Google ID
    const updatedUser = await pool
      .request()
      .input("googleId", googleId)
      .input("avatarUrl", avatarUrl)
      .input("provider", "Google")
      .input("isEmailVerified", true)
      .input("userId", existingEmailUser.recordset[0].user_id).query(`UPDATE users
        SET google_id = @googleId,
            avatar_url = @avatarUrl,
            provider = @provider,
            is_email_verified = @isEmailVerified,
            updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE user_id = @userId`);

    return updatedUser.recordset[0];
  }

  // Create new user with transaction
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    const newUser = await transaction
      .request()
      .input("firstName", firstName)
      .input("lastName", lastName)
      .input("email", email)
      .input("googleId", googleId)
      .input("avatarUrl", avatarUrl)
      .input("provider", "google")
      .input("isEmailVerified", true).query(`INSERT INTO users (
          first_name, last_name, email, google_id,
          avatar_url, provider, is_email_verified, status
        )
        OUTPUT INSERTED.*
        VALUES (
          @firstName, @lastName, @email, @googleId,
          @avatarUrl, @provider, @isEmailVerified, 'Active'
        )`);

    const user = newUser.recordset[0];

    // Insert into mentees table (default role is Mentee)
    await transaction.request().input("userId", user.user_id).query(`INSERT INTO mentees (user_id) VALUES (@userId)`);

    await transaction.commit();
    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const findUserByGoogleId = async (googleId: string): Promise<GoogleUserResult | null> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const result = await pool
    .request()
    .input("googleId", googleId)
    .query("SELECT * FROM users WHERE google_id = @googleId");

  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export { findOrCreateGoogleUser, findUserByGoogleId, type GoogleUserData, type GoogleUserResult };
