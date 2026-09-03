import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import CheckoutComponent from "@/components/pages/checkout";

const CheckoutPage = () => {
  const { t } = useTranslation("checkout");
  const { t: tc } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("page-title")} - ${tc("default-page-title")}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CheckoutComponent />
    </>
  );
};

export default CheckoutPage;
