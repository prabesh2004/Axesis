import { Schema, model, type Types } from "mongoose";

export interface AiInsightsDoc {
  _id: string;
  user: Types.ObjectId;
  generatedAt: Date;
  report: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const aiInsightsSchema = new Schema<AiInsightsDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    generatedAt: { type: Date, required: true, default: Date.now, index: true },
    report: { type: Schema.Types.Mixed, required: true },
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

export const AiInsights = model<AiInsightsDoc>("AiInsights", aiInsightsSchema);
