import type { Request, Response } from "express";
import issueService from "./issue.service";
import { sendResponse } from "../../utils/sendResponse";

export const createIssueController = async (req: Request, res: Response) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user);
    if (!issue) {
      return sendResponse(
        res,
        { message: "Failed to create issue", error: true },
        400,
      );
    }
    sendResponse(
      res,
      { message: "Issue registered successfully", data: issue },
      200,
    );
  } catch (error) {
    console.error(error);
  }
};
