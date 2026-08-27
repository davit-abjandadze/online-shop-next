import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // ტექსტური "დან"/"მდე" ველების საკუთარი controlled state — `key`-ზე
  // დაფუძნებული remount-ის ნაცვლად, რომელიც draft-ის ყოველ keystroke-ზე
  // ცვლილებას ველს ხელახლა ქმნიდა და focus-ს კარგავდა.
  const [minText, setMinText] = useState(filters.minPrice || "");
  const [maxText, setMaxText] = useState(filters.maxPrice || "");

  useEffect(() => {
    // `minVal`/`maxVal` (slider-ის ვიზუალი) ყოველთვის [boundMin, boundMax]
    // დიაპაზონშია clamp-ული — თუ draft-ში (ტექსტური ველიდან, blur-მდე)
    // საზღვრებს გარეთა მნიშვნელობა მოხვდა, SliderRange არ უნდა გავიდეს
    // track-ის კიდეზე გარეთ.
    const nextMin = filters.minPrice ? Number(filters.minPrice) : boundMin;
    const nextMax = filters.maxPrice ? Number(filters.maxPrice) : boundMax;
    setMinVal(Number.isNaN(nextMin) ? boundMin : Math.min(Math.max(nextMin, boundMin), boundMax));
    setMaxVal(Number.isNaN(nextMax) ? boundMax : Math.min(Math.max(nextMax, boundMin), boundMax));
    setMinText(filters.minPrice || "");
    setMaxText(filters.maxPrice || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.minPrice, filters.maxPrice, boundMin, boundMax]);

  // სლაიდერის ჩავლების დროს `minVal`/`maxVal`-ს ვამზადებთ ref-შიც, რომ
  // pointer-up-ზე ზუსტად ბოლო მნიშვნელობა წავიდეს draft-ში — closure-ში
  // `minVal`/`maxVal` შეიძლება ჯერ ძველი იყოს, ref კი ყოველთვის განახლებულია.
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  minValRef.current = minVal;
  maxValRef.current = maxVal;

  // ჩავლებისას (drag) მხოლოდ ლოკალურ state-ს ვცვლით — thumb-ი მაშინვე,
  // მთელი `FilterSidebar`-ის (ყველა facet-ით) გადარენდერის გარეშე
  // მოძრაობს ხაზზე. `onChange`-ით draft-ში (parent-ში) ვწერთ მხოლოდ
  // pointer-up/keyup-ზე — რომ მძიმე re-render ყოველ pixel-ზე არ გამოიწვიოს
  // და ბულეტების მოძრაობა არ "გაიჭედოს".
  const commitMin = (raw: number) => {
    const clamped = Math.min(Math.max(raw, boundMin), maxVal);
    setMinVal(clamped);
  };

  const commitMax = (raw: number) => {
    const clamped = Math.max(Math.min(raw, boundMax), minVal);
    setMaxVal(clamped);
  };

  const flushMin = () => {
    const clamped = minValRef.current;
    onChange("minPrice", clamped > boundMin ? String(clamped) : undefined);
    setMinText(clamped > boundMin ? String(clamped) : "");
  };

  const flushMax = () => {
    const clamped = maxValRef.current;
    onChange("maxPrice", clamped < boundMax ? String(clamped) : undefined);
    setMaxText(clamped < boundMax ? String(clamped) : "");
  };

  // ტექსტური "დან"/"მდე" ველების ვალიდაცია — არ დაუშვას პროდუქციის
  // რეალურ ფასის დიაპაზონზე (`boundMin`/`boundMax`) ნაკლები/მეტი მნიშვნელობა.
  // ზედა ზღვარს (და მეორე thumb-ს) მაშინვე ვზღუდავთ — მეტი ციფრის აკრეფაც
  // მხოლოდ გააუარესებდა; ქვედას კი blur-ზე, რადგან აკრეფის დროს (მაგ. "1"
  // "150"-დან) ნაადრევი ჩარევა შეუძლებელს გახდიდა ნორმალურ აკრეფას.
  const applyMinText = (raw: string) => {
    if (raw === "") {
      setMinVal(boundMin);
      onChange("minPrice", undefined);
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      setMinText(filters.minPrice || "");
      return;
    }
    const clamped = Math.min(Math.max(num, boundMin), maxVal);
    setMinVal(clamped);
    setMinText(clamped > boundMin ? String(clamped) : "");
    onChange("minPrice", clamped > boundMin ? String(clamped) : undefined);
  };

  const applyMaxText = (raw: string) => {
    if (raw === "") {
      setMaxVal(boundMax);
      onChange("maxPrice", undefined);
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      setMaxText(filters.maxPrice || "");
      return;
    }
    const clamped = Math.max(Math.min(num, boundMax), minVal);
    setMaxVal(clamped);
    setMaxText(clamped < boundMax ? String(clamped) : "");
    onChange("maxPrice", clamped < boundMax ? String(clamped) : undefined);
  };

  const span = boundMax - boundMin || 1;
  const leftPercent = ((minVal - boundMin) / span) * 100;
  const rightPercent = 100 - ((maxVal - boundMin) / span) * 100;

  // ორი გადაფარული `input[type=range]`-იდან pointer-events:auto მხოლოდ
  // thumb-ის ვიწრო წრეზეა (style.ts) — ტრეკის დანარჩენ ნაწილზე (SliderTrack)
  // დაჭერა/გადათრევა native input-ს საერთოდ არ სწვდება. ამიტომ SliderWrap-ზე
  // საკუთარი pointer-based drag გვაქვს: სად დააჭირა → უახლოეს thumb-ს ვარჩევთ
  // და ვაჭერთ იქამდე, შემდეგ window-ზე pointermove/pointerup-ით ვაგრძელებთ
  // გადათრევას მიუხედავად იმისა, სად დაიწყო დაჭერა ტრეკზე.
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragThumbRef = useRef<"min" | "max" | null>(null);

  const valueFromClientX = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return boundMin;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(boundMin + ratio * span);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const val = valueFromClientX(e.clientX);
    const thumb: "min" | "max" = Math.abs(val - minVal) <= Math.abs(val - maxVal) ? "min" : "max";
    dragThumbRef.current = thumb;
    if (thumb === "min") commitMin(val);
    else commitMax(val);

    const handleMove = (ev: PointerEvent) => {
      const v = valueFromClientX(ev.clientX);
      if (dragThumbRef.current === "min") commitMin(v);
      else if (dragThumbRef.current === "max") commitMax(v);
    };
    const handleUp = () => {
      if (dragThumbRef.current === "min") flushMin();
      else if (dragThumbRef.current === "max") flushMax();
      dragThumbRef.current = null;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  return (
    <S.FilterCard>
      <S.FilterCardTitle>ფასი</S.FilterCardTitle>
      <S.FilterCardBody>
        <S.RangeRow>
          <S.RangeInput
            type="text"
            inputMode="decimal"
            placeholder={String(boundMin)}
            value={minText}
            onChange={(e) => {
              const raw = e.target.value;
              const num = Number(raw);
              // ზედა ზღვარს (ამ shorter-thumb-ის boundMax/maxVal) მაშინვე
              // ვზღუდავთ — მეტი ციფრის აკრეფაც მხოლოდ გააუარესებდა.
              if (raw !== "" && !Number.isNaN(num) && num > boundMax) {
                applyMinText(raw);
              } else {
                setMinText(raw);
                onChange("minPrice", raw || undefined);
              }
            }}
            onBlur={(e) => applyMinText(e.target.value)}
          />
          <span style={{ color: "var(--ref-text-secondary)", fontSize: 12 }}>—</span>
          <S.RangeInput
            type="text"
            inputMode="decimal"
            placeholder={String(boundMax)}
            value={maxText}
            onChange={(e) => {
              const raw = e.target.value;
              const num = Number(raw);
              if (raw !== "" && !Number.isNaN(num) && num > boundMax) {
                applyMaxText(raw);
              } else {
                setMaxText(raw);
                onChange("maxPrice", raw || undefined);
              }
            }}
            onBlur={(e) => applyMaxText(e.target.value)}
          />
        </S.RangeRow>

        <S.SliderWrap ref={wrapRef} onPointerDown={handleTrackPointerDown}>
          <S.SliderTrack />
          <S.SliderRange left={leftPercent} right={rightPercent} />
          <S.SliderInput
            type="range"
            min={boundMin}
            max={boundMax}
            value={minVal}
            onChange={(e) => commitMin(Number(e.target.value))}
            onMouseUp={flushMin}
            onTouchEnd={flushMin}
            onKeyUp={flushMin}
          />
          <S.SliderInput
            type="range"
            min={boundMin}
            max={boundMax}
            value={maxVal}
            onChange={(e) => commitMax(Number(e.target.value))}
            onMouseUp={flushMax}
            onTouchEnd={flushMax}
            onKeyUp={flushMax}
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
    // ფორმა — Enter-ზე ნებისმიერი ველიდან ფილტრი დაუყოვნებლივ გაეშვება
    // (ისევე, როგორც "გაფილტვრა" ღილაკზე დაჭერისას), ხოლო ტოგლის/გასუფთავების
    // ღილაკებს `type="button"` აქვთ, რომ შემთხვევით submit არ გამოიწვიონ.
    <S.FilterForm
      onSubmit={(e) => {
        e.preventDefault();
        handleApply();
      }}
    >
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
                    type="button"
                    active={!draft[attribute.code]}
                    onClick={() => handleChange(attribute.code, undefined)}
                  >
                    ყველა
                  </S.BooleanOption>
                  <S.BooleanOption
                    type="button"
                    active={draft[attribute.code] === "true"}
                    onClick={() => handleChange(attribute.code, "true")}
                  >
                    კი {facet.counts ? `(${facet.counts.true})` : ""}
                  </S.BooleanOption>
                  <S.BooleanOption
                    type="button"
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
        <S.ApplyButton type="submit" pending={isDirty}>
          გაფილტვრა
        </S.ApplyButton>
          <S.ClearFilterButton
            type="button"
            onClick={() => hasDraftFilters && handleClear()}
            title="ფილტრების გასუფთავება"
            aria-label="ფილტრების გასუფთავება"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 4h18l-7 8.5V19l-4 2v-8.5L3 4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M3 21 21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </S.ClearFilterButton>
      </S.ApplyBar>
    </S.FilterForm>
  );
};

export default FilterSidebar;
