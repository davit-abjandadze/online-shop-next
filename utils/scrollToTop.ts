// pagination-ის ღილაკზე დაჭერისას გვერდის თავში smooth scroll-ისთვის
// (SSR-ზე window არ არსებობს — ამიტომ დამცავი შემოწმება)
export const scrollToTopSmooth = () => {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
