import Head from "next/head";
import Link from "next/link";
import { BallotIcon } from "@/components/ui/RefIcons";

export default function NotFound() {
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
        <title>გვერდი ვერ მოიძებნა - საზოგადოებრივი აზრის პლატფორმა</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <BallotIcon size={56} />
      <h1 style={{ fontSize: "56px", fontWeight: 800, color: "var(--ref-text-primary)", margin: 0, lineHeight: 1 }}>
        404
      </h1>
      <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)", margin: 0 }}>
        გვერდი ვერ მოიძებნა
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
        მთავარ გვერდზე დაბრუნება
      </Link>
    </div>
  );
}
