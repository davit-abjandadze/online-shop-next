import { GetServerSideProps } from "next";
import { CategoriesAPI, ProductsAPI } from "@/API_Client";
import { Category, PaginatedResponseDto, Product } from "@/API_Client/types";
import { BASEPATH, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants";
import { KA_ONLY_PATHS, productPath } from "@/utils/seo";

const LOCALES = SUPPORTED_LOCALES;
const PAGE_LIMIT = 100;

type EntryOptions = { lastmod?: string; changefreq?: string; priority?: string };

const STATIC_PATHS: ({ path: string } & EntryOptions)[] = [
  { path: "", changefreq: "daily", priority: "1.0" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/branches", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.2" },
];

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const toIsoDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date.toISOString();
};

// თითო path-ისთვის 3 ცალკე <url> ბლოკი გენერირდება (თითო locale-ზე თავისი <loc>),
// სამივესთვის იგივე სრული hreflang alternate-ების კლასტერი (ka/en/ru + x-default).
// მხოლოდ ქართულენოვანი გვერდები (KA_ONLY_PATHS) ერთადერთი /ka <url>-ით შედის.
const buildUrlEntries = (path: string, options?: EntryOptions) => {
  const lastmod = options?.lastmod ? `<lastmod>${escapeXml(options.lastmod)}</lastmod>` : "";
  const changefreq = options?.changefreq ? `<changefreq>${options.changefreq}</changefreq>` : "";
  const priority = options?.priority ? `<priority>${options.priority}</priority>` : "";

  if (KA_ONLY_PATHS.includes(path)) {
    return [`<url><loc>${escapeXml(`${BASEPATH}/${DEFAULT_LOCALE}${path}`)}</loc>${lastmod}${changefreq}${priority}</url>`];
  }

  const alternates = [
    ...LOCALES.map(
      (locale) =>
        `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${BASEPATH}/${locale}${path}`)}" />`
    ),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${BASEPATH}/${DEFAULT_LOCALE}${path}`)}" />`,
  ].join("");

  return LOCALES.map(
    (locale) =>
      `<url><loc>${escapeXml(`${BASEPATH}/${locale}${path}`)}</loc>${alternates}${lastmod}${changefreq}${priority}</url>`
  );
};

// გვერდიანი endpoint-ის ყველა გვერდის თანმიმდევრული წამოღება
const fetchAll = async <T,>(fetchPage: (page: number) => Promise<{ data: unknown }>): Promise<T[]> => {
  const items: T[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const result = await fetchPage(page);
    const data = result.data as PaginatedResponseDto<T>;
    items.push(...(Array.isArray(data?.data) ? data.data : []));
    hasNext = !!data?.meta?.hasNext;
    page += 1;
  }
  return items;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls: string[] = STATIC_PATHS.flatMap(({ path, ...options }) => buildUrlEntries(path, options));

  const [categoriesResult, productsResult] = await Promise.allSettled([
    fetchAll<Category>((page) => CategoriesAPI(DEFAULT_LOCALE, "").categoryControllerFindAll(page, PAGE_LIMIT)),
    fetchAll<Product>((page) => ProductsAPI(DEFAULT_LOCALE, "").productsControllerFindAll(page, PAGE_LIMIT)),
  ]);

  if (categoriesResult.status === "fulfilled") {
    categoriesResult.value
      .filter((c) => c.isActive && c.slug)
      .forEach((c) =>
        urls.push(
          ...buildUrlEntries(`/categories/${c.slug}`, {
            lastmod: toIsoDate(c.updatedAt),
            changefreq: "daily",
            priority: c.parent ? "0.7" : "0.8",
          })
        )
      );
  } else {
    console.error("sitemap.xml: could not fetch categories", categoriesResult.reason);
  }

  if (productsResult.status === "fulfilled") {
    productsResult.value
      .filter((p) => p.isActive)
      .forEach((p) =>
        urls.push(
          ...buildUrlEntries(productPath(p), {
            lastmod: toIsoDate(p.updatedAt || p.createdAt),
            changefreq: "weekly",
            priority: "0.7",
          })
        )
      );
  } else {
    console.error("sitemap.xml: could not fetch products", productsResult.reason);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // ყოველ crawler-ის მოთხოვნაზე ბექენდის სრული გადავლა ზედმეტია
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
