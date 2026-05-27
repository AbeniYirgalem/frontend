import { Schema, model, models, type Types } from "mongoose";

export type TicketDocument = {
  booking: Types.ObjectId;
  ticketNumber: string;
  qrCode: string;
  status: "confirmed" | "pending" | "cancelled";
};

const TicketSchema = new Schema<TicketDocument>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    ticketNumber: { type: String, required: true },
    qrCode: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

export const Ticket =
  models.Ticket || model<TicketDocument>("Ticket", TicketSchema);
