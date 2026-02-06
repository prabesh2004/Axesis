import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as goalsController from "../controllers/goalsController.js";

export const goalsRouter = Router();

goalsRouter.use(requireAuth);

goalsRouter.get("/", goalsController.getGoals);
goalsRouter.put("/", goalsController.updateGoals);
