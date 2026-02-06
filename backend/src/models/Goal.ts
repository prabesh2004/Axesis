import { Schema, model, type Types } from "mongoose";

export interface GoalDoc {
  _id: string;
  user: Types.ObjectId;
  targetRoles: string[];
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<GoalDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true, unique: true },
    targetRoles: { type: [String], default: [] },
    interests: { type: [String], default: [] },
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

export const Goal = model<GoalDoc>("Goal", goalSchema);
