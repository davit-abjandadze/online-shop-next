import styled from "styled-components";

// FilterSidebar-ის სტილები catalog-ის SidebarCard-ის (components/pages/catalog/style.ts)
// იმავე ვიზუალურ ენას იმეორებს — თითო attribute-ფილტრი ცალკე "ბარათია".

// მთლიანი ფილტრი ერთ `<form>`-შია გახვეული, რომ ნებისმიერი ველიდან Enter-ზე
// დაჭერამ "გაფილტვრა" ღილაკის ეკვივალენტური submit გამოიწვიოს.
export const FilterForm = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

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

// ფასის დიაპაზონის dual-thumb სლაიდერი — ორი გადაფარული `input[type=range]`
// (თითო thumb-ისთვის), pointer-events: none ტრეკზე და auto მხოლოდ thumb-ზე,
// რომ ორივე ცალ-ცალკე გადაადგილდეს ერთმანეთის დაბლოკვის გარეშე.
export const SliderWrap = styled("div")`
  position: relative;
  height: 28px;
  margin-top: 6px;
  cursor: pointer;
  touch-action: none;
`;

export const SliderTrack = styled("div")`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 2px;
  background: var(--ref-border);
`;

export const SliderRange = styled("div")<{ left: number; right: number }>`
  position: absolute;
  top: 50%;
  height: 4px;
  transform: translateY(-50%);
  border-radius: 2px;
  background: var(--ref-primary);
  left: ${({ left }) => left}%;
  right: ${({ right }) => right}%;
`;

export const SliderInput = styled("input")`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 4px;
  transform: translateY(-50%);
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-runnable-track {
    background: transparent;
  }
  &::-moz-range-track {
    background: transparent;
  }

  // thumb-ის pointer-events აღარაა auto — SliderWrap-ის საკუთარი
  // pointer-based drag (index.tsx-ის handleTrackPointerDown) მთელ ტრეკზე
  // (მათ შორის thumb-ის ადგილზეც) ერთნაირად ამუშავებს დაჭერას/გადათრევას;
  // ეს input-ები visual thumb-ს (value-ის მიხედვით) და keyboard/a11y
  // ნავიგაციას (Tab + arrow keys) მხოლოდ ემსახურებიან.
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--ref-primary);
    border: 2px solid var(--ref-bg-elevated);
    box-shadow: var(--ref-shadow-sm);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--ref-primary);
    border: 2px solid var(--ref-bg-elevated);
    box-shadow: var(--ref-shadow-sm);
  }
`;

export const PriceBoundsLabel = styled("div")`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--ref-text-secondary);
  margin-top: 4px;
`;

// გაფილტვრის ღილაკის სტიკი კონტეინერი — filter card-ების ბოლოში, ეკრანის
// ბოლოში სულ ჩანს (position: sticky), რომ ცვლილებების გამოყენება
// ყოველი input-ის შეხებაზე გვერდის refresh-ის/URL-ის ცვლილების გარეშე
// ერთი დაჭერით მოხდეს.
export const ApplyBar = styled("div")`
  position: sticky;
  bottom: 16px;
  z-index: 5;
  padding-top: 4px;
  display: flex;
  align-items: stretch;
  gap: 8px;
`;

// ფილტრების გასუფთავების ღილაკი — "გაფილტვრა" ღილაკის გვერდით, მხოლოდ
// მაშინ ჩანს, როცა draft-ში მონიშნული ფილტრი არსებობს.
export const ClearFilterButton = styled("button")`
  flex: 0 0 45px;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ref-border);
  border-radius: 14px;
  background: var(--ref-bg-elevated);
  color: var(--ref-text-secondary);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--ref-primary);
    color: var(--ref-primary);
  }
`;

export const ApplyButton = styled("button")<{ pending?: boolean }>`
  flex: 1;
  padding: 13px 0;
  border: none;
  border-radius: 14px;
  background: var(--ref-primary);
  color: var(--ref-bg-elevated);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--ref-shadow-md, var(--ref-shadow-sm));
  transition: transform 0.15s ease, opacity 0.15s ease;
  opacity: ${({ pending }) => (pending ? 1 : 0.85)};

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
