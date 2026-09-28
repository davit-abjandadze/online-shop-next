import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/types";

// root კატეგორიები ნესთებული children-ით (`GET /categories/tree`) — Header-ის
// კატეგორიების ზოლი და Footer ერთსა და იმავე სიას იყენებენ.
const CategoryTreeContext = createContext<Category[]>([]);

interface CategoryTreeProviderProps {
  // getServerSideProps-იდან (`pageProps.categoryTree`, იხ. utils/getCategoryTree.ts) —
  // სერვერზე ჩატვირთული ხე, რომ კატეგორიების ბმულები ყველა გვერდის HTML-ში იყოს
  // (SEO). გვერდებზე, სადაც ის არ მოდის (კალათა, პროფილი...), ბოლო ცნობილი ხე
  // რჩება, ან — თუ ჯერ არცერთი არ ჩატვირთულა/ლოკალი შეიცვალა — კლიენტზე იტვირთება.
  initialTree?: Category[];
  children: React.ReactNode;
}

export const CategoryTreeProvider = ({ initialTree, children }: CategoryTreeProviderProps) => {
  const router = useRouter();
  const locale = router.locale || "ka";
  const [state, setState] = useState<{ locale: string; tree: Category[] } | null>(
    initialTree ? { locale, tree: initialTree } : null
  );

  useEffect(() => {
    if (initialTree) setState({ locale, tree: initialTree });
  }, [initialTree, locale]);

  const hasTreeForLocale = state?.locale === locale || !!initialTree;

  useEffect(() => {
    if (hasTreeForLocale) return;
    let active = true;
    CategoriesAPI(locale, "")
      .categoryControllerFindTree()
      .then((res) => {
        const data = res.data as unknown as Category[];
        if (active) setState({ locale, tree: Array.isArray(data) ? data : [] });
      })
      .catch(() => {
        // კატეგორიების ზოლი არასავალდებულოა, შეცდომას ჩუმად ვტოვებთ
      });
    return () => {
      active = false;
    };
  }, [hasTreeForLocale, locale]);

  const tree = initialTree ?? (state?.locale === locale ? state.tree : []);

  return <CategoryTreeContext.Provider value={tree}>{children}</CategoryTreeContext.Provider>;
};

export const useCategoryTree = () => useContext(CategoryTreeContext);
