import { z } from "zod";

/** მიწოდების მისამართის ფორმის ვალიდაციის სქემა (react-hook-form + zod). */
export const checkoutFormSchema = z.object({
  shippingAddress: z
    .string()
    .trim()
    .min(5, "გთხოვთ მიუთითოთ სრული მიწოდების მისამართი"),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
