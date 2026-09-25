import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter the password"),
});

export type LoginValues = z.infer<typeof loginSchema>;
