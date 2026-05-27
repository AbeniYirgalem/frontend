import { Schema, model, models, type Types } from "mongoose";

export type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  role: "passenger" | "operator" | "admin";
  phone?: string;
  operatorProfile?: Types.ObjectId;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["passenger", "operator", "admin"],
      default: "passenger",
    },
    phone: { type: String },
    operatorProfile: { type: Schema.Types.ObjectId, ref: "BusOperator" },
  },
  { timestamps: true },
);

export const User = models.User || model<UserDocument>("User", UserSchema);
