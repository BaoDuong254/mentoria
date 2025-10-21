import poolPromise from "@/config/database";
import { TAccountSchema } from "@/validation/account.schema";
import bcrypt from "bcrypt";

const saltRounds = 10;

const hashPassword = async (plainText: string) => {
  const hashedPassword = await bcrypt.hash(plainText, saltRounds);
  return hashedPassword;
};

// const comparePassword = async (plainText: string, hash: string) => {
//   const isMatch = await bcrypt.compare(plainText, hash);
//   return isMatch;
// };

const isEmailExist = async (email: string): Promise<boolean> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const user = await pool.request().input("email", email).query("SELECT 1 FROM users WHERE email = @email");
  return user.recordset.length > 0;
};

const registerUserService = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<TAccountSchema> => {
  const passwordHash = await hashPassword(password);
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_expiration = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes from now

  // Insert user and get the inserted user data
  const result = await pool
    .request()
    .input("firstName", firstName)
    .input("lastName", lastName)
    .input("email", email)
    .input("password", passwordHash)
    .input("otp", otp)
    .input("otp_expiration", otp_expiration)
    .query(
      `INSERT INTO users (first_name, last_name, email, password, otp, otp_expiration)
       OUTPUT INSERTED.user_id, INSERTED.first_name, INSERTED.last_name, INSERTED.email,
              INSERTED.created_at, INSERTED.updated_at, INSERTED.sex, INSERTED.avatar_url,
              INSERTED.country, INSERTED.role, INSERTED.timezone, INSERTED.status, INSERTED.is_email_verified,
              INSERTED.otp, INSERTED.otp_expiration
       VALUES (@firstName, @lastName, @email, @password, @otp, @otp_expiration)`
    );

  return result.recordset[0];
};

export { isEmailExist, registerUserService };
