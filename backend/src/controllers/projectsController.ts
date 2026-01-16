import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { Project } from "../models/Project.js";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["In Progress", "Completed", "Planning"]).default("Planning"),
  progress: z.number().min(0).max(100).default(0),
  technologies: z.array(z.string()).default([]),
  repoUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
});

const updateSchema = createSchema.partial();

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const projects = await Project.find({ user: userId }).sort({ updatedAt: -1 });
    return res.json(projects.map((p) => p.toJSON()));
  } catch (err) {
    return next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = createSchema.parse(req.body);
    const project = await Project.create({
      ...input,
      repoUrl: input.repoUrl ? input.repoUrl : undefined,
      demoUrl: input.demoUrl ? input.demoUrl : undefined,
      user: userId,
    });
    return res.status(201).json(project.toJSON());
  } catch (err) {
    return next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const patch = updateSchema.parse(req.body);
    const cleaned = {
      ...patch,
      repoUrl: patch.repoUrl ? patch.repoUrl : undefined,
      demoUrl: patch.demoUrl ? patch.demoUrl : undefined,
    };
    const project = await Project.findOneAndUpdate({ _id: req.params.id, user: userId }, cleaned, { new: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project.toJSON());
  } catch (err) {
    return next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const project = await Project.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
