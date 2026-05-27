import { sql } from "../../db";
import { verifyToken } from "../../utils/jwt";
import type { User } from "../auth/auth.interface";
import type { IssueFilters, RIssue } from "./issue.interface";

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

  private buildFilters(filters: IssueFilters) {
    const conditions: string[] = [];

    if (filters.type) {
      conditions.push(`type = '${filters.type}'`);
    }

    if (filters.status) {
      conditions.push(`status = '${filters.status}'`);
    }

    if (conditions.length === 0) {
      return "";
    }

    return `WHERE ${conditions.join(" AND ")}`;
  }

  private buildSort(sort?: string) {
    if (sort === "oldest") {
      return `ORDER BY created_at ASC`;
    }

    return `ORDER BY created_at DESC`;
  }

  async getAllIssueService(filters: IssueFilters = {}) {
    const whereClause = this.buildFilters(filters);
    const orderClause = this.buildSort(filters.sort);
    const query = `
    SELECT *
    FROM issues
    ${whereClause}
    ${orderClause}
  `;

    const result = await sql.query(query);

    return result;
  }
}

export default new IssueService();
