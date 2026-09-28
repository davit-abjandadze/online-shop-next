import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import AddressesComponent from "@/components/pages/profile/Addresses";

export default function AddressesPage() {
  const { t } = useTranslation("common");
  const { t: tProfile } = useTranslation("profile");

  return (
    <>
      <Head>
        <title>{`${tProfile("addresses-page-title")} - ${t("default-page-title")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AddressesComponent />
    </>
  );
}
