import { Schema, model } from "mongoose";

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: unknown) => {
        const obj = ret as Record<string, unknown>;
        obj.id = obj._id;
        delete (obj as Record<string, unknown>)._id;
        delete (obj as Record<string, unknown>).__v;
        delete (obj as Record<string, unknown>).passwordHash;
        return obj;
      },
    },
  },
);

export const User = model<UserDoc>("User", userSchema);
