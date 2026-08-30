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

/** ფილიალის სამუშაო საათების კვირის დღეების key-ები/ლეიბლები — ფორმისა და
 * checkout-ის ჩვენებისთვის ერთი წყარო. */
export const BRANCH_DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type BranchDayKey = (typeof BRANCH_DAY_KEYS)[number];
export const BRANCH_DAY_LABELS: Record<BranchDayKey, string> = {
  mon: "ორშაბათი",
  tue: "სამშაბათი",
  wed: "ოთხშაბათი",
  thu: "ხუთშაბათი",
  fri: "პარასკევი",
  sat: "შაბათი",
  sun: "კვირა",
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const branchDayHoursSchema = z
  .object({
    closed: z.boolean(),
    open: z.string(),
    close: z.string(),
  })
  .refine((v) => v.closed || TIME_REGEX.test(v.open), {
    message: "გახსნის დრო არასწორი ფორმატისაა",
    path: ["open"],
  })
  .refine((v) => v.closed || TIME_REGEX.test(v.close), {
    message: "დახურვის დრო არასწორი ფორმატისაა",
    path: ["close"],
  });

/** ფილიალის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა. `latitude`/`longitude`
 * სტრინგებადაა (input-ის ბუნებრივი ტიპი), submit-ის დროს რიცხვებად გარდაიქმნება. */
export const branchFormSchema = z.object({
  title: z.string().trim().min(1, "გთხოვთ შეავსოთ ფილიალის დასახელება"),
  address: z.string().trim().min(1, "გთხოვთ მიუთითოთ მისამართი"),
  phoneNumber: z.string().trim().min(1, "გთხოვთ მიუთითოთ ტელეფონის ნომერი"),
  email: z.string().trim().optional().refine((v) => !v || z.string().email().safeParse(v).success, "ელფოსტა არასწორი ფორმატისაა"),
  latitude: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ განედი (latitude)")
    .refine((v) => !isNaN(Number(v)), "განედი უნდა იყოს რიცხვი"),
  longitude: z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ გრძედი (longitude)")
    .refine((v) => !isNaN(Number(v)), "გრძედი უნდა იყოს რიცხვი"),
  workingHours: z.object({
    mon: branchDayHoursSchema,
    tue: branchDayHoursSchema,
    wed: branchDayHoursSchema,
    thu: branchDayHoursSchema,
    fri: branchDayHoursSchema,
    sat: branchDayHoursSchema,
    sun: branchDayHoursSchema,
  }),
  isActive: z.boolean(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;

/** ფერის (ბიბლიოთეკის) შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა.
 * `hexCode` არასავალდებულოა — მითითების შემთხვევაში მხოლოდ ვალიდურ HEX
 * ფორმატს ვამოწმებთ (3 ან 6 სიმბოლო). */
export const colorFormSchema = z.object({
  nameKa: z.string().trim().min(1, "გთხოვთ შეავსოთ ფერის სახელი ქართულად"),
  nameEn: z.string().trim().min(1, "გთხოვთ შეავსოთ ფერის სახელი ინგლისურად"),
  hexCode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v), "HEX კოდი არასწორი ფორმატისაა (მაგ: #FF0000)"),
});

export type ColorFormValues = z.infer<typeof colorFormSchema>;
