import { Schema, model, models, type Types } from "mongoose";

export type BusDocument = {
  operator: Types.ObjectId;
  name: string;
  type: string;
  seatCount: number;
  amenities: string[];
  image?: string;
};

const BusSchema = new Schema<BusDocument>(
  {
    operator: {
      type: Schema.Types.ObjectId,
      ref: "BusOperator",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, required: true },
    seatCount: { type: Number, required: true },
    amenities: [{ type: String }],
    image: { type: String },
  },
  { timestamps: true },
);

export const Bus = models.Bus || model<BusDocument>("Bus", BusSchema);
