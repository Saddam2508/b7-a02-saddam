export const role = ["contributor", "maintainer"] as const;
export type Role = (typeof role)[number];

export type User = {
  id?: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
};

export type RUser = Omit<User, "created_at" | "updated_at" | "password_hash">;
