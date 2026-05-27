import { Schema, model, models, type Types } from "mongoose";

export type BookingDocument = {
  passenger: Types.ObjectId;
  schedule: Types.ObjectId;
  seats: string[];
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
};

const BookingSchema = new Schema<BookingDocument>(
  {
    passenger: { type: Schema.Types.ObjectId, ref: "User", required: true },
    schedule: { type: Schema.Types.ObjectId, ref: "Schedule", required: true },
    seats: [{ type: String, required: true }],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Booking =
  models.Booking || model<BookingDocument>("Booking", BookingSchema);
