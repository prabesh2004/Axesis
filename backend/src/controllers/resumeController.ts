import type { Request, Response, NextFunction } from "express";

import { Resume } from "../models/Resume.js";
import { extractResumeText, isSupportedResumeMimeType } from "../services/resumeParser.js";

const MAX_TEXT_LENGTH = 200_000;

export async function uploadResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "Resume file is required" });

    if (!isSupportedResumeMimeType(file.mimetype)) {
      return res.status(400).json({ message: "Unsupported file type. Upload PDF or DOCX." });
    }

    const extraction = await extractResumeText(file.buffer, file.mimetype);
    const text = extraction.text.slice(0, MAX_TEXT_LENGTH).trim();

    if (!text) {
      return res.status(400).json({ message: "Unable to extract text from resume" });
    }

    await Resume.deleteMany({ user: userId });

    const resume = await Resume.create({
      user: userId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      text,
    });

    return res.status(201).json({
      ...resume.toJSON(),
      warnings: extraction.warnings,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getLatestResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    return res.json(resume.toJSON());
  } catch (err) {
    return next(err);
  }
}
