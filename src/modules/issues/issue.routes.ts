import { Router } from "express";
import {
  createIssueController,
  getAllIssueController,
  getSingleIssueController,
} from "./issue.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth, createIssueController);
router.get("/", getAllIssueController);
router.get("/:id", getSingleIssueController);

export default router;
