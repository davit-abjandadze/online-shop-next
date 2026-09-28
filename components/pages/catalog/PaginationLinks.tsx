import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { PaginatedResponseDto, Product } from "@/API_Client/types";
import * as S from "./style";

interface PaginationLinksProps {
  meta: PaginatedResponseDto<Product>["meta"];
  onPageChange: (page: number) => void;
}

// ჩვეულებრივი მარცხენა კლიკი — ჩვენი shallow ნავიგაცია; ctrl/cmd/shift/შუა
// კლიკი კი ბრაუზერს რჩება (ახალ ჩანართში გახსნა).
const isPlainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * კატალოგისა და კატეგორიის გვერდების პაგინაცია — ნომრები `<a href="?page=N">`
 * ბმულებია (და არა onClick-იანი ღილაკები), რომ Googlebot-მა მე-2, მე-3... გვერდები
 * იპოვოს. კლიკზე იგივე shallow ნავიგაცია რჩება (`onPageChange`).
 */
const PaginationLinks = ({ meta, onPageChange }: PaginationLinksProps) => {
  const router = useRouter();

  const hrefFor = (page: number) => {
    const query = { ...router.query };
    if (page > 1) query.page = String(page);
    else delete query.page;
    return { pathname: router.pathname, query };
  };

  const renderLink = (page: number, content: React.ReactNode, props: { active?: boolean; rel?: "prev" | "next"; number?: boolean }) => {
    const onClick = (e: React.MouseEvent) => {
      if (!isPlainClick(e)) return;
      e.preventDefault();
      onPageChange(page);
    };
    return (
      <Link key={`${props.rel || ""}${page}`} href={hrefFor(page)} passHref legacyBehavior>
        {props.number ? (
          <S.PageNumberButton as="a" active={props.active} aria-current={props.active ? "page" : undefined} onClick={onClick}>
            {content}
          </S.PageNumberButton>
        ) : (
          <S.PageButton as="a" rel={props.rel} onClick={onClick}>
            {content}
          </S.PageButton>
        )}
      </Link>
    );
  };

  return (
    <S.PaginationBar>
      {meta.hasPrevious ? (
        renderLink(Math.max(1, meta.page - 1), "←", { rel: "prev" })
      ) : (
        <S.PageButton type="button" disabled>
          ←
        </S.PageButton>
      )}
      <S.PageNumbers>
        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) =>
          renderLink(n, n, { active: n === meta.page, number: true })
        )}
      </S.PageNumbers>
      {meta.hasNext ? (
        renderLink(meta.page + 1, "→", { rel: "next" })
      ) : (
        <S.PageButton type="button" disabled>
          →
        </S.PageButton>
      )}
    </S.PaginationBar>
  );
};

export default PaginationLinks;
