import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import AddressesComponent from "@/components/pages/profile/Addresses";

export default function AddressesPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`მისამართები - ${t("default-page-title")}`}</title>
        <meta name="description" content="მომხმარებლის შენახული მისამართები" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AddressesComponent />
    </>
  );
}
