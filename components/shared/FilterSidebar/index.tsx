import React, { useEffect, useMemo, useState } from "react";
import { CategoryFilterEntry } from "@/API_Client/types";
import * as S from "./style";

export interface PriceBounds {
  min: number;
  max: number;
}

// draft-ის ცვლილება (checkbox/input) ლოკალურ state-ს ეხება — URL/refetch
// არ ხდება, ფაქტობრივი გაფილტვრა მხოლოდ "გაფილტვრა" ღილაკზე დაჭერისას,
// `onApply`-ს საშუალებით.
type DraftChangeHandler = (code: string, value: string | undefined) => void;

interface FilterSidebarProps {
  facets: CategoryFilterEntry[];
  filters: Record<string, string>;
  locale?: string;
  onApply: (filters: Record<string, string>) => void;
  onClear: () => void;
  // კატეგორიაში (მიმდინარე ფილტრების გათვალისწინებით) რეალურად არსებული
  // ფასის დიაპაზონი — სლაიდერის ბორდერებისთვის. თუ არ მოვიდა/ცარიელია,
  // ვიყენებთ DEFAULT_PRICE_BOUNDS-ს.
  priceBounds?: PriceBounds | null;
}

const getLabel = (entry: CategoryFilterEntry["attribute"], locale?: string) =>
  locale === "en" ? entry.nameEn || entry.nameKa : entry.nameKa || entry.nameEn;

const DEFAULT_PRICE_BOUNDS: PriceBounds = { min: 0, max: 10000 };

/**
 * ფასის ფილტრი — ორივე დან/მდე ტექსტური ველი და dual-thumb range slider
 * ერთსა და იმავე `minPrice`/`maxPrice` filter-key-ებზე მუშაობს
 * (`category.service.ts`-ის `buildFilteredProductsQuery`-ის `query.minPrice`/
 * `query.maxPrice`-ის შესაბამისად). ცვლილება მხოლოდ draft state-ს
 * (`filters` prop-ს, რომელსაც `FilterSidebar` აწვდის) ეხება — რეალურ
 * გაფილტვრას "გაფილტვრა" ღილაკი იწვევს.
 */
const PriceFilter: React.FC<{
  filters: Record<string, string>;
  bounds?: PriceBounds | null;
  onChange: DraftChangeHandler;
}> = ({ filters, bounds, onChange }) => {
  const { min: boundMin, max: boundMax } =
    bounds && bounds.max > bounds.min ? bounds : DEFAULT_PRICE_BOUNDS;

  const [minVal, setMinVal] = useState<number>(() =>
    filters.minPrice ? Number(filters.minPrice) : boundMin
  );
  const [maxVal, setMaxVal] = useState<number>(() =>
    filters.maxPrice ? Number(filters.maxPrice) : boundMax
  );

  useEffect(() => {
    setMinVal(filters.minPrice ? Number(filters.minPrice) : boundMin);
    setMaxVal(filters.maxPrice ? Number(filters.maxPrice) : boundMax);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.minPrice, filters.maxPrice, boundMin, boundMax]);

  const commitMin = (raw: number) => {
    const clamped = Math.min(Math.max(raw, boundMin), maxVal);
    setMinVal(clamped);
    onChange("minPrice", clamped > boundMin ? String(clamped) : undefined);
  };

  const commitMax = (raw: number) => {
    const clamped = Math.max(Math.min(raw, boundMax), minVal);
    setMaxVal(clamped);
    onChange("maxPrice", clamped < boundMax ? String(clamped) : undefined);
  };

  const span = boundMax - boundMin || 1;
  const leftPercent = ((minVal - boundMin) / span) * 100;
  const rightPercent = 100 - ((maxVal - boundMin) / span) * 100;

  return (
    <S.FilterCard>
      <S.FilterCardTitle>ფასი</S.FilterCardTitle>
      <S.FilterCardBody>
        <S.RangeRow>
          <S.RangeInput
            key={`min-${filters.minPrice || ""}`}
            type="text"
            inputMode="decimal"
            placeholder={String(boundMin)}
            defaultValue={filters.minPrice || ""}
            onChange={(e) => onChange("minPrice", e.target.value || undefined)}
          />
          <span style={{ color: "var(--ref-text-secondary)", fontSize: 12 }}>—</span>
          <S.RangeInput
            key={`max-${filters.maxPrice || ""}`}
            type="text"
            inputMode="decimal"
            placeholder={String(boundMax)}
            defaultValue={filters.maxPrice || ""}
            onChange={(e) => onChange("maxPrice", e.target.value || undefined)}
          />
        </S.RangeRow>

        <S.SliderWrap>
          <S.SliderTrack />
          <S.SliderRange left={leftPercent} right={rightPercent} />
          <S.SliderInput
            type="range"
            min={boundMin}
            max={boundMax}
            value={minVal}
            onChange={(e) => commitMin(Number(e.target.value))}
          />
          <S.SliderInput
            type="range"
            min={boundMin}
            max={boundMax}
            value={maxVal}
            onChange={(e) => commitMax(Number(e.target.value))}
          />
        </S.SliderWrap>
        <S.PriceBoundsLabel>
          <span>{boundMin}</span>
          <span>{boundMax}</span>
        </S.PriceBoundsLabel>
      </S.FilterCardBody>
    </S.FilterCard>
  );
};

/**
 * `GET /categories/:slug/filters`-ის facet-ებს (`CategoryFilterEntry[]`)
 * UI-ში გადმოწერს, attribute.type-ის მიხედვით: select/multi_select →
 * checkbox სია count-ებით (OR-მატჩი, comma-joined option-codes),
 * number/range → min/max ინფუთები, boolean → 3-პოზიციური toggle
 * (ყველა/კი/არა), text → ტექსტური ძებნა. ამას გარდა ყოველთვის (facet-ების
 * მიუხედავად) ჩანს სახელით ძებნა (`search`) და ფასის ფილტრი
 * (`minPrice`/`maxPrice`, დან-მდე ველები + range slider) — ორივე
 * ატრიბუტების გარეშე, პირდაპირ `product`-ის საკუთარ სვეტებზეა.
 *
 * ცვლილებები URL-ს/გვერდის refetch-ს **მხოლოდ** ბოლოში სტიკი
 * "გაფილტვრა" ღილაკზე დაჭერისას იწვევს — შუალედში ინფუთების ცვლილება
 * მხოლოდ ლოკალურ draft-ს (`draft` state) ეხება, რომ ყოველ toggle/keystroke-ზე
 * გვერდი აღარ განახლდეს და ლინკი აღარ იცვლებოდეს.
 */
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  facets,
  filters,
  locale,
  onApply,
  onClear,
  priceBounds,
}) => {
  const [draft, setDraft] = useState<Record<string, string>>(filters);

  // გარედან წამოსული ცვლილება (URL-ის პირდაპირი რედაქტირება, "გასუფთავება",
  // ან უკვე apply-ს შემდეგ თავად draft-ის შესაბამისი მდგომარეობა) draft-საც
  // სინქრონდება.
  useEffect(() => {
    setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(filters), [draft, filters]);
  const hasDraftFilters = Object.keys(draft).length > 0;

  const handleChange: DraftChangeHandler = (code, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") delete next[code];
      else next[code] = value;
      return next;
    });
  };

  const toggleOption = (code: string, optionCode: string) => {
    const current = (draft[code] || "").split(",").filter(Boolean);
    const next = current.includes(optionCode) ? current.filter((c) => c !== optionCode) : [...current, optionCode];
    handleChange(code, next.length > 0 ? next.join(",") : undefined);
  };

  const handleClear = () => {
    setDraft({});
    onClear();
  };

  const handleApply = () => {
    onApply(draft);
  };

  return (
    <>
      {hasDraftFilters && (
        <S.FilterCard>
          <S.FilterCardBody style={{ padding: "10px 14px" }}>
            <S.ClearButton onClick={handleClear}>ფილტრების გასუფთავება</S.ClearButton>
          </S.FilterCardBody>
        </S.FilterCard>
      )}

      <S.FilterCard>
        <S.FilterCardTitle>ძებნა დასახელებით</S.FilterCardTitle>
        <S.FilterCardBody>
          <S.TextInput
            key={`search-${filters.search || ""}`}
            type="text"
            placeholder="მაგ. სახელი..."
            defaultValue={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value || undefined)}
          />
        </S.FilterCardBody>
      </S.FilterCard>

      <PriceFilter filters={draft} bounds={priceBounds} onChange={handleChange} />

      {facets.length === 0 ? (
        <S.FilterCard>
          <S.FilterCardTitle>ფილტრები</S.FilterCardTitle>
          <S.FilterCardBody>
            <S.EmptyFacets>ამ კატეგორიისთვის დამატებითი ფილტრი ჯერ არ არსებობს.</S.EmptyFacets>
          </S.FilterCardBody>
        </S.FilterCard>
      ) : null}

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
                    const selected = (draft[attribute.code] || "").split(",").includes(opt.code);
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
                    defaultValue={draft[`${attribute.code}_min`] || ""}
                    onChange={(e) => handleChange(`${attribute.code}_min`, e.target.value || undefined)}
                  />
                  <span style={{ color: "var(--ref-text-secondary)", fontSize: 12 }}>—</span>
                  <S.RangeInput
                    type="text"
                    inputMode="decimal"
                    placeholder={facet.max != null ? String(facet.max) : "მდე"}
                    defaultValue={draft[`${attribute.code}_max`] || ""}
                    onChange={(e) => handleChange(`${attribute.code}_max`, e.target.value || undefined)}
                  />
                </S.RangeRow>
              )}

              {/* boolean */}
              {attribute.type === "boolean" && (
                <S.BooleanRow>
                  <S.BooleanOption
                    active={!draft[attribute.code]}
                    onClick={() => handleChange(attribute.code, undefined)}
                  >
                    ყველა
                  </S.BooleanOption>
                  <S.BooleanOption
                    active={draft[attribute.code] === "true"}
                    onClick={() => handleChange(attribute.code, "true")}
                  >
                    კი {facet.counts ? `(${facet.counts.true})` : ""}
                  </S.BooleanOption>
                  <S.BooleanOption
                    active={draft[attribute.code] === "false"}
                    onClick={() => handleChange(attribute.code, "false")}
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
                  defaultValue={draft[attribute.code] || ""}
                  onChange={(e) => handleChange(attribute.code, e.target.value || undefined)}
                />
              )}
            </S.FilterCardBody>
          </S.FilterCard>
        );
      })}

      <S.ApplyBar>
        <S.ApplyButton pending={isDirty} onClick={handleApply}>
          გაფილტვრა
        </S.ApplyButton>
      </S.ApplyBar>
    </>
  );
};

export default FilterSidebar;
