import envConfig from "@/config/env";
import chalk from "chalk";
import sql from "mssql";

const config = {
  user: envConfig.DB_USER,
  password: envConfig.DB_PASS,
  server: envConfig.DB_SERVER,
  database: envConfig.DB_NAME,
  options: {
    trustedConnection: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log(chalk.green("Connected to SQL Server successfully"));
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

export default poolPromise;
