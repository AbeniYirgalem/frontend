import { Schema, model, models, type Types } from "mongoose";

export type SeatDocument = {
  bus: Types.ObjectId;
  seatNumber: string;
  status: "available" | "reserved" | "blocked";
};

const SeatSchema = new Schema<SeatDocument>(
  {
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    seatNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "blocked"],
      default: "available",
    },
  },
  { timestamps: true },
);

export const Seat = models.Seat || model<SeatDocument>("Seat", SeatSchema);
