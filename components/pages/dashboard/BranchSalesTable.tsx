import React from "react";
import { BranchSalesDto } from "@/API_Client/client/models";
import { BuildingIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

const formatCurrency = (value: number) => `${value.toFixed(2)} ₾`;

interface BranchSalesTableProps {
  data: BranchSalesDto;
}

// F6 ფაზა — ფილიალების გაყიდვები (`GET /stats/branches/sales`). ბექენდი ყველა
// ფილიალს აბრუნებს, ნულოვანი გაყიდვების ფილიალების ჩათვლითაც.
export const BranchSalesTable: React.FC<BranchSalesTableProps> = ({ data }) => {
  if (!data.branches.length) {
    return (
      <S.ChartCard>
        <S.ChartCardTitle>
          <S.ChartTitleText>
            <BuildingIcon size={14} /> ფილიალების გაყიდვები
          </S.ChartTitleText>
        </S.ChartCardTitle>
        <S.ChartSummaryHint>ფილიალი არ მოიძებნა.</S.ChartSummaryHint>
      </S.ChartCard>
    );
  }

  return (
    <S.ChartCard>
      <S.ChartCardTitle>
        <S.ChartTitleText>
          <BuildingIcon size={14} /> ფილიალების გაყიდვები
        </S.ChartTitleText>
      </S.ChartCardTitle>

      <S.TableScroll>
        <S.Table>
          <S.Thead>
            <S.Tr>
              <S.Th>ფილიალი</S.Th>
              <S.Th>შეკვეთები</S.Th>
              <S.Th>შემოსავალი</S.Th>
            </S.Tr>
          </S.Thead>
          <tbody>
            {data.branches.map((branch) => (
              <S.Tr key={branch.branchId}>
                <S.Td>{branch.branchTitle}</S.Td>
                <S.Td>{branch.orderCount}</S.Td>
                <S.Td>{formatCurrency(branch.revenue)}</S.Td>
              </S.Tr>
            ))}
          </tbody>
        </S.Table>
      </S.TableScroll>
    </S.ChartCard>
  );
};

export default BranchSalesTable;
