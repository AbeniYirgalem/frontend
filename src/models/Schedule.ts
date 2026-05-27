import { Schema, model, models, type Types } from "mongoose";

export type ScheduleDocument = {
  bus: Types.ObjectId;
  route: Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  availableSeats: number;
};

const ScheduleSchema = new Schema<ScheduleDocument>(
  {
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    route: { type: Schema.Types.ObjectId, ref: "Route", required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    price: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Schedule =
  models.Schedule || model<ScheduleDocument>("Schedule", ScheduleSchema);
