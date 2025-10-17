import { z } from "zod";

export const checkoutFormSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must be less than 10 digits"),
  address: z
    .string()
    .min(10, "Address is required")
    .max(200, "Address must be less than 200 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must be less than 50 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(50, "State must be less than 50 characters"),
  pincode: z
    .string()
    .min(6, "Pincode must have 6 digits")
    .max(6, "Pincode must have 6 digits"),
  payment_method: z.enum(["cod", "online"], {
    message: "Please select a payment method",
  }),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
