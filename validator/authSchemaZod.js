import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Please Enter a Valid Email"),
  password: z.string(),
});

export const otpSchema = z.object({
  email: z.email("Please, Enter a valid  email"),
  otp: z
    .string("Please Enter a valid 4 digit OTP")
    .regex(/^d{4}$/, "Please enter valid 4 digit otp"),
});

export const signUpSchema = loginSchema.extend({
  name: z.string().min(5, "Name should atleast 3 character"),
  otp: z
    .string("Please Enter a valid 4 digit OTP")
    .regex(/^\d{4}$/, "Please enter valid 4 digit otp"),
});
