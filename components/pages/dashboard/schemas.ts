import { z } from "zod";

/** კითხვის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა (react-hook-form + zod). */
export const questionFormSchema = z.object({
  text: z.string().trim().min(1, "გთხოვთ შეავსოთ კითხვის ტექსტი"),
  type: z.enum(["single", "multiple"]),
  categoryId: z.union([z.number(), z.literal("")]).optional(),
  endDate: z.string().optional(),
  answers: z
    .array(
      z.object({
        id: z.number().optional(),
        text: z.string().trim(),
      })
    )
    .refine((answers) => answers.filter((a) => a.text.trim().length > 0).length >= 2, {
      message: "გთხოვთ მიუთითოთ მინიმუმ 2 სავარაუდო პასუხი",
    }),
});

export type QuestionFormValues = z.infer<typeof questionFormSchema>;

/** კატეგორიის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა. */
export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "გთხოვთ შეავსოთ კატეგორიის სახელი"),
  description: z.string().trim().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
