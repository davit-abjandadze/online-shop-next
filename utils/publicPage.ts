import { ServerResponse } from "http";
import { getCategoryTree } from "@/utils/getCategoryTree";
import { resolveLocale } from "@/utils/seo";

// საჯარო (მომხმარებელზე არადამოკიდებული) SSR გვერდები — CDN/nginx-ს შეუძლია
// 60 წამით დაიქეშოს და შემდეგ ძველი ვერსია ფონურ განახლებამდე მიაწოდოს.
// სესია props-ში არ გადის (კლიენტზე იტვირთება), ამიტომ HTML ყველასთვის ერთნაირია.
const PUBLIC_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

/** საჯარო გვერდის საერთო props (კატეგორიების ხე Header/Footer-ისთვის) + ქეშის header. */
export const getPublicPageProps = async (res: ServerResponse, locale?: string) => {
  res.setHeader("Cache-Control", PUBLIC_CACHE_CONTROL);
  return { categoryTree: await getCategoryTree(resolveLocale(locale)) };
};
