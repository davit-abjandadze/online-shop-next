import { z } from "zod";

/** კატეგორიის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა. */
export const categoryFormSchema = z.object({
  nameKa: z.string().trim().min(1, "გთხოვთ შეავსოთ კატეგორიის სახელი ქართულად"),
  nameEn: z.string().trim().min(1, "გთხოვთ შეავსოთ კატეგორიის სახელი ინგლისურად"),
  slug: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ slug")
    .regex(/^[a-z0-9-]+$/, "slug უნდა შეიცავდეს მხოლოდ ლათინურ პატარა ასოებს, ციფრებს და ტირეს"),
  parentId: z.string().optional(),
  isActive: z.boolean(),
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

/** პროდუქტის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა. ფასი/მარაგი ფორმაში
 * სტრინგებადაა (input-ის ბუნებრივი ტიპი), submit-ის დროს გარდაიქმნება რიცხვებად. */
export const productFormSchema = z.object({
  name: z.string().trim().min(1, "გთხოვთ შეავსოთ პროდუქტის სახელი"),
  description: z.string().trim().optional(),
  price: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ ფასი")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "ფასი უნდა იყოს დადებითი რიცხვი"),
  stock: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ მარაგი")
    .refine((v) => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) >= 0, "მარაგი უნდა იყოს დადებითი მთელი რიცხვი"),
  categoryId: z.string().optional(),
  // თითო სურათის URL — ცალკე მწკრივია ფორმაში (რამდენიმე სურათის დამატება/წაშლა
  // შესაძლებელია პირდაპირ), ცარიელი სტრიქონები submit-ის წინ ფილტრდება.
  images: z.array(z.string()).optional(),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//.test(v), "ვიდეოს ლინკი უნდა იწყებოდეს http(s)://-ით"),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
