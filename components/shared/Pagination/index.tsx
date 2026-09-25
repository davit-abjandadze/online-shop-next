import Icon from "@/components/ui/Icon";
import React from "react";
import { scrollToTopSmooth } from "@/utils/scrollToTop";
import { getPaginationRange } from "@/utils/getPaginationRange";
import * as S from "./style";

type PaginationProps = {
  totalPages: number;
  page: number;
  handleRouteTo: (page: number) => void;
};

// გვერდების ჩამონათვალი getPaginationRange-იდან (ტესტებით დაფარული) — ადრე
// აქ ხელით დაწერილი განშტოებები იყო და მაგ. totalPages=4, page>=3-ზე
// პირველი გვერდის ღილაკი საერთოდ არ ჩანდა.
const Pagination: React.FC<PaginationProps> = ({ handleRouteTo, page, totalPages }) => {
  if (totalPages <= 0) return null;

  const handleRouteToWithScroll = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
    handleRouteTo(targetPage);
    scrollToTopSmooth();
  };

  const items = getPaginationRange(page, totalPages);

  return (
    <S.PaginationWrapper>
      <S.PaginationList>
        <S.PaginationListSwitch onClick={() => handleRouteToWithScroll(page - 1)} active={page > 1}>
          <Icon name="arrow_back_ios_new" />
        </S.PaginationListSwitch>
        {items.map((item, index) =>
          item === "..." ? (
            <S.PaginationListItem key={`dots-${index}`} style={{ pointerEvents: "none" }}>
              ...
            </S.PaginationListItem>
          ) : (
            <S.PaginationListItem
              key={item}
              active={item === page}
              // ვიწრო ეკრანზე მხოლოდ პირველი/ბოლო/მიმდინარე გვერდი რჩება
              className={item !== 1 && item !== totalPages && item !== page ? "hide-xs" : ""}
              onClick={() => handleRouteToWithScroll(item)}
            >
              {item}
            </S.PaginationListItem>
          )
        )}
        <S.PaginationListSwitch onClick={() => handleRouteToWithScroll(page + 1)} active={page < totalPages}>
          <Icon name="arrow_forward_ios" />
        </S.PaginationListSwitch>
      </S.PaginationList>
    </S.PaginationWrapper>
  );
};

export default Pagination;
