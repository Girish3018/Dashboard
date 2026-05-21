import pg from "pg";
import dotenv from "dotenv";

PORT=5002
PG_USER=girish
PG_HOST=localhost
PG_DATABASE=secrets_db
PG_PASSWORD=
PG_PORT=5432

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

export default pool;
