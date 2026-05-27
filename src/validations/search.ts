import { z } from "zod";

export const searchSchema = z.object({
  from: z.string().min(2, { message: "Select a departure city" }),
  to: z.string().min(2, { message: "Select a destination city" }),
  date: z.string().min(2, { message: "Select a travel date" }),
});
