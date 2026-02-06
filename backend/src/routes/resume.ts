import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import * as resumeController from "../controllers/resumeController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const resumeRouter = Router();

resumeRouter.use(requireAuth);

resumeRouter.get("/latest", resumeController.getLatestResume);
resumeRouter.post("/upload", upload.single("file"), resumeController.uploadResume);
