import poolPromise from "@/config/database";
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
): Promise<void> => {
  const passwordHash = await hashPassword(password);
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  await pool
    .request()
    .input("firstName", firstName)
    .input("lastName", lastName)
    .input("email", email)
    .input("password", passwordHash)
    .query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (@firstName, @lastName, @email, @password)"
    );
};

export { isEmailExist, registerUserService };
