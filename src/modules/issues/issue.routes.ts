import { Router } from "express";
import {
  createIssueController,
  getAllIssueController,
} from "./issue.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth, createIssueController);
router.get("/", getAllIssueController);

export default router;
