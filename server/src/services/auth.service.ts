import poolPromise from "@/config/database";

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
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  await pool
    .request()
    .input("firstName", firstName)
    .input("lastName", lastName)
    .input("email", email)
    .input("password", password)
    .query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (@firstName, @lastName, @email, @password)"
    );
};

export { isEmailExist, registerUserService };
