import { Schema, model, type Types } from "mongoose";

export interface SkillProgressItem {
  skill: string;
  percentage: number;
}

export interface SkillProgressDoc {
  _id: string;
  user: Types.ObjectId;
  key: string;
  generatedAt: Date;
  skills: SkillProgressItem[];
  createdAt: Date;
  updatedAt: Date;
}

const skillProgressSchema = new Schema<SkillProgressDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true, index: true },
    generatedAt: { type: Date, required: true },
    skills: {
      type: [
        {
          skill: { type: String, required: true },
          percentage: { type: Number, required: true, min: 0, max: 100 },
        },
      ],
      default: [],
    },
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
        if (obj.generatedAt) obj.generatedAt = new Date(obj.generatedAt as string).toISOString();
        return obj;
      },
    },
  },
);

skillProgressSchema.index({ user: 1, key: 1 }, { unique: true });

export const SkillProgress = model<SkillProgressDoc>("SkillProgress", skillProgressSchema);
