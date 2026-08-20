import Head from "next/head";
import CartComponent from "@/components/pages/cart";

const CartPage = () => {
  return (
    <>
      <Head>
        <title>კალათა - მაღაზია</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CartComponent />
    </>
  );
};

export default CartPage;
