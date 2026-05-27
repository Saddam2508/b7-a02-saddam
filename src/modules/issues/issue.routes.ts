import { Router } from "express";
import {
  createIssueController,
  deleteIssue,
  getAllIssueController,
  getSingleIssueController,
  updateIssueController,
} from "./issue.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth, createIssueController);
router.get("/", getAllIssueController);
router.get("/:id", getSingleIssueController);
router.patch("/:id", auth, updateIssueController);
router.delete("/:id", auth, deleteIssue);

export default router;
