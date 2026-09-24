import React from "react";
import Link from "next/link";
import { Product } from "@/API_Client/types";
import { StatsControllerGetLowStockProductsOrderEnum as Order } from "@/API_Client/client/apis/stats-api";
import { WarningIcon } from "@/components/ui/RefIcons";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

// ბექენდის LOW_STOCK_ALLOWED_SORT_COLUMNS allow-list-ის იდენტური (stats.service.ts,
// online-shop-nest) — სხვა მნიშვნელობას ბექენდი უარყოფს.
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "stock", label: "მარაგი" },
  { value: "price", label: "ფასი" },
  { value: "createdAt", label: "დამატების თარიღი" },
];

// `GET /stats/products/low-stock`-ის თითოეულ პროდუქტს ერთვის ის ფერები /
// ვარიანტები (ფერი+ზომა), რომელთა მარაგიც ზღვარზე ნაკლები ან ტოლია —
// PaginatedResponseDto-ის data generic-ია, ამიტომ ტიპი აქვე აღვწერეთ.
export interface LowStockItem {
  type: "color" | "variant";
  id: string;
  color: { id: string; translations?: unknown; hexCode?: string } | null;
  size: { id: string; translations?: unknown; code: string } | null;
  stock: number;
}

export type LowStockProduct = Product & { lowStockItems?: LowStockItem[] };

const formatItemLabel = (item: LowStockItem, locale?: string) =>
  [item.color && getCategoryName(item.color, locale), item.size && (getCategoryName(item.size, locale) || item.size.code)]
    .filter(Boolean)
    .join(" / ") || "—";

interface LowStockProductsTableProps {
  products: LowStockProduct[];
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  order: Order;
  onOrderChange: (order: Order) => void;
  threshold: string;
  onThresholdChange: (threshold: string) => void;
  locale?: string;
}

// F5 ფაზა — დაბალი მარაგის მქონე აქტიური პროდუქტები (`GET /stats/products/low-stock`),
// paginated `PaginatedResponseDto<Product>` envelope-ით (იგივე shape, რაც /products-ს აქვს).
export const LowStockProductsTable: React.FC<LowStockProductsTableProps> = ({
  products,
  totalPages,
  page,
  onPageChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  threshold,
  onThresholdChange,
  locale,
}) => {
  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <WarningIcon size={14} /> დაბალი მარაგის პროდუქტები
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.FilterGrid>
        <S.FilterGroup>
          <S.FilterLabel>ზღვარი (stock ≤)</S.FilterLabel>
          <S.Input
            type="number"
            min={0}
            placeholder="5"
            value={threshold}
            onChange={(e) => onThresholdChange(e.target.value)}
          />
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>დალაგება</S.FilterLabel>
          <S.Select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </S.Select>
        </S.FilterGroup>
        <S.FilterGroup>
          <S.FilterLabel>მიმართულება</S.FilterLabel>
          <S.Select value={order} onChange={(e) => onOrderChange(e.target.value as Order)}>
            <option value={Order.Asc}>ზრდადობით</option>
            <option value={Order.Desc}>კლებადობით</option>
          </S.Select>
        </S.FilterGroup>
      </S.FilterGrid>

      {products.length === 0 ? (
        <S.ChartSummaryHint>ამ ზღვარში დაბალი მარაგის პროდუქტი არ მოიძებნა.</S.ChartSummaryHint>
      ) : (
        <>
          <S.TableScroll>
            <S.Table>
              <S.Thead>
                <S.Tr>
                  <S.Th>დასახელება</S.Th>
                  <S.Th>მარაგი</S.Th>
                  <S.Th>ფასი</S.Th>
                  <S.Th>კატეგორია</S.Th>
                </S.Tr>
              </S.Thead>
              <tbody>
                {products.map((product) => (
                  <S.Tr key={product.id}>
                    <S.Td>
                      <Link href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer">
                        {getCategoryName(product, locale)}
                      </Link>
                      {!!product.lowStockItems?.length && (
                        <S.LowStockItemList>
                          {product.lowStockItems.map((item) => (
                            <S.LowStockItemTag key={item.id} $empty={item.stock <= 0}>
                              {item.color?.hexCode && <S.LowStockColorDot style={{ background: item.color.hexCode }} />}
                              {formatItemLabel(item, locale)}: <strong>{item.stock}</strong>
                            </S.LowStockItemTag>
                          ))}
                        </S.LowStockItemList>
                      )}
                    </S.Td>
                    <S.Td>{product.stock}</S.Td>
                    <S.Td>{Number(product.price).toFixed(2)} ₾</S.Td>
                    <S.Td>{product.category ? getCategoryName(product.category, locale) : "—"}</S.Td>
                  </S.Tr>
                ))}
              </tbody>
            </S.Table>
          </S.TableScroll>

          {totalPages > 1 && (
            <S.PaginationBar>
              <S.PageButton onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
                ←
              </S.PageButton>
              <S.PageNumbers>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <S.PageNumberButton key={n} active={n === page} onClick={() => onPageChange(n)}>
                    {n}
                  </S.PageNumberButton>
                ))}
              </S.PageNumbers>
              <S.PageButton onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
                →
              </S.PageButton>
            </S.PaginationBar>
          )}
        </>
      )}
    </S.ChartCard>
  );
};

export default LowStockProductsTable;
