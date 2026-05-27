import { z } from "zod";

export const passengerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  phone: z.string().min(8, { message: "Phone number is required" }),
  email: z.string().email({ message: "Valid email required" }),
});
