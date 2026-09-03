import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { ChevronDownIcon } from "@/components/ui/RefIcons";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

// ჰედერის უშუალოდ ქვემოთ, სრულ სიგანეზე გაშლილი კატეგორიების დროპდაუნ-ზოლი —
// მთავარი გვერდის CategoryFilterBar-ის (components/pages/home/index.tsx)
// ზუსტად იგივე ვიზუალითა და ქცევით: თითოეული root კატეგორია ცალკე
// დროპდაუნია — თუ ქვეკატეგორია აქვს, ხელის დაჭერისას იშლება "ყველა" +
// ქვეკატეგორიების სია; თუ არა, პირდაპირ ბმულია კატეგორიის გვერდზე.
// კატალოგისა (/products) და კატეგორიის (/categories/[slug]) გვერდებზეც
// გამოიყენება, რომ საიტის მასშტაბით ერთნაირი იყოს.
export const CategoryFilterBar: React.FC = () => {
  const { t } = useTranslation("catalog");
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    let active = true;
    CategoriesAPI(router.locale || "ka", "")
      .categoryControllerFindTree()
      .then((res) => {
        if (!active) return;
        const data = res.data as unknown as Category[];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // კატეგორიების ზოლი არასავალდებულოა, შეცდომას ჩუმად ვტოვებთ
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale]);

  const renderCategoryFilter = (category: Category) => {
    const children = category.children || [];
    const name = getCategoryName(category, router.locale);

    if (children.length === 0) {
      return (
        <Link key={category.id} href={`/categories/${category.slug}`} passHref legacyBehavior>
          <S.FilterBarLink>{name}</S.FilterBarLink>
        </Link>
      );
    }

    const isOpen = openCategoryDropdown === category.id;

    return (
      <S.FilterDropdown key={category.id}>
        <S.FilterDropdownTrigger
          type="button"
          open={isOpen}
          onClick={() => setOpenCategoryDropdown((prev) => (prev === category.id ? null : category.id))}
        >
          {name}
          <S.FilterDropdownChevron open={isOpen}>
            <ChevronDownIcon size={14} />
          </S.FilterDropdownChevron>
        </S.FilterDropdownTrigger>

        {isOpen && (
          <S.FilterDropdownPanel>
            <Link href={`/categories/${category.slug}`} passHref legacyBehavior>
              <S.FilterDropdownItem onClick={() => setOpenCategoryDropdown(null)}>{t("all")}</S.FilterDropdownItem>
            </Link>
            {children.map((child) => (
              <Link key={child.id} href={`/categories/${child.slug}`} passHref legacyBehavior>
                <S.FilterDropdownItem onClick={() => setOpenCategoryDropdown(null)}>
                  {getCategoryName(child, router.locale)}
                </S.FilterDropdownItem>
              </Link>
            ))}
          </S.FilterDropdownPanel>
        )}
      </S.FilterDropdown>
    );
  };

  return (
    <S.CategoryFilterBar ref={barRef}>
      <S.CategoryFilterBarInner>
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
