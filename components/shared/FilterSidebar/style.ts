import styled from "styled-components";

// FilterSidebar-ის სტილები catalog-ის SidebarCard-ის (components/pages/catalog/style.ts)
// იმავე ვიზუალურ ენას იმეორებს — თითო attribute-ფილტრი ცალკე "ბარათია".

export const FilterCard = styled("div")`
  border-radius: 20px;
  background: var(--ref-bg-elevated);
  box-shadow: var(--ref-shadow-sm);
  border: 1px solid var(--ref-border-soft);
  overflow: hidden;
`;

export const FilterCardTitle = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ref-text-primary);
  border-bottom: 1px solid var(--ref-border-soft);
`;

export const FilterCardBody = styled("div")`
  padding: 10px 14px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CheckboxRow = styled("label")<{ checked?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 4px;
  font-size: 13px;
  font-weight: ${({ checked }) => (checked ? 700 : 500)};
  color: ${({ checked }) => (checked ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  cursor: pointer;

  input {
    accent-color: var(--ref-primary);
    cursor: pointer;
  }
`;

export const CheckboxLabel = styled("span")`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const OptionCount = styled("span")`
  font-size: 12px;
  color: var(--ref-text-secondary);
  font-weight: 500;
`;

export const RangeRow = styled("div")`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RangeInput = styled("input")`
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--ref-border);
  background: var(--ref-bg-base);
  color: var(--ref-text-primary);
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: var(--ref-primary);
  }
`;

export const TextInput = styled(RangeInput)``;

export const BooleanRow = styled("div")`
  display: flex;
  gap: 6px;
`;

export const BooleanOption = styled("button")<{ active?: boolean }>`
  flex: 1;
  padding: 7px 0;
  border-radius: 8px;
  border: 1px solid ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-border)")};
  background: ${({ active }) => (active ? "var(--ref-primary-soft)" : "transparent")};
  color: ${({ active }) => (active ? "var(--ref-primary)" : "var(--ref-text-primary)")};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

export const ClearButton = styled("button")`
  border: none;
  background: transparent;
  color: var(--ref-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: var(--ref-primary);
  }
`;

export const EmptyFacets = styled("span")`
  display: block;
  padding: 8px 4px;
  font-size: 12px;
  color: var(--ref-text-secondary);
`;
