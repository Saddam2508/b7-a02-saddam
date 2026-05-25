import { neon } from "@neondatabase/serverless";
import { config } from "../config";
import { createUserSchema } from "./schema";

export const sql = neon(config.database_url);

export const initDB = async () => {
  await createUserSchema();
  console.log("Database connected successfully!");
};
