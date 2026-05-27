import { Schema, model, models, type Types } from "mongoose";

export type ReviewDocument = {
  passenger: Types.ObjectId;
  bus: Types.ObjectId;
  rating: number;
  comment?: string;
};

const ReviewSchema = new Schema<ReviewDocument>(
  {
    passenger: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true },
);

export const Review =
  models.Review || model<ReviewDocument>("Review", ReviewSchema);
