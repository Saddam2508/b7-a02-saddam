export const typeItem = ["bug", "feature_request"] as const;

type IssueType = (typeof typeItem)[number];

export type Issue = {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
};

export type RIssue = Omit<
  Issue,
  "id" | "created_at" | "updated_at" | "reporter_id"
>;
