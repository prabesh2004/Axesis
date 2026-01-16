import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as projectsController from "../controllers/projectsController.js";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get("/", projectsController.listProjects);
projectsRouter.post("/", projectsController.createProject);
projectsRouter.put("/:id", projectsController.updateProject);
projectsRouter.delete("/:id", projectsController.deleteProject);
