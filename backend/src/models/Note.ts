import { Schema, model, type Types } from "mongoose";

export interface NoteDoc {
  _id: string;
  user: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<NoteDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
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

export const Note = model<NoteDoc>("Note", noteSchema);
