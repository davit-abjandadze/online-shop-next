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
  // ფასდაკლება პროცენტებში (0-100), არასავალდებულო — ცარიელი ველი ნიშნავს ფასდაკლების არარსებობას.
  discountPercent: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
      "ფასდაკლება უნდა იყოს 0-დან 100-მდე რიცხვი"
    ),
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

/** attribute-ის (მახასიათებლის) შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა.
 * `sortOrder` სტრინგადაა (input-ის ბუნებრივი ტიპი), submit-ის დროს რიცხვად გარდაიქმნება. */
export const attributeFormSchema = z.object({
  nameKa: z.string().trim().min(1, "გთხოვთ შეავსოთ მახასიათებლის სახელი ქართულად"),
  nameEn: z.string().trim().min(1, "გთხოვთ შეავსოთ მახასიათებლის სახელი ინგლისურად"),
  code: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ code")
    .regex(/^[a-z0-9_-]+$/, "code უნდა შეიცავდეს მხოლოდ ლათინურ პატარა ასოებს, ციფრებს, ტირეს და ქვედა ტირეს"),
  type: z.enum(["select", "multi_select", "number", "text", "boolean", "range"]),
  unit: z.string().trim().optional(),
  isFilterable: z.boolean(),
  isRequired: z.boolean(),
  sortOrder: z
    .string()
    .trim()
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number.isInteger(Number(v))), "sortOrder უნდა იყოს მთელი რიცხვი"),
});

export type AttributeFormValues = z.infer<typeof attributeFormSchema>;

/** attribute-ის option-ის (მხოლოდ select/multi_select ტიპისთვის) ფორმის ვალიდაციის სქემა. */
export const attributeOptionFormSchema = z.object({
  valueKa: z.string().trim().min(1, "გთხოვთ შეავსოთ მნიშვნელობა ქართულად"),
  valueEn: z.string().trim().min(1, "გთხოვთ შეავსოთ მნიშვნელობა ინგლისურად"),
  code: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ code")
    .regex(/^[a-z0-9_-]+$/, "code უნდა შეიცავდეს მხოლოდ ლათინურ პატარა ასოებს, ციფრებს, ტირეს და ქვედა ტირეს"),
  sortOrder: z
    .string()
    .trim()
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number.isInteger(Number(v))), "sortOrder უნდა იყოს მთელი რიცხვი"),
});

export type AttributeOptionFormValues = z.infer<typeof attributeOptionFormSchema>;
