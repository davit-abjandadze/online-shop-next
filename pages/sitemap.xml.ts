import { GetServerSideProps } from "next";
import { ProductsAPI } from "@/API_Client";
import { PaginatedResponseDto, Product } from "@/API_Client/types";
import { BASEPATH, DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants";

const LOCALES = SUPPORTED_LOCALES;
const STATIC_PATHS = [{ path: "", changefreq: "daily", priority: "1.0" }];

const escapeXml = (value: string) => value.replace(/&/g, "&amp;");

// თითო path-ისთვის 3 ცალკე <url> ბლოკი გენერირდება (თითო locale-ზე თავისი <loc>),
// ორივესთვის იგივე სრული hreflang alternate-ების კლასტერი (ka/en/ru + x-default)
const buildUrlEntries = (
  path: string,
  options?: { lastmod?: string; changefreq?: string; priority?: string }
) => {
  const alternates = [
    ...LOCALES.map(
      (locale) =>
        `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${BASEPATH}/${locale}${path}`)}" />`
    ),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${BASEPATH}/${DEFAULT_LOCALE}${path}`)}" />`,
  ].join("");

  const lastmod = options?.lastmod ? `<lastmod>${escapeXml(options.lastmod)}</lastmod>` : "";
  const changefreq = options?.changefreq ? `<changefreq>${options.changefreq}</changefreq>` : "";
  const priority = options?.priority ? `<priority>${options.priority}</priority>` : "";

  return LOCALES.map(
    (locale) =>
      `<url><loc>${escapeXml(`${BASEPATH}/${locale}${path}`)}</loc>${alternates}${lastmod}${changefreq}${priority}</url>`
  );
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls: string[] = STATIC_PATHS.flatMap((s) =>
    buildUrlEntries(s.path, { changefreq: s.changefreq, priority: s.priority })
  );

  try {
    const limit = 100;
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const result = await ProductsAPI(DEFAULT_LOCALE, "").productsControllerFindAll(page, limit);
      const data = result.data as unknown as PaginatedResponseDto<Product>;
      const list = Array.isArray(data?.data) ? data.data : [];

      list
        .filter((p) => p.isActive)
        .forEach((p) =>
          urls.push(
            ...buildUrlEntries(`/products/${p.id}`, {
              lastmod: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
              changefreq: "hourly",
              priority: "0.8",
            })
          )
        );

      hasNext = !!data?.meta?.hasNext;
      page += 1;
    }
  } catch (err) {
    console.error("sitemap.xml: could not fetch products", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
