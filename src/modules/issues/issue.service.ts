import { sql } from "../../db";
import { verifyToken } from "../../utils/jwt";
import type { User } from "../auth/auth.interface";
import type { RIssue } from "./issue.interface";

class IssueService {
  async createIssue(issue: RIssue, user: User) {
    const reporter_id = user.id;
    const { title, description, type } = issue;
    const result = await sql`
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES (${title}, ${description}, ${type}, ${reporter_id})
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    
    `;
    return result[0];
  }
}

export default new IssueService();
