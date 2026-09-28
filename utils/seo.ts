import { BASEPATH, CDN_URL, DEFAULT_LOCALE } from "@/constants";

// სოციალური ქსელების/Google-ის ნაგულისხმევი გაზიარების სურათი (public/images)
export const DEFAULT_OG_IMAGE = `${BASEPATH}/images/og-share.jpg`;
export const SITE_LOGO = `${BASEPATH}/icons/icon-512.png`;

// გვერდები, რომელთა შინაარსიც მხოლოდ ქართულადაა (ტექსტი hardcoded) — მათზე
// hreflang-ის ალტერნატივები Google-ს შეცდომაში შეიყვანდა (en/ru "ვერსია"
// სინამდვილეში იგივე ქართული ტექსტია), ამიტომ canonical ყოველთვის /ka-ზე მიდის.
export const KA_ONLY_PATHS = ["/terms", "/privacy-policy"];

export const resolveLocale = (locale?: string) => (locale && locale !== "default" ? locale : DEFAULT_LOCALE);

/**
 * canonical/hreflang-ისთვის asPath-ის გასუფთავება: query string-ი (ფილტრები,
 * დალაგება, ძებნა, utm_*) და hash-ი იშლება, რომ ერთსა და იმავე გვერდს ათობით
 * "კანონიკური" ვერსია არ ჰქონდეს. ერთადერთი გამონაკლისი `?page=N` (N>1) —
 * პაგინაციის გვერდები განსხვავებულ პროდუქტებს შეიცავს და ცალკე ინდექსირდება.
 */
export const getCanonicalPath = (asPath: string) => {
  const [pathWithQuery] = asPath.split("#");
  const [rawPath, query = ""] = pathWithQuery.split("?");
  const path = rawPath === "/" ? "" : rawPath.replace(/\/+$/, "");
  const page = parseInt(new URLSearchParams(query).get("page") || "", 10);
  return !isNaN(page) && page > 1 ? `${path}?page=${page}` : path;
};

export const absoluteUrl = (locale: string, path: string) => `${BASEPATH}/${locale}${path}`;

export const absoluteImage = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${CDN_URL || BASEPATH}${url}`) : undefined;

export const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

// HTML-იდან (პროდუქტის აღწერა rich-text-ია) უბრალო ტექსტი meta description-ისთვის
export const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// ქართული (მხედრული) და რუსული ასოების ლათინური ტრანსლიტერაცია URL slug-ისთვის
const TRANSLIT: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m",
  ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "f", ქ: "k", ღ: "gh", ყ: "q",
  შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");

type SluggableProduct = { id: number; translations?: unknown };

// slug ყველა ლოკალზე ერთნაირია (en სახელი, თუ არ არის — ka-ს ტრანსლიტერაცია),
// რომ hreflang-ის ალტერნატივები ერთსა და იმავე path-ზე მიუთითებდეს.
export const getProductSlug = (product: SluggableProduct) => {
  const t = (product.translations || {}) as Record<string, { name?: string } | undefined>;
  const name = t.en?.name || t.ka?.name || t.ru?.name || "";
  return slugify(name);
};

/** `/products/123-product-name` — პროდუქტის კანონიკური path (ლოკალის პრეფიქსის გარეშე). */
export const productPath = (product: SluggableProduct) => {
  const slug = getProductSlug(product);
  return `/products/${product.id}${slug ? `-${slug}` : ""}`;
};

/** `[id]` route param-იდან (`123` ან `123-some-slug`) რიცხვითი id-ის ამოღება. */
export const parseProductParam = (param?: string) => {
  const match = /^(\d+)(?:-[a-z0-9-]*)?$/.exec(param || "");
  return match ? Number(match[1]) : null;
};
