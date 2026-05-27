import { Schema, model, models, type Types } from "mongoose";

export type BusOperatorDocument = {
  companyName: string;
  description?: string;
  user: Types.ObjectId;
  approvalStatus: "pending" | "approved" | "suspended";
  headquarters?: string;
};

const BusOperatorSchema = new Schema<BusOperatorDocument>(
  {
    companyName: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
    headquarters: { type: String },
  },
  { timestamps: true },
);

export const BusOperator =
  models.BusOperator ||
  model<BusOperatorDocument>("BusOperator", BusOperatorSchema);
