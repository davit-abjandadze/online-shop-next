import React from "react";
import { CategoryFilterEntry } from "@/API_Client/types";
import * as S from "./style";

interface FilterSidebarProps {
  facets: CategoryFilterEntry[];
  filters: Record<string, string>;
  locale?: string;
  onChange: (code: string, value: string | undefined, opts?: { debounceMs?: number }) => void;
  onClear: () => void;
}

const getLabel = (entry: CategoryFilterEntry["attribute"], locale?: string) =>
  locale === "en" ? entry.nameEn || entry.nameKa : entry.nameKa || entry.nameEn;

/**
 * `GET /categories/:slug/filters`-ის facet-ებს (`CategoryFilterEntry[]`)
 * UI-ში გადმოწერს, attribute.type-ის მიხედვით: select/multi_select →
 * checkbox სია count-ებით (OR-მატჩი, comma-joined option-codes),
 * number/range → min/max ინფუთები, boolean → 3-პოზიციური toggle
 * (ყველა/კი/არა), text → ტექსტური ძებნა (დებაუნსით).
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = ({ facets, filters, locale, onChange, onClear }) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const toggleOption = (code: string, optionCode: string) => {
    const current = (filters[code] || "").split(",").filter(Boolean);
    const next = current.includes(optionCode) ? current.filter((c) => c !== optionCode) : [...current, optionCode];
    onChange(code, next.length > 0 ? next.join(",") : undefined);
  };

  if (facets.length === 0) {
    return (
      <S.FilterCard>
        <S.FilterCardTitle>ფილტრები</S.FilterCardTitle>
        <S.FilterCardBody>
          <S.EmptyFacets>ამ კატეგორიისთვის ფილტრი ჯერ არ არსებობს.</S.EmptyFacets>
        </S.FilterCardBody>
      </S.FilterCard>
    );
  }

  return (
    <>
      {hasActiveFilters && (
        <S.FilterCard>
          <S.FilterCardBody style={{ padding: "10px 14px" }}>
            <S.ClearButton onClick={onClear}>ფილტრების გასუფთავება</S.ClearButton>
          </S.FilterCardBody>
        </S.FilterCard>
      )}

      {facets.map((facet) => {
        const { attribute } = facet;
        const label = `${getLabel(attribute, locale)}${attribute.unit ? ` (${attribute.unit})` : ""}`;

        return (
          <S.FilterCard key={attribute.id}>
            <S.FilterCardTitle>{label}</S.FilterCardTitle>
            <S.FilterCardBody>
              {/* select/multi_select */}
              {facet.options && (
                <>
                  {facet.options.map((opt) => {
                    const selected = (filters[attribute.code] || "").split(",").includes(opt.code);
                    const optLabel = locale === "en" ? opt.valueEn || opt.valueKa : opt.valueKa || opt.valueEn;
                    return (
                      <S.CheckboxRow key={opt.id} checked={selected}>
                        <S.CheckboxLabel>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleOption(attribute.code, opt.code)}
                          />
                          {optLabel}
                        </S.CheckboxLabel>
                        <S.OptionCount>{opt.count}</S.OptionCount>
                      </S.CheckboxRow>
                    );
                  })}
                  {facet.options.length === 0 && <S.EmptyFacets>ვარიანტები არ არის</S.EmptyFacets>}
                </>
              )}

              {/* number/range */}
              {(attribute.type === "number" || attribute.type === "range") && (
                <S.RangeRow>
                  <S.RangeInput
                    type="text"
                    inputMode="decimal"
                    placeholder={facet.min != null ? String(facet.min) : "დან"}
                    defaultValue={filters[`${attribute.code}_min`] || ""}
                    onChange={(e) => onChange(`${attribute.code}_min`, e.target.value || undefined, { debounceMs: 500 })}
                  />
                  <span style={{ color: "var(--ref-text-secondary)", fontSize: 12 }}>—</span>
                  <S.RangeInput
                    type="text"
                    inputMode="decimal"
                    placeholder={facet.max != null ? String(facet.max) : "მდე"}
                    defaultValue={filters[`${attribute.code}_max`] || ""}
                    onChange={(e) => onChange(`${attribute.code}_max`, e.target.value || undefined, { debounceMs: 500 })}
                  />
                </S.RangeRow>
              )}

              {/* boolean */}
              {attribute.type === "boolean" && (
                <S.BooleanRow>
                  <S.BooleanOption
                    active={!filters[attribute.code]}
                    onClick={() => onChange(attribute.code, undefined)}
                  >
                    ყველა
                  </S.BooleanOption>
                  <S.BooleanOption
                    active={filters[attribute.code] === "true"}
                    onClick={() => onChange(attribute.code, "true")}
                  >
                    კი {facet.counts ? `(${facet.counts.true})` : ""}
                  </S.BooleanOption>
                  <S.BooleanOption
                    active={filters[attribute.code] === "false"}
                    onClick={() => onChange(attribute.code, "false")}
                  >
                    არა {facet.counts ? `(${facet.counts.false})` : ""}
                  </S.BooleanOption>
                </S.BooleanRow>
              )}

              {/* text */}
              {attribute.type === "text" && (
                <S.TextInput
                  type="text"
                  placeholder="ძებნა..."
                  defaultValue={filters[attribute.code] || ""}
                  onChange={(e) => onChange(attribute.code, e.target.value || undefined, { debounceMs: 500 })}
                />
              )}
            </S.FilterCardBody>
          </S.FilterCard>
        );
      })}
    </>
  );
};

export default FilterSidebar;
