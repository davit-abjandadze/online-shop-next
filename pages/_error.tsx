import { NextPageContext } from "next";
import Head from "next/head";

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1>{statusCode}</h1>
      <p>
        {statusCode === 404
          ? "Page not found"
          : "An error occurred on the server"}
      </p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, isError: true };
};

export default ErrorPage;
