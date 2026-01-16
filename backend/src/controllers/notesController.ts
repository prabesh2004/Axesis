import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { Note } from "../models/Note.js";

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export async function listNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const notes = await Note.find({ user: userId }).sort({ updatedAt: -1 });
    return res.json(notes.map((n) => n.toJSON()));
  } catch (err) {
    return next(err);
  }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = createSchema.parse(req.body);
    const note = await Note.create({ ...input, user: userId });
    return res.status(201).json(note.toJSON());
  } catch (err) {
    return next(err);
  }
}

export async function getNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const note = await Note.findOne({ _id: req.params.id, user: userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json(note.toJSON());
  } catch (err) {
    return next(err);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const patch = updateSchema.parse(req.body);
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: userId }, patch, { new: true });
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.json(note.toJSON());
  } catch (err) {
    return next(err);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const note = await Note.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!note) return res.status(404).json({ message: "Note not found" });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
