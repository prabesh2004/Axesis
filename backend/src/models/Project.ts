import { Schema, model, type Types } from "mongoose";

export type ProjectStatus = "In Progress" | "Completed" | "Planning";

export interface ProjectDoc {
  _id: string;
  user: Types.ObjectId;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  technologies: string[];
  repoUrl?: string;
  demoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["In Progress", "Completed", "Planning"], default: "Planning" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    technologies: { type: [String], default: [] },
    repoUrl: { type: String },
    demoUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: unknown) => {
        const obj = ret as Record<string, unknown>;
        obj.id = obj._id;
        delete (obj as Record<string, unknown>)._id;
        delete (obj as Record<string, unknown>).__v;
        if (obj.createdAt) obj.createdAt = new Date(obj.createdAt as string).toISOString();
        if (obj.updatedAt) obj.updatedAt = new Date(obj.updatedAt as string).toISOString();
        return obj;
      },
    },
  },
);

export const Project = model<ProjectDoc>("Project", projectSchema);
