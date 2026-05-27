import { Schema, model, models, type Types } from "mongoose";

export type NotificationDocument = {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
};

const NotificationSchema = new Schema<NotificationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning"],
      default: "info",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification =
  models.Notification ||
  model<NotificationDocument>("Notification", NotificationSchema);
