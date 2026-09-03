import { z } from "zod";

/**
 * მისამართის დამატება/რედაქტირების ფორმის ვალიდაციის სქემა (checkout-ის შენახული მისამართები).
 * ვალიდაციის შეტყობინებები checkout.json-ის თარგმანებია, ამიტომ სქემა `t`-ს (useTranslation("checkout"))
 * იღებს პარამეტრად და გამომძახებელს (`addressFormSchema(t)`) მისი შექმნა ევალება.
 */
export const addressFormSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().trim().min(2, t("address-validation-title")),
    phoneNumber: z.string().trim().min(4, t("address-validation-phone")),
    city: z.string().trim().min(1, t("address-validation-city")),
    address: z.string().trim().min(5, t("address-validation-address")),
    comment: z.string().trim().optional(),
  });

export type AddressFormValues = z.infer<ReturnType<typeof addressFormSchema>>;
