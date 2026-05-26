import { neon } from "@neondatabase/serverless";
import { config } from "../config";
import { createIssueSchema, createUserSchema } from "./schema";

export const sql = neon(config.database_url);

export const initDB = async () => {
  await createUserSchema();
  await createIssueSchema();
  console.log("Database connected successfully!");
};
