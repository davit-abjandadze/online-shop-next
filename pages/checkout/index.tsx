import Head from "next/head";
import CheckoutComponent from "@/components/pages/checkout";

const CheckoutPage = () => {
  return (
    <>
      <Head>
        <title>შეკვეთის გაფორმება - მაღაზია</title>
        <meta name="robots" content="noindex" />
      </Head>
      <CheckoutComponent />
    </>
  );
};

export default CheckoutPage;
