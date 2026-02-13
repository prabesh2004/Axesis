import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as aiController from "../controllers/aiController.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.post("/query", aiController.queryAi);
aiRouter.post("/analyze-resume", aiController.analyzeResume);
aiRouter.post("/insights", aiController.getInsights);
aiRouter.get("/insights/latest", aiController.getLatestInsights);
aiRouter.get("/skill-progress", aiController.getSkillProgress);
