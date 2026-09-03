import Head from "next/head";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { BallotIcon } from "@/components/ui/RefIcons";

export default function NotFound() {
  const { t } = useTranslation("common");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ref-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <Head>
        <title>{`${t("not-found-page-title")} - ${t("default-page-title")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <BallotIcon size={56} />
      <h1 style={{ fontSize: "56px", fontWeight: 800, color: "var(--ref-text-primary)", margin: 0, lineHeight: 1 }}>
        404
      </h1>
      <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)", margin: 0 }}>
        {t("not-found-message")}
      </p>
      <Link
        href="/"
        style={{
          marginTop: "8px",
          padding: "10px 22px",
          background: "var(--ref-primary)",
          color: "var(--ref-text-on-primary)",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "14px",
          textDecoration: "none",
        }}
      >
        {t("not-found-back-home")}
      </Link>
    </div>
  );
}
