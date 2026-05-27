import type { Request, Response } from "express";
import issueService from "./issue.service";
import { sendResponse } from "../../utils/sendResponse";
import type { Issue, RIssue } from "./issue.interface";
import authService from "../auth/auth.service";
import type { User } from "../auth/auth.interface";
import type { IssueFilters } from "./issue.interface";

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

export const getAllIssueController = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;

    const allIssue = (await issueService.getAllIssueService({
      sort,
      type,
      status,
    } as IssueFilters)) as Issue[];

    if (allIssue.length === 0) {
      return sendResponse(res, { message: "No issue found", data: [] }, 200);
    }

    const reporterIds = [
      ...new Set(allIssue.map((issue) => issue.reporter_id)),
    ];

    const users = (await authService.getUsers(reporterIds)) as User[];

    const formattedIssue = await issueService.formattedData(allIssue, users);

    sendResponse(
      res,
      { message: "Issue get successfully", data: formattedIssue },
      200,
    );
  } catch (error) {
    console.error(error);
  }
};

export const getSingleIssueController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return;
    }
    const singleIssue = (await issueService.getSingleIssueService(
      id,
    )) as Issue[];

    if (singleIssue.length === 0) {
      return sendResponse(res, { message: "No issue found", data: [] }, 200);
    }

    const reporterIds = [
      ...new Set(singleIssue.map((issue) => issue.reporter_id)),
    ];

    const users = (await authService.getUsers(reporterIds)) as User[];

    const formattedIssue = await issueService.formattedData(singleIssue, users);

    const issue = formattedIssue[0];

    if (!issue) return null;

    sendResponse(res, { message: "Issue get successfully", data: issue }, 200);
  } catch (error) {
    console.error(error);
  }
};
