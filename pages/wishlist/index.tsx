import useTranslation from "next-translate/useTranslation";
import WishlistComponent from "@/components/pages/wishlist";
import Seo from "@/components/shared/Seo";

export default function WishlistPage() {
  const { t } = useTranslation("common");
  const { t: tCatalog } = useTranslation("catalog");

  return (
    <>
      {/* მომხმარებლის პირადი სია — ინდექსაცია აზრს მოკლებულია */}
      <Seo
        title={`${tCatalog("wishlist-title")} - ${t("default-page-title")}`}
        description={tCatalog("wishlist-subtitle")}
        noindex
      />
      <main>
        <WishlistComponent />
      </main>
    </>
  );
}
