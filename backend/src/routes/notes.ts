import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as notesController from "../controllers/notesController.js";

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.get("/", notesController.listNotes);
notesRouter.post("/", notesController.createNote);
notesRouter.get("/:id", notesController.getNote);
notesRouter.put("/:id", notesController.updateNote);
notesRouter.delete("/:id", notesController.deleteNote);
