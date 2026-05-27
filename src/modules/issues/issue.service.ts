import { sql } from "../../db";
import type { User } from "../auth/auth.interface";
import type { Issue, IssueFilters, RIssue } from "./issue.interface";

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

  private async formattedObjectIssue(allIssue: Issue[], users: User[]) {
    const result = allIssue.map((issue) => {
      const reporter = users.find((user) => user.id === issue.reporter_id);
      const formatted = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter
          ? {
              id: reporter.id,
              name: reporter.name,
              role: reporter.role,
            }
          : null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
      return formatted;
    });
    return result;
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

  async formattedData(allIssue: Issue[], users: User[]) {
    return this.formattedObjectIssue(allIssue, users);
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

  async getSingleIssueService(id: string) {
    const result = await sql`
    SELECT * FROM issues WHERE id=${id}
    `;
    return result;
  }
}

export default new IssueService();
