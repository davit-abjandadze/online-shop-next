import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

// URL query-ის ეს key-ები დაცულია — ყველა დანარჩენი non-reserved query key
// attribute-ის code-ად ითვლება (`?brand=bosch&amperage_min=60`), Phase 5
// filter/facet endpoint-ების (`GET /categories/:slug/filters`/`products`)
// query პარამეტრების ფორმატის მიხედვით.
const RESERVED_KEYS = new Set(["page", "limit", "sortBy", "order", "subcategory", "slug"]);

export interface CategoryFiltersState {
  filters: Record<string, string>;
  subcategory: string | null;
  page: number;
  sortBy?: string;
  order?: string;
}

/**
 * URL query params ↔ კატეგორიის ფილტრების state-ის სინქრონიზაცია
 * (`catalog/index.tsx`-ის `?page=`/`?category=` URL-sync პატერნის
 * განზოგადება, დინამიური attribute-კოდებისთვის). ტექსტური/რიცხვითი
 * ველებისთვის `setFilter`-ს `debounceMs`-ის მიცემა შესაძლებელია, რომ
 * ყოველ keystroke-ზე router.push/refetch არ ხდებოდეს.
 */
export const useCategoryFilters = () => {
  const router = useRouter();
  const [state, setState] = useState<CategoryFiltersState>({ filters: {}, subcategory: null, page: 1 });
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query as Record<string, string>;
    const filters: Record<string, string> = {};
    Object.keys(q).forEach((key) => {
      if (!RESERVED_KEYS.has(key)) filters[key] = q[key];
    });
    const page = parseInt(q.page, 10);
    setState({
      filters,
      subcategory: q.subcategory || null,
      page: !isNaN(page) && page > 0 ? page : 1,
      sortBy: q.sortBy,
      order: q.order,
    });
    // slug ცვლილებაზე (სხვა კატეგორიაზე გადასვლა) state-ი ხელახლა
    // router.query-იდან ივსება — ახალი კატეგორია ძველი ფილტრებით არ იხსნება.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.slug]);

  const pushQuery = (patch: Record<string, string | undefined>, opts: { keepPage?: boolean } = {}) => {
    const query: Record<string, string> = { ...(router.query as Record<string, string>) };
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === "") delete query[key];
      else query[key] = value;
    });
    if (!opts.keepPage) delete query.page;
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const setFilter = (code: string, value: string | undefined, opts: { debounceMs?: number } = {}) => {
    setState((prev) => {
      const filters = { ...prev.filters };
      if (value === undefined || value === "") delete filters[code];
      else filters[code] = value;
      return { ...prev, filters, page: 1 };
    });

    const run = () => pushQuery({ [code]: value });
    if (opts.debounceMs) {
      if (debounceTimers.current[code]) clearTimeout(debounceTimers.current[code]);
      debounceTimers.current[code] = setTimeout(run, opts.debounceMs);
    } else {
      run();
    }
  };

  // FilterSidebar-ის "გაფილტვრა" ღილაკზე დაჭერისას draft-ში დაგროვილი
  // ყველა ცვლილება ერთბაშად გამოიყენება — თითო ველის ცვლილებაზე
  // ცალ-ცალკე `setFilter`/router.push-ის ნაცვლად ერთი push-ით.
  const applyFilters = (nextFilters: Record<string, string>) => {
    setState((prev) => ({ ...prev, filters: nextFilters, page: 1 }));
    const query: Record<string, string> = {};
    Object.entries(router.query as Record<string, string>).forEach(([key, value]) => {
      // `slug` — დინამიური route param-ი (`/categories/[slug]`) — ყოველთვის
      // უნდა შენარჩუნდეს, თორემ router.push-ს [slug]-ის ინტერპოლაცია არ შეუძლია.
      if (key === "slug" && value) query[key] = value;
      else if (RESERVED_KEYS.has(key) && key !== "page" && value) query[key] = value;
    });
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) query[key] = value;
    });
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  const setSubcategory = (slug: string | null) => {
    setState((prev) => ({ ...prev, subcategory: slug, page: 1 }));
    pushQuery({ subcategory: slug || undefined });
  };

  const setPage = (page: number) => {
    setState((prev) => ({ ...prev, page }));
    pushQuery({ page: String(page) }, { keepPage: true });
  };

  const setSort = (sortBy?: string, order?: string) => {
    setState((prev) => ({ ...prev, sortBy, order }));
    pushQuery({ sortBy, order });
  };

  const clearFilters = () => {
    setState((prev) => ({ ...prev, filters: {}, page: 1 }));
    const query: Record<string, string> = {};
    // `slug` — დინამიური route param-ი (`/categories/[slug]`) — ყოველთვის
    // უნდა შენარჩუნდეს, თორემ router.push-ს [slug]-ის ინტერპოლაცია არ შეუძლია.
    (["slug", "subcategory", "sortBy", "order"] as const).forEach((k) => {
      const v = (router.query as Record<string, string>)[k];
      if (v) query[k] = v;
    });
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  return { ...state, setFilter, applyFilters, setSubcategory, setPage, setSort, clearFilters };
};

export default useCategoryFilters;
