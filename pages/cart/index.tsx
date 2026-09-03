import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import CartComponent from "@/components/pages/cart";

const CartPage = () => {
  const { t } = useTranslation("cart");
  const { t: tc } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{`${t("page-title")} - ${tc("default-page-title")}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CartComponent />
    </>
  );
};

export default CartPage;
