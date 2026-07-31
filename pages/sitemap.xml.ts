import { GetServerSideProps } from "next";
import { QuestionAPI } from "@/API_Client";
import { BASEPATH } from "@/constants";

const LOCALES = ["ka", "en", "ru"];
const STATIC_PATHS = [""];

const escapeXml = (value: string) => value.replace(/&/g, "&amp;");

const buildUrlEntry = (path: string) => {
  const alternates = LOCALES.map(
    (locale) =>
      `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(`${BASEPATH}/${locale}${path}`)}" />`
  ).join("");

  return `<url><loc>${escapeXml(`${BASEPATH}/ka${path}`)}</loc>${alternates}</url>`;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const urls: string[] = STATIC_PATHS.map(buildUrlEntry);

  try {
    const limit = 100;
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const result = await QuestionAPI("ka", "").questionControllerFindAll(page, limit);
      const data = result.data as any;
      const list = Array.isArray(data?.data) ? data.data : [];

      list
        .filter((q: any) => q.isActive)
        .forEach((q: any) => urls.push(buildUrlEntry(`/questions/${q.id}`)));

      hasNext = !!data?.meta?.hasNext;
      page += 1;
    }
  } catch (err) {
    console.error("sitemap.xml: could not fetch questions", err);
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
