import Script from "next/script";
import { useCookieConsent } from "@/context/CookieConsent";

// ID-ები .env-იდან (იხ. .env.example) — ცარიელისას შესაბამისი სკრიპტი საერთოდ
// არ იტვირთება, ამიტომ dev/test გარემოში ანალიტიკა ავტომატურად გამორთულია.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// ID-ში მხოლოდ ლათინური ასოები/ციფრები/ტირე — inline სკრიპტში ჩასმამდე
const isSafeId = (id?: string): id is string => !!id && /^[A-Za-z0-9-]+$/.test(id);

/**
 * Google Analytics 4 / Google Tag Manager — afterInteractive, რომ გვერდის
 * ჩატვირთვას (LCP) არ შეაფერხოს. GA4-ის Enhanced Measurement client-side
 * ნავიგაციის (history change) page_view-ებს თავად აფიქსირებს. სკრიპტები მხოლოდ
 * cookie-ების მოდალში ანალიტიკაზე თანხმობის შემდეგ იტვირთება (components/shared/CookieConsent).
 */
const Analytics = () => {
  const { consent } = useCookieConsent();
  if (!consent?.analytics) return null;

  return (
  <>
    {isSafeId(GA_ID) && (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </>
    )}
    {isSafeId(GTM_ID) && (
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    )}
  </>
  );
};

export default Analytics;
