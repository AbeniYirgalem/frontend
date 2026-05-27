import { Schema, model, models } from "mongoose";

export type RouteDocument = {
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  durationMinutes: number;
};

const RouteSchema = new Schema<RouteDocument>(
  {
    originCity: { type: String, required: true },
    destinationCity: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Route = models.Route || model<RouteDocument>("Route", RouteSchema);
