import { GetServerSideProps } from "next";
import { BASEPATH } from "@/constants";

const PRIVATE_PATHS = [
  "/dashboard",
  "/user/",
  "/login",
  "/register",
  "/reset-password",
  "/api/",
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
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
