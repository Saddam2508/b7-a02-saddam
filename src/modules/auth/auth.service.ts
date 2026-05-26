import bcrypt from "bcrypt";
import type { RUser, User } from "./auth.interface";
import { sql } from "../../db";

class AuthService {
  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  async createUser(user: RUser & { password: string }) {
    const { name, email, password, role } = user;
    const passwordHash = await this.hashPassword(password);
    const result = await sql`
    INSERT INTO users (name, email, password_hash, role) 
    VALUES (${name}, ${email}, ${passwordHash}, COALESCE(${role}, 'contributor'))
    RETURNING id, name, email, role, created_at, updated_at
    `;
    return result[0];
  }
  async validateUser(email: string, password: string) {
    const result = await sql`
      SELECT id, name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE email = ${email}
    `;

    if (!result.length) {
      return null;
    }

    const { password_hash, ...user } = result[0] as User;

    const isValid = await this.comparePassword(password, password_hash);

    return isValid ? user : null;
  }
  async getUsers() {
    const result = await sql`
      SELECT id, name, email, role
      FROM users
    `;
    return result;
  }

  async getUserById(userId: string) {
    const result = await sql`
      SELECT id, name, email, age, role
      FROM users
      WHERE id = ${userId}
    `;
    return result[0] as RUser & { id: string };
  }

  async updateUser(
    userId: string,
    updates: Partial<RUser> & {
      password?: string;
    },
  ) {
    const { name, email, role, password } = updates;

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await this.hashPassword(password);
    }

    const result = await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        role = COALESCE(${role}, role),
        password_hash = COALESCE(${passwordHash}, password_hash),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, role, created_at, updated_at
    `;
    return result[0];
  }

  async deleteUser(userId: string) {
    try {
      await sql`
        DELETE FROM users
        WHERE id = ${userId}
      `;
      return true;
    } catch {
      return false;
    }
  }
}
export default new AuthService();
