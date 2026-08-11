import { z } from "zod";

/**
 * User-ის მიერ ("ჩვეულებრივი" ვერსია) კითხვის დამატების ფორმის ვალიდაციის სქემა.
 * `isActive` ველი განზრახ არ არის შემავალი — ამ გადაწყვეტილებას იღებს ბექენდი
 * (admin-ის კითხვები ავტომატურად აქტიურდება, user-ის კითხვები კი მოლოდინშია
 * admin-ის დასტურამდე).
 */
export const askQuestionSchema = z.object({
  text: z.string().trim().min(1, "გთხოვთ შეავსოთ კითხვის ტექსტი"),
  type: z.enum(["single", "multiple"]),
  categoryId: z.union([z.number(), z.literal("")]).refine((val) => val !== "", {
    message: "გთხოვთ მიუთითოთ კატეგორია",
  }),
  answers: z
    .array(z.object({ text: z.string().trim() }))
    .max(4, "მაქსიმუმ 4 სავარაუდო პასუხის დამატებაა შესაძლებელი")
    .refine((answers) => answers.filter((a) => a.text.trim().length > 0).length >= 2, {
      message: "გთხოვთ მიუთითოთ მინიმუმ 2 სავარაუდო პასუხი",
    }),
});

export type AskQuestionFormValues = z.infer<typeof askQuestionSchema>;
