import { GetServerSideProps } from "next";
import { BASEPATH, SUPPORTED_LOCALES } from "@/constants";

const PRIVATE_PATHS = [
  "/dashboard",
  "/user/",
  "/login",
  "/register",
  "/reset-password",
];

// API route-ები არასდროს არიან locale-პრეფიქსული (იხ. next.config.js redirects()) — ამიტომ
// "/api/"-ს ცალკე, ჰოლი სახით ვტოვებთ, დანარჩენებს კი locale-ის მიხედვით ვამრავლებთ
const PRIVATE_PATHS_LOCALE_AWARE = SUPPORTED_LOCALES.flatMap((locale) =>
  PRIVATE_PATHS.map((path) => `/${locale}${path}`)
);

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    ...PRIVATE_PATHS_LOCALE_AWARE.map((path) => `Disallow: ${path}`),
    "Disallow: /api/",
    "",
    `Sitemap: ${BASEPATH}/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
