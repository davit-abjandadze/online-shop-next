/**
 * ბექენდის `translations` ობიექტიდან (`{ ka: {...}, en?: {...}, ru?: {...} }`)
 * ლოკალიზებულ ველს ირჩევს მიმდინარე ლოკალის მიხედვით — `ka`-ზე fallback-ით
 * (ka ყოველთვის სავალდებულოა ბექენდის create/update DTO-ებში). `translations`
 * ტიპი გენერირებულ Category/Product მოდელებში ბუნდოვნად (`object`) ჩნდება,
 * ამიტომ აქ `unknown`-ად ვიღებთ და შიგნით ვკითხულობთ.
 */
type TranslationEntry = { name?: string; value?: string; description?: string };
type RawTranslations = Partial<Record<"ka" | "en" | "ru", TranslationEntry | undefined>>;

const SUPPORTED_LOCALES = ["ka", "en", "ru"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const isSupportedLocale = (locale?: string): locale is SupportedLocale =>
  !!locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale);

const resolveField = (
  translations: unknown,
  field: keyof TranslationEntry,
  locale?: string
): string => {
  const t = (translations || {}) as RawTranslations;
  const loc: SupportedLocale = isSupportedLocale(locale) ? locale : "ka";
  return t[loc]?.[field] || t.ka?.[field] || t.en?.[field] || t.ru?.[field] || "";
};

/**
 * კატეგორია/მახასიათებელი/ფერი/პროდუქტის `translations`-იდან ლოკალიზებულ
 * `name`-ს ირჩევს. Admin dashboard-ის კონტექსტში ყოველთვის `"ka"` ლოკალით
 * უნდა გამოვიძახოთ (dashboard ქართულად რჩება), customer-facing გვერდებზე
 * კი `router.locale`-ით.
 */
export const getCategoryName = (entity: { translations?: unknown }, locale?: string): string =>
  resolveField(entity.translations, "name", locale);

/** AttributeOption-ისთვის იგივე ლოგიკა, `value` ველზე (`name`-ის ნაცვლად). */
export const getLocalizedValue = (entity: { translations?: unknown }, locale?: string): string =>
  resolveField(entity.translations, "value", locale);

/** Product-ისთვის იგივე ლოგიკა, `description` ველზე. */
export const getLocalizedDescription = (entity: { translations?: unknown }, locale?: string): string =>
  resolveField(entity.translations, "description", locale);
