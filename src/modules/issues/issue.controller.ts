import type { Request, Response } from "express";
import issueService from "./issue.service";
import { sendResponse } from "../../utils/sendResponse";
import type { Issue, RIssue } from "./issue.interface";
import authService from "../auth/auth.service";
import type { RUser, User } from "../auth/auth.interface";
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

export const updateIssueController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      sendResponse(
        res,
        {
          message: "Issue id not found",
          error: true,
        },
        400,
      );
    }

    if (typeof id !== "string") {
      return;
    }

    const { title, description, type } = req.body;

    const user = req.user as RUser;
    if (!user) {
      return sendResponse(
        res,
        {
          message: "Unauthorized",
          error: true,
        },
        401,
      );
    }

    // issue fetch
    const existingIssue = await issueService.getSingleIssueService(id);

    const issue = existingIssue[0];

    if (!issue) {
      return sendResponse(
        res,
        {
          message: "Issue not found",
          error: true,
        },
        404,
      );
    }

    // authorization check
    const isOwner = issue.reporter_id === user.id;
    const isMaintainer = user.role === "maintainer";

    if (!isOwner && !isMaintainer) {
      return sendResponse(
        res,
        {
          message: "Forbidden",
          error: true,
        },
        403,
      );
    }

    const updated = await issueService.updateIssueService(id, {
      title,
      description,
      type,
    });

    if (!updated) {
      return sendResponse(
        res,
        { message: "Failed to update issue", error: true },
        400,
      );
    }
    sendResponse(
      res,
      { message: "User updated successfully", data: updated },
      200,
    );
  } catch (error) {
    console.error(error);
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(
        res,
        {
          message: "Issue id not found",
          error: true,
        },
        400,
      );
    }
    if (typeof id !== "string") {
      return;
    }

    const user = req.user as RUser;
    if (!user) {
      return sendResponse(
        res,
        {
          message: "Unauthorized",
          error: true,
        },
        401,
      );
    }

    // only maintainer can delete
    if (user.role !== "maintainer") {
      return sendResponse(
        res,
        {
          message: "Forbidden",
          error: true,
        },
        403,
      );
    }

    // issue fetch
    const existingIssue = await issueService.getSingleIssueService(id);

    const issue = existingIssue[0];

    if (!issue) {
      sendResponse(
        res,
        {
          message: "Issue not found",
          error: true,
        },
        404,
      );
    }

    const deleted = await issueService.deleteIssue(id);

    if (!deleted) {
      return sendResponse(
        res,
        { message: "Failed to delete issue", error: true },
        400,
      );
    }

    sendResponse(res, { message: "Issue deleted successfully" }, 200);
  } catch (error) {
    console.error(error);

    return sendResponse(
      res,
      {
        message: "Internal server error",
        error: true,
      },
      500,
    );
  }
};
