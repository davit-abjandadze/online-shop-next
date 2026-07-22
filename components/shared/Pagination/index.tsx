import Icon from "@/components/ui/Icon";
import React from "react";
import * as S from "./style";

type PaginationProps = {
  totalPages: number;
  page: number;
  handleRouteTo: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  handleRouteTo,
  page,
  totalPages,
}) => {
  return (
    <S.PaginationWrapper>
      <S.PaginationList>
        <S.PaginationListSwitch
          onClick={() => {
            if (page == 1) {
              return;
            }
            handleRouteTo(page - 1);
          }}
          active={page != 1}
        >
          <Icon name="arrow_back_ios_new" />
        </S.PaginationListSwitch>
        {page == 1 && (
          <>
            <S.PaginationListItem onClick={() => handleRouteTo(1)} active>
              {page}
            </S.PaginationListItem>
            {totalPages > 1 && (
              <S.PaginationListItem onClick={() => handleRouteTo(2)}>
                {page + 1}
              </S.PaginationListItem>
            )}
            {totalPages - page > 3 && (
              <S.PaginationListItem style={{ pointerEvents: "none" }}>
                ...
              </S.PaginationListItem>
            )}
            {totalPages > 2 && (
              <S.PaginationListItem
                onClick={() =>
                  handleRouteTo(totalPages - (totalPages > 3 ? 1 : 0))
                }
              >
                {totalPages - (totalPages > 3 ? 1 : 0)}
              </S.PaginationListItem>
            )}
            {totalPages > 3 && (
              <S.PaginationListItem onClick={() => handleRouteTo(totalPages)}>
                {totalPages}
              </S.PaginationListItem>
            )}
          </>
        )}
        {page >= 2 && (
          <>
            {totalPages > 4 && page > 2 && (
              <S.PaginationListItem onClick={() => handleRouteTo(1)}>
                1
              </S.PaginationListItem>
            )}
            {totalPages > 4 && page > 3 && (
              <S.PaginationListItem style={{ pointerEvents: "none" }}>
                ...
              </S.PaginationListItem>
            )}
            <S.PaginationListItem
              className={totalPages > 4 && page > 3 ? "hide-xs" : ""}
              onClick={() => handleRouteTo(page - 1)}
            >
              {page - 1}
            </S.PaginationListItem>
            <S.PaginationListItem onClick={() => handleRouteTo(page)} active>
              {page}
            </S.PaginationListItem>
            {totalPages - page > 0 && (
              <S.PaginationListItem
                className={totalPages - page > 2 ? "hide-xs" : ""}
                onClick={() => handleRouteTo(page + 1)}
              >
                {page + 1}
              </S.PaginationListItem>
            )}
            {totalPages - page > 2 && (
              <S.PaginationListItem style={{ pointerEvents: "none" }}>
                ...
              </S.PaginationListItem>
            )}
            {totalPages - page > 1 && (
              <S.PaginationListItem onClick={() => handleRouteTo(totalPages)}>
                {totalPages}
              </S.PaginationListItem>
            )}
          </>
        )}
        <S.PaginationListSwitch
          onClick={() => {
            if (page == totalPages) {
              return;
            }
            handleRouteTo(page + 1);
          }}
          active={page != totalPages}
        >
          <Icon name="arrow_forward_ios" />
        </S.PaginationListSwitch>
      </S.PaginationList>
    </S.PaginationWrapper>
  );
};

export default Pagination;
