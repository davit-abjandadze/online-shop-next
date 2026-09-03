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
 *
 * ვალიდაციის შეტყობინებები common.json-ის თარგმანებია (`validation-*` გასაღებები, რომლებიც
 * ხელმისაწვდომია ყველა გვერდზე, რადგან `common` i18n.json-ში "*" namespace-შია), ამიტომ ყველა
 * ველის builder-ი და სქემა `t`-ს (useTranslation-ის `t` ფუნქცია) იღებს პარამეტრად — იგივე
 * პატერნი, რასაც იყენებს checkout/schemas.ts.
 */

export type TFunction = (key: string, query?: Record<string, unknown>) => string;

export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MIN_LENGTH = 2;
export const AGE_MIN = 14;
export const AGE_MAX = 120;

/** ერთი წყარო email-ის ვალიდაციისთვის — required + ფორმატის შემოწმება. */
export const emailField = (t: TFunction) =>
  z
    .string()
    .trim()
    .min(1, t("validation-email-required"))
    .email(t("validation-email-invalid"));

/** ერთი წყარო პაროლის ვალიდაციისთვის — required + მინიმალური სიგრძე. */
export const passwordField = (t: TFunction, message = t("validation-password-min", { min: PASSWORD_MIN_LENGTH })) =>
  z.string().min(PASSWORD_MIN_LENGTH, message);

/** სახელი/გვარი — required + მინიმალური სიგრძე. */
export const nameField = (t: TFunction, label: string) =>
  z
    .string()
    .trim()
    .min(1, t("validation-name-required", { label }))
    .min(NAME_MIN_LENGTH, t("validation-name-min", { label, min: NAME_MIN_LENGTH }));

/** ასაკის ველი მოდელირებულია string-ად (input-ის value), მაგრამ ვამოწმებთ, რომ ის 14-120 დიაპაზონის მთელი რიცხვია. */
export const ageField = (t: TFunction) =>
  z
    .string()
    .trim()
    .min(1, t("validation-age-required"))
    .refine((val) => Number.isInteger(Number(val)), {
      message: t("validation-age-integer"),
    })
    .refine((val) => Number(val) >= AGE_MIN && Number(val) <= AGE_MAX, {
      message: t("validation-age-range", { min: AGE_MIN, max: AGE_MAX }),
    });

/** ასაკის არასავალდებულო ველი (მაგ. პროფილის ფორმაზე, სადაც ცარიელი მნიშვნელობაც დასაშვებია). */
export const optionalAgeField = (t: TFunction) =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || Number.isInteger(Number(val)), {
      message: t("validation-age-integer"),
    })
    .refine((val) => val === "" || (Number(val) >= AGE_MIN && Number(val) <= AGE_MAX), {
      message: t("validation-age-range", { min: AGE_MIN, max: AGE_MAX }),
    })
    .optional();

/** მობილურის ნომერი — required, ქართული ფორმატის 9-ციფრიანი ნომერი (ქვეყნის კოდის გარეშე). */
export const phoneNumberField = (t: TFunction) =>
  z
    .string()
    .trim()
    .min(1, t("validation-phone-required"))
    .regex(/^\d{9}$/, t("validation-phone-invalid"));

/** მობილურის ნომრის არასავალდებულო ველი (მაგ. პროფილის ფორმაზე, სადაც ცარიელი მნიშვნელობაც დასაშვებია). */
export const optionalPhoneNumberField = (t: TFunction) =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || /^\d{9}$/.test(val), {
      message: t("validation-phone-invalid"),
    })
    .optional();

/** პირადი ნომერი — required, ზუსტად 11 ციფრი. */
export const personalNumberField = (t: TFunction) =>
  z
    .string()
    .trim()
    .min(1, t("validation-personal-number-required"))
    .regex(/^\d{11}$/, t("validation-personal-number-invalid"));

/** პირადი ნომრის არასავალდებულო ველი (მაგ. რეგისტრაცია/პროფილი, სადაც ცარიელი მნიშვნელობაც დასაშვებია). */
export const optionalPersonalNumberField = (t: TFunction) =>
  z
    .string()
    .trim()
    .refine((val) => val === "" || /^\d{11}$/.test(val), {
      message: t("validation-personal-number-invalid"),
    })
    .optional();

export const genderField = (t: TFunction) =>
  z.enum(GENDER_VALUES, {
    errorMap: () => ({ message: t("validation-gender-required") }),
  });

export const optionalGenderField = () =>
  z.union([z.enum(GENDER_VALUES), z.literal("")]).optional();

/** ორი პაროლის ველის დამთხვევის შემოწმება — გამოსაყენებელი .superRefine-ში. */
export const assertPasswordsMatch = <T extends { newPassword?: string; password?: string; confirmPassword: string }>(
  t: TFunction,
  data: T,
  ctx: z.RefinementCtx,
  passwordKey: "password" | "newPassword" = "password"
) => {
  const password = passwordKey === "password" ? data.password : data.newPassword;
  if (data.confirmPassword !== password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation-passwords-mismatch"),
      path: ["confirmPassword"],
    });
  }
};

/* ---------------------------------------------------------------------- */
/* Login / Register (AuthModal)                                          */
/* ---------------------------------------------------------------------- */

export const loginSchema = (t: TFunction) =>
  z.object({
    email: emailField(t),
    password: z.string().min(1, t("validation-password-required")),
  });
export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;

export const registerSchema = (t: TFunction) =>
  z
    .object({
      firstName: nameField(t, t("validation-field-first-name")),
      lastName: nameField(t, t("validation-field-last-name")),
      email: emailField(t),
      phoneNumber: phoneNumberField(t),
      password: passwordField(t),
      confirmPassword: z.string().min(1, t("validation-password-confirm-required")),
    })
    .superRefine((data, ctx) => assertPasswordsMatch(t, data, ctx, "password"));
export type RegisterFormValues = z.infer<ReturnType<typeof registerSchema>>;

export const forgotPasswordSchema = (t: TFunction) =>
  z.object({
    email: emailField(t),
  });
export type ForgotPasswordFormValues = z.infer<ReturnType<typeof forgotPasswordSchema>>;

/* ---------------------------------------------------------------------- */
/* Reset password / change password                                      */
/* ---------------------------------------------------------------------- */

export const resetPasswordSchema = (t: TFunction) =>
  z
    .object({
      newPassword: passwordField(t),
      confirmPassword: z.string().min(1, t("validation-password-confirm-required")),
    })
    .superRefine((data, ctx) => assertPasswordsMatch(t, data, ctx, "newPassword"));
export type ResetPasswordFormValues = z.infer<ReturnType<typeof resetPasswordSchema>>;

export const changePasswordSchema = (t: TFunction) =>
  z
    .object({
      oldPassword: z.string().min(1, t("validation-old-password-required")),
      newPassword: passwordField(t),
      confirmPassword: z.string().min(1, t("validation-new-password-confirm-required")),
    })
    .superRefine((data, ctx) => assertPasswordsMatch(t, data, ctx, "newPassword"))
    .refine((data) => data.newPassword !== data.oldPassword, {
      message: t("validation-new-password-same-as-old"),
      path: ["newPassword"],
    });
export type ChangePasswordFormValues = z.infer<ReturnType<typeof changePasswordSchema>>;

/* ---------------------------------------------------------------------- */
/* Profile forms                                                          */
/* ---------------------------------------------------------------------- */

export const completeProfileSchema = (t: TFunction) =>
  z.object({
    age: ageField(t),
    gender: genderField(t),
  });
export type CompleteProfileFormValues = z.infer<ReturnType<typeof completeProfileSchema>>;

export const profileEditSchema = (t: TFunction) =>
  z.object({
    firstName: nameField(t, t("validation-field-first-name")),
    lastName: nameField(t, t("validation-field-last-name")),
    email: emailField(t),
    // ასაკი/სქესი, ისევე როგორც მობილური/პირადი ნომერი, პროფილის რედაქტირებისას
    // არასავალდებულოა — მაგ. Google/Facebook რეგისტრაციის მომხმარებელს შეიძლება
    // საერთოდ არ ჰქონდეს შევსებული და მაინც უნდა შეეძლოს დანარჩენი ველების შენახვა.
    age: optionalAgeField(t),
    gender: optionalGenderField(),
    phoneNumber: optionalPhoneNumberField(t),
    personalNumber: optionalPersonalNumberField(t),
  });
export type ProfileEditFormValues = z.infer<ReturnType<typeof profileEditSchema>>;
