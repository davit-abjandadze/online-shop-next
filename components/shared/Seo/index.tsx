import Head from "next/head";
import { DEFAULT_OG_IMAGE, truncate } from "@/utils/seo";

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "product";
  noindex?: boolean;
  // noindex გვერდზე ბმულებს მაინც მივყვებით (მაგ. ძიების შედეგები → პროდუქტები)
  follow?: boolean;
  jsonLd?: Record<string, unknown>[];
}

/**
 * გვერდის title/description/og/twitter ტეგები ერთ ადგილას. key-ები _app.tsx-ის
 * ნაგულისხმევი ტეგების იგივეა — next/head მათ key-ით ანაცვლებს (property=-იანი
 * meta key-ის გარეშე არ დედუპლიცირდება და ორივე ნაკრები ჩანდა).
 */
const Seo = ({ title, description, image, type, noindex, follow = true, jsonLd }: SeoProps) => {
  const desc = description ? truncate(description, 160) : undefined;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Head>
      <title>{title}</title>
      <meta property="og:title" content={title} key="title" />
      <meta name="twitter:title" content={title} key="twitterTitle" />
      {desc && <meta name="description" content={desc} />}
      {desc && <meta property="og:description" content={desc} key="description" />}
      {desc && <meta name="twitter:description" content={desc} key="twitterDescription" />}
      <meta property="og:image" content={ogImage} key="ogImage" />
      <meta name="twitter:image" content={ogImage} key="twitterImage" />
      {type && <meta property="og:type" content={type} key="ogType" />}
      {noindex && <meta name="robots" content={follow ? "noindex, follow" : "noindex, nofollow"} />}
      {jsonLd?.map((data, idx) => (
        <script
          key={`jsonld-page-${idx}`}
          type="application/ld+json"
          // "<" escape — JSON-LD-ში მომხმარებლის/ადმინის ტექსტი </script>-ით ვერ გაარღვევს ტეგს
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
      ))}
    </Head>
  );
};

export default Seo;
