import { z } from "zod";

/** მისამართის დამატება/რედაქტირების ფორმის ვალიდაციის სქემა (checkout-ის შენახული მისამართები). */
export const addressFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "გთხოვთ მიუთითოთ მისამართის სახელი (მაგ. სახლი, სამსახური)"),
  phoneNumber: z.string().trim().min(4, "გთხოვთ მიუთითოთ ტელეფონის ნომერი"),
  city: z.string().trim().min(1, "გთხოვთ აირჩიოთ ქალაქი"),
  address: z.string().trim().min(5, "გთხოვთ მიუთითოთ სრული მისამართი"),
  comment: z.string().trim().optional(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
