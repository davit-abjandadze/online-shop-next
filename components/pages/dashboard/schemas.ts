import { z } from "zod";

/** კითხვის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა (react-hook-form + zod). */
export const questionFormSchema = z.object({
  text: z.string().trim().min(1, "გთხოვთ შეავსოთ კითხვის ტექსტი"),
  type: z.enum(["single", "multiple"]),
  categoryIds: z.array(z.number()).optional(),
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

/** მომხმარებლის შექმნის ფორმის ვალიდაციის სქემა. */
export const userCreateFormSchema = z.object({
  firstName: z.string().trim().min(1, "გთხოვთ შეავსოთ სახელი"),
  lastName: z.string().trim().min(1, "გთხოვთ შეავსოთ გვარი"),
  email: z.string().trim().min(1, "გთხოვთ შეავსოთ ელ. ფოსტა").email("არასწორი ელ. ფოსტის ფორმატი"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
  role: z.enum(["admin", "user"]),
  gender: z.enum(["male", "female"]).optional().or(z.literal("")),
  age: z.string().optional(),
});

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>;

/** მომხმარებლის რედაქტირების ფორმის ვალიდაციის სქემა (პაროლის გარეშე). */
export const userEditFormSchema = z.object({
  firstName: z.string().trim().min(1, "გთხოვთ შეავსოთ სახელი"),
  lastName: z.string().trim().min(1, "გთხოვთ შეავსოთ გვარი"),
  email: z.string().trim().min(1, "გთხოვთ შეავსოთ ელ. ფოსტა").email("არასწორი ელ. ფოსტის ფორმატი"),
  role: z.enum(["admin", "user"]),
  gender: z.enum(["male", "female"]).optional().or(z.literal("")),
  age: z.string().optional(),
});

export type UserEditFormValues = z.infer<typeof userEditFormSchema>;
