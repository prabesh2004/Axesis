import { Schema, model, type Types } from "mongoose";

export interface ResumeDoc {
  _id: string;
  user: Types.ObjectId;
  fileName: string;
  mimeType: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<ResumeDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    text: { type: String, required: true },
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

export const Resume = model<ResumeDoc>("Resume", resumeSchema);
