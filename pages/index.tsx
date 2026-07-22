import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/shared/Header";

export default function Home() {
  const { t } = useTranslation("common");
  const { data: session } = useSession();

  useEffect(() => {
    console.log(session);
  }, [session]);
  return (
    <>
      <Head>
        <title>{t("default-page-title")}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main>{/* TODO: Build your home page */}</main>
    </>
  );
}
