import { z } from "zod";

/**
 * "male" | "female" ემთხვევა API_Client-ის ორივე `UserGenderEnum`-ს და
 * `RegisterDtoGenderEnum`-ს რანთაიმ მნიშვნელობით — მაგრამ ისინი TypeScript-ში
 * ცალკე ნომინალური ტიპებია, ამიტომ სქემები plain string literal union-ს იყენებენ
 * და API-ზე გამოძახებისას caller აკეთებს `as UserGenderEnum`/`as RegisterDtoGenderEnum` cast-ს.
 */
export const GENDER_VALUES = ["male", "female"] as const;
export type Gender = (typeof GENDER_VALUES)[number];

/**
 * საერთო ვალიდაციის კონსტანტები და zod სქემები, რომლებსაც იზიარებს საიტის ყველა ფორმა
 * (ავტორიზაცია/რეგისტრაცია, პაროლის აღდგენა/შეცვლა, პროფილის ფორმები).
 * ყველა ფორმა react-hook-form + zod-ს იყენებს ერთი კონსისტენტური მიდგომისთვის.
 */

export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MIN_LENGTH = 2;
export const AGE_MIN = 14;
export const AGE_MAX = 120;

/** ერთი წყარო email-ის ვალიდაციისთვის — required + ფორმატის შემოწმება. */
export const emailField = () =>
  z
    .string()
    .trim()
    .min(1, "გთხოვთ შეავსოთ ელფოსტა")
    .email("გთხოვთ მიუთითოთ ვალიდური ელფოსტა");

/** ერთი წყარო პაროლის ვალიდაციისთვის — required + მინიმალური სიგრძე. */
export const passwordField = (message = `პაროლი უნდა შეიცავდეს მინიმუმ ${PASSWORD_MIN_LENGTH} სიმბოლოს`) =>
  z.string().min(PASSWORD_MIN_LENGTH, message);

/** სახელი/გვარი — required + მინიმალური სიგრძე. */
export const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `გთხოვთ შეავსოთ ${label}`)
    .min(NAME_MIN_LENGTH, `${label} უნდა შეიცავდეს მინიმუმ ${NAME_MIN_LENGTH} სიმბოლოს`);

/** ასაკის ველი მოდელირებულია string-ად (input-ის value), მაგრამ ვამოწმებთ, რომ ის 14-120 დიაპაზონის მთელი რიცხვია. */
export const ageField = () =>
  z
    .string()
    .trim()
    .min(1, "გთხოვთ მიუთითოთ ასაკი")
    .refine((val) => Number.isInteger(Number(val)), {
      message: "ასაკი უნდა იყოს მთელი რიცხვი",
    })
    .refine((val) => Number(val) >= AGE_MIN && Number(val) <= AGE_MAX, {
      message: `ასაკი უნდა იყოს ${AGE_MIN}-დან ${AGE_MAX}-მდე`,
    });

/** ასაკის არასავალდებულო ველი (მაგ. პროფილის ფორმაზე, სადაც ცარიელი მნიშვნელობაც დასაშვებია). */
export const optionalAgeField = () =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || Number.isInteger(Number(val)), {
      message: "ასაკი უნდა იყოს მთელი რიცხვი",
    })
    .refine((val) => val === "" || (Number(val) >= AGE_MIN && Number(val) <= AGE_MAX), {
      message: `ასაკი უნდა იყოს ${AGE_MIN}-დან ${AGE_MAX}-მდე`,
    })
    .optional();

export const genderField = () =>
  z.enum(GENDER_VALUES, {
    errorMap: () => ({ message: "გთხოვთ მიუთითოთ სქესი" }),
  });

export const optionalGenderField = () =>
  z.union([z.enum(GENDER_VALUES), z.literal("")]).optional();

/** ორი პაროლის ველის დამთხვევის შემოწმება — გამოსაყენებელი .superRefine-ში. */
export const assertPasswordsMatch = <T extends { newPassword?: string; password?: string; confirmPassword: string }>(
  data: T,
  ctx: z.RefinementCtx,
  passwordKey: "password" | "newPassword" = "password"
) => {
  const password = passwordKey === "password" ? data.password : data.newPassword;
  if (data.confirmPassword !== password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "პაროლები არ ემთხვევა ერთმანეთს",
      path: ["confirmPassword"],
    });
  }
};

/* ---------------------------------------------------------------------- */
/* Login / Register (AuthModal)                                          */
/* ---------------------------------------------------------------------- */

export const loginSchema = z.object({
  email: emailField(),
  password: z.string().min(1, "გთხოვთ შეავსოთ პაროლი"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: nameField("სახელი"),
    lastName: nameField("გვარი"),
    email: emailField(),
    age: ageField(),
    gender: genderField(),
    password: passwordField(),
    confirmPassword: z.string().min(1, "გთხოვთ გაიმეოროთ პაროლი"),
  })
  .superRefine((data, ctx) => assertPasswordsMatch(data, ctx, "password"));
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField(),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/* ---------------------------------------------------------------------- */
/* Reset password / change password                                      */
/* ---------------------------------------------------------------------- */

export const resetPasswordSchema = z
  .object({
    newPassword: passwordField(),
    confirmPassword: z.string().min(1, "გთხოვთ გაიმეოროთ პაროლი"),
  })
  .superRefine((data, ctx) => assertPasswordsMatch(data, ctx, "newPassword"));
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "გთხოვთ შეავსოთ მიმდინარე პაროლი"),
    newPassword: passwordField(),
    confirmPassword: z.string().min(1, "გთხოვთ გაიმეოროთ ახალი პაროლი"),
  })
  .superRefine((data, ctx) => assertPasswordsMatch(data, ctx, "newPassword"))
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "ახალი პაროლი არ უნდა ემთხვეოდეს მიმდინარე პაროლს",
    path: ["newPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/* ---------------------------------------------------------------------- */
/* Profile forms                                                          */
/* ---------------------------------------------------------------------- */

export const completeProfileSchema = z.object({
  age: ageField(),
  gender: genderField(),
});
export type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;

export const profileEditSchema = z.object({
  firstName: nameField("სახელი"),
  lastName: nameField("გვარი"),
  age: ageField(),
  gender: genderField(),
});
export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
