import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/types";

// მხოლოდ getServerSideProps-იდან გამოსაძახებლად. კატეგორიების ხე იშვიათად
// იცვლება, ყოველი SSR მოთხოვნა კი მას Header-ისთვის საჭიროებს — ამიტომ
// პროცესის მეხსიერებაში ლოკალის მიხედვით მოკლე ვადით ვინახავთ, რომ ბექენდზე
// (და მის per-IP throttle-ზე) ზედმეტი დატვირთვა არ შეიქმნას.
const TTL_MS = 60 * 1000;
const cache = new Map<string, { at: number; tree: Category[] }>();

export const getCategoryTree = async (locale: string): Promise<Category[]> => {
  const cached = cache.get(locale);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.tree;

  try {
    const res = await CategoriesAPI(locale, "").categoryControllerFindTree();
    const data = res.data as unknown as Category[];
    const tree = Array.isArray(data) ? data : [];
    cache.set(locale, { at: Date.now(), tree });
    return tree;
  } catch (err) {
    console.error("Could not fetch category tree:", err);
    // ბექენდის დროებითი შეცდომისას ძველი (ვადაგასული) ხე ჯობია ცარიელ მენიუს
    return cached?.tree ?? [];
  }
};
