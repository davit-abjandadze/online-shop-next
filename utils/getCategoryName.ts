/**
 * კატეგორიის სახელს ირჩევს მიმდინარე ლოკალის მიხედვით. ბექენდს `nameRu` არ
 * აქვს, ამიტომ `ru` ლოკალზეც ქართული სახელი ვარდება fallback-ად (default —
 * `ka`, პროექტის ზოგადი კონვენციის მიხედვით).
 */
export const getCategoryName = (
  category: { nameKa: string; nameEn: string },
  locale?: string
): string => {
  if (locale === "en") return category.nameEn || category.nameKa;
  return category.nameKa || category.nameEn;
};
