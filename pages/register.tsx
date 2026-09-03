import { useState } from "react";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import Header from "@/components/shared/Header";
import AuthModal from "@/components/shared/AuthModal";

export default function RegisterPage() {
  const { t } = useTranslation("common");
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F8FA" }}>
      <Head>
        <title>{`${t("register-page-title")} - ${t("default-page-title")}`}</title>
        <meta name="description" content={t("register-page-description") as string} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header onOpenAuth={() => setModalOpen(true)} />
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
}
