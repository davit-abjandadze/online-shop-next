import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { ChevronDownIcon } from "@/components/ui/RefIcons";
import { Category } from "@/API_Client/types";
import { useCategoryTree } from "@/context/CategoryTree";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

// ჰედერის უშუალოდ ქვემოთ, სრულ სიგანეზე გაშლილი კატეგორიების დროპდაუნ-ზოლი —
// მთავარი გვერდის CategoryFilterBar-ის (components/pages/home/index.tsx)
// ზუსტად იგივე ვიზუალითა და ქცევით: თითოეული root კატეგორია ცალკე
// დროპდაუნია — თუ ქვეკატეგორია აქვს, ხელის დაჭერისას იშლება "ყველა" +
// ქვეკატეგორიების სია; თუ არა, პირდაპირ ბმულია კატეგორიის გვერდზე.
// კატალოგისა (/products) და კატეგორიის (/categories/[slug]) გვერდებზეც
// გამოიყენება, რომ საიტის მასშტაბით ერთნაირი იყოს.
interface CategoryFilterBarProps {
  // "vertical" — Header-ის მობაილის ბურგერ-drawer-ში გამოსაყენებელი ვარიანტია
  // (იხ. components/shared/CategoryFilterBar/style.ts).
  layout?: "horizontal" | "vertical";
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({ layout = "horizontal" }) => {
  const { t } = useTranslation("catalog");
  const router = useRouter();
  // სერვერზე ჩატვირთული ხე (იხ. context/CategoryTree) — ბმულები SSR HTML-შია
  const categories = useCategoryTree();
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<number | string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenCategoryDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderCategoryFilter = (category: Category) => {
    const children = category.children || [];
    const name = getCategoryName(category, router.locale);

    if (children.length === 0) {
      return (
        <Link key={category.id} href={`/categories/${category.slug}`} passHref legacyBehavior>
          <S.FilterBarLink layout={layout}>{name}</S.FilterBarLink>
        </Link>
      );
    }

    const isOpen = openCategoryDropdown === category.id;

    return (
      <S.FilterDropdown key={category.id} layout={layout}>
        <S.FilterDropdownTrigger
          type="button"
          open={isOpen}
          layout={layout}
          onClick={() => setOpenCategoryDropdown((prev) => (prev === category.id ? null : category.id))}
        >
          {name}
          <S.FilterDropdownChevron open={isOpen}>
            <ChevronDownIcon size={14} />
          </S.FilterDropdownChevron>
        </S.FilterDropdownTrigger>

        {/* დახურულ მდგომარეობაშიც DOM-შია (hidden) — ქვეკატეგორიების ბმულებს
            საძიებო სისტემები HTML-იდან პოულობენ, მომხმარებელი კი მხოლოდ გახსნისას ხედავს */}
        <S.FilterDropdownPanel layout={layout} hidden={!isOpen}>
          <Link href={`/categories/${category.slug}`} passHref legacyBehavior>
            <S.FilterDropdownItem layout={layout} onClick={() => setOpenCategoryDropdown(null)}>
              {t("all")}
            </S.FilterDropdownItem>
          </Link>
          {children.map((child) => (
            <Link key={child.id} href={`/categories/${child.slug}`} passHref legacyBehavior>
              <S.FilterDropdownItem layout={layout} onClick={() => setOpenCategoryDropdown(null)}>
                {getCategoryName(child, router.locale)}
              </S.FilterDropdownItem>
            </Link>
          ))}
        </S.FilterDropdownPanel>
      </S.FilterDropdown>
    );
  };

  return (
    <S.CategoryFilterBar ref={barRef} layout={layout}>
      <S.CategoryFilterBarInner layout={layout}>
        {categories.length === 0 ? (
          <S.FilterEmpty>{t("no-categories")}</S.FilterEmpty>
        ) : (
          categories.map(renderCategoryFilter)
        )}
      </S.CategoryFilterBarInner>
    </S.CategoryFilterBar>
  );
};

export default CategoryFilterBar;
