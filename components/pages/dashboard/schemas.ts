import { z } from "zod";

/** ბექენდის Phase 1-ის ცვლილების შემდეგ Category/Attribute/Color-ს ორი
 * ცალკე (`nameKa`/`nameEn`) ველის ნაცვლად სამენოვანი `translations` obj
 * აქვს — `ka` სავალდებულოა, `en`/`ru` არასავალდებულო. */
const nameTranslationsSchema = (entityLabel: string) =>
  z.object({
    ka: z.object({ name: z.string().trim().min(1, `გთხოვთ შეავსოთ ${entityLabel} ქართულად`) }),
    en: z.object({ name: z.string().trim().optional() }),
    ru: z.object({ name: z.string().trim().optional() }),
  });

/** AttributeOption-ისთვის იგივე, `name` ველის ნაცვლად `value`-ზე. */
const valueTranslationsSchema = z.object({
  ka: z.object({ value: z.string().trim().min(1, "გთხოვთ შეავსოთ მნიშვნელობა ქართულად") }),
  en: z.object({ value: z.string().trim().optional() }),
  ru: z.object({ value: z.string().trim().optional() }),
});

/** ბექენდზე გასაგზავნ `translations` obj-ს აგებს ფორმის მნიშვნელობებიდან —
 * `ka` ყოველთვის იგზავნება, `en`/`ru` მხოლოდ თუ მომხმარებელმა შეავსო
 * (ცარიელი ველები არ იგზავნება, სქემის optional-ობის შესაბამისად). */
export const buildNameTranslationsDto = (t: {
  ka: { name: string };
  en: { name?: string };
  ru: { name?: string };
}) => {
  const dto: { ka: { name: string }; en?: { name: string }; ru?: { name: string } } = {
    ka: { name: t.ka.name.trim() },
  };
  const en = t.en.name?.trim();
  const ru = t.ru.name?.trim();
  if (en) dto.en = { name: en };
  if (ru) dto.ru = { name: ru };
  return dto;
};

/** იგივე `buildNameTranslationsDto`-ს, AttributeOption-ის `value` ველზე. */
export const buildValueTranslationsDto = (t: {
  ka: { value: string };
  en: { value?: string };
  ru: { value?: string };
}) => {
  const dto: { ka: { value: string }; en?: { value: string }; ru?: { value: string } } = {
    ka: { value: t.ka.value.trim() },
  };
  const en = t.en.value?.trim();
  const ru = t.ru.value?.trim();
  if (en) dto.en = { value: en };
  if (ru) dto.ru = { value: ru };
  return dto;
};

/** Product-ისთვის იგივე, `name`/`description` წყვილზე. `description`
 * ყოველთვის არასავალდებულოა (ka-შიც). */
export const buildProductTranslationsDto = (t: {
  ka: { name: string; description?: string };
  en: { name?: string; description?: string };
  ru: { name?: string; description?: string };
}) => {
  const dto: {
    ka: { name: string; description?: string };
    en?: { name: string; description?: string };
    ru?: { name: string; description?: string };
  } = { ka: { name: t.ka.name.trim() } };
  const kaDescription = t.ka.description?.trim();
  if (kaDescription) dto.ka.description = kaDescription;

  const enName = t.en.name?.trim();
  const enDescription = t.en.description?.trim();
  if (enName) dto.en = { name: enName, ...(enDescription ? { description: enDescription } : {}) };

  const ruName = t.ru.name?.trim();
  const ruDescription = t.ru.description?.trim();
  if (ruName) dto.ru = { name: ruName, ...(ruDescription ? { description: ruDescription } : {}) };

  return dto;
};

/** `translations` (`unknown` — Category/Product-ის გენერირებულ ტიპში
 * ბუნდოვნადაა `object`) ფორმის საწყის მნიშვნელობებად კითხულობს, edit
 * მოდალის გახსნისას. */
export const readNameTranslations = (translations: unknown) => {
  const t = (translations || {}) as Partial<Record<"ka" | "en" | "ru", { name?: string } | undefined>>;
  return {
    ka: { name: t?.ka?.name || "" },
    en: { name: t?.en?.name || "" },
    ru: { name: t?.ru?.name || "" },
  };
};

export const readValueTranslations = (translations: unknown) => {
  const t = (translations || {}) as Partial<Record<"ka" | "en" | "ru", { value?: string } | undefined>>;
  return {
    ka: { value: t?.ka?.value || "" },
    en: { value: t?.en?.value || "" },
    ru: { value: t?.ru?.value || "" },
  };
};

export const readProductTranslations = (translations: unknown) => {
  const t = (translations || {}) as Partial<
    Record<"ka" | "en" | "ru", { name?: string; description?: string } | undefined>
  >;
  return {
    ka: { name: t?.ka?.name || "", description: t?.ka?.description || "" },
    en: { name: t?.en?.name || "", description: t?.en?.description || "" },
    ru: { name: t?.ru?.name || "", description: t?.ru?.description || "" },
  };
};

/** კატეგორიის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა. */
export const categoryFormSchema = z.object({
  translations: nameTranslationsSchema("კატეგორიის სახელი"),
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

/** Product-ისთვის იგივე `nameTranslationsSchema`-ს, `name`/`description`
 * წყვილზე — `description` ყოველთვის არასავალდებულოა (ka-შიც). */
const productTranslationsSchema = z.object({
  ka: z.object({
    name: z.string().trim().min(1, "გთხოვთ შეავსოთ პროდუქტის სახელი ქართულად"),
    description: z.string().trim().optional(),
  }),
  en: z.object({ name: z.string().trim().optional(), description: z.string().trim().optional() }),
  ru: z.object({ name: z.string().trim().optional(), description: z.string().trim().optional() }),
});

/** პროდუქტის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა. ფასი/მარაგი ფორმაში
 * სტრინგებადაა (input-ის ბუნებრივი ტიპი), submit-ის დროს გარდაიქმნება რიცხვებად. */
export const productFormSchema = z.object({
  translations: productTranslationsSchema,
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
  companyId: z.string().trim().min(1, "გთხოვთ აირჩიოთ მფლობელი კომპანია"),
  // თითო სურათის URL — ცალკე მწკრივია ფორმაში (რამდენიმე სურათის დამატება/წაშლა
  // შესაძლებელია პირდაპირ), ცარიელი სტრიქონები submit-ის წინ ფილტრდება.
  images: z.array(z.string()).optional(),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//.test(v), "ვიდეოს ლინკი უნდა იწყებოდეს http(s)://-ით"),
  // წონა/სიგრძე/სიგანე — არასავალდებულო ფიზიკური პარამეტრები (მიწოდების გაანგარიშებისთვის).
  weight: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), "წონა უნდა იყოს დადებითი რიცხვი"),
  length: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), "სიგრძე უნდა იყოს დადებითი რიცხვი"),
  width: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), "სიგანე უნდა იყოს დადებითი რიცხვი"),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** attribute-ის (მახასიათებლის) შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა.
 * `sortOrder` სტრინგადაა (input-ის ბუნებრივი ტიპი), submit-ის დროს რიცხვად გარდაიქმნება. */
export const attributeFormSchema = z.object({
  translations: nameTranslationsSchema("მახასიათებლის სახელი"),
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
  translations: valueTranslationsSchema,
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
  companyId: z.string().trim().min(1, "გთხოვთ აირჩიოთ მფლობელი კომპანია"),
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
  translations: nameTranslationsSchema("ფერის სახელი"),
  hexCode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v), "HEX კოდი არასწორი ფორმატისაა (მაგ: #FF0000)"),
});

export type ColorFormValues = z.infer<typeof colorFormSchema>;

/** კომპანიის შექმნა/რედაქტირების ფორმის ვალიდაციის სქემა — ColorsPage-ის იგივე
 * ბრტყელი (ჩადგმული ველების გარეშე) სქემის სტილით. */
export const companyFormSchema = z.object({
  name: z.string().trim().min(2, "გთხოვთ შეავსოთ კომპანიის დასახელება (მინ. 2 სიმბოლო)"),
  description: z.string().trim().optional(),
  logoUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\//.test(v), "ლოგოს ლინკი უნდა იწყებოდეს http(s)://-ით"),
  isActive: z.boolean(),
  sortOrder: z
    .string()
    .trim()
    .refine((v) => v === "" || (!isNaN(Number(v)) && Number.isInteger(Number(v))), "sortOrder უნდა იყოს მთელი რიცხვი"),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
