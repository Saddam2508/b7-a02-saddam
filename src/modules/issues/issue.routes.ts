import { Router } from "express";
import { createIssueController } from "./issue.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/", auth, createIssueController);

export default router;
