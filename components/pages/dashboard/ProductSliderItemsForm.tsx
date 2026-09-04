import React, { useEffect, useState } from "react";
import Select, { components, OptionProps, StylesConfig } from "react-select";
import { toast } from "react-toastify";
import { ProductSlidersAPI } from "@/API_Client";
import { Product, ProductSliderItem } from "@/API_Client/types";
import { ArrowRightIcon, TrashIcon } from "@/components/ui/RefIcons";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

interface ProductOption {
  value: number;
  label: string;
}

/**
 * `react-select`-ის თემასთან შესაბამისობაში მოყვანილი სტილები — იმეორებს
 * `S.Select`-ის ფერებს (CSS ცვლადებით), რომ dashboard-ის ბნელ/ნათელ თემასთან
 * ერთნაირად გამოიყურებოდეს.
 */
const selectStyles: StylesConfig<ProductOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    borderRadius: 7,
    borderColor: state.isFocused ? "var(--ref-primary)" : "var(--ref-border)",
    background: "var(--ref-bg-elevated)",
    boxShadow: "none",
    fontSize: "12.5px",
    "&:hover": { borderColor: "var(--ref-primary)" },
  }),
  menu: (base) => ({
    ...base,
    background: "var(--ref-bg-elevated)",
    border: "1px solid var(--ref-border)",
    zIndex: 5,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "12.5px",
    background: state.isFocused ? "var(--ref-bg-hover, var(--ref-border))" : "transparent",
    color: "var(--ref-text-primary)",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    background: "var(--ref-border)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--ref-text-primary)",
  }),
  input: (base) => ({ ...base, color: "var(--ref-text-primary)" }),
  singleValue: (base) => ({ ...base, color: "var(--ref-text-primary)" }),
  placeholder: (base) => ({ ...base, color: "var(--ref-text-secondary)" }),
};

/**
 * dropdown-ის ვარიანტში ჩექბოქსის ჩვენება, რომ მონიშვნა/მოხსნა თვალსაჩინო
 * იყოს მენიუს დახურვის გარეშეც (`closeMenuOnSelect={false}`-თან ერთად).
 */
const CheckboxOption = (props: OptionProps<ProductOption, true>) => (
  <components.Option {...props}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="checkbox" checked={props.isSelected} onChange={() => {}} style={{ cursor: "pointer" }} />
      <span>{props.label}</span>
    </div>
  </components.Option>
);

interface ProductSliderItemsFormProps {
  sliderId: string;
  accessToken: string;
  locale: string;
  initialItems: ProductSliderItem[];
  allProducts: Product[];
}

/**
 * ბლოკში ჩასმული პროდუქტების მართვა, სასურველი რიგით — ProductColorsForm.tsx-
 * ის იგივე თვითშენახვადი პატერნით (თავადვე იტვირთება/ინახება, სლაიდერის
 * `id`-ის გარდა კონტექსტი არ სჭირდება). დამატებული პროდუქტები ჩამონათვალშია,
 * ↑/↓ ღილაკებით რიგის შესაცვლელად — შენახვისას მთელი სია ერთიანად იგზავნება
 * `PUT /product-sliders/:id/items`-ზე (ცარიელი მასივი — ყველა პროდუქტის მოხსნა).
 */
export const ProductSliderItemsForm: React.FC<ProductSliderItemsFormProps> = ({
  sliderId,
  accessToken,
  locale,
  initialItems,
  allProducts,
}) => {
  const [orderedIds, setOrderedIds] = useState<number[]>(() =>
    [...initialItems].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.product.id)
  );
  const [addingOptions, setAddingOptions] = useState<ProductOption[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setOrderedIds([...initialItems].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => item.product.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderId]);

  const availableProducts = allProducts.filter((p) => !orderedIds.includes(p.id));
  const availableOptions: ProductOption[] = availableProducts.map((p) => ({
    value: p.id,
    label: getCategoryName(p, locale),
  }));
  const selectedProducts = orderedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleAdd = () => {
    if (addingOptions.length === 0) return;
    setOrderedIds((prev) => [...prev, ...addingOptions.map((o) => o.value)]);
    setAddingOptions([]);
  };

  const handleRemove = (id: number) => setOrderedIds((prev) => prev.filter((pid) => pid !== id));

  const handleMove = (index: number, direction: -1 | 1) => {
    setOrderedIds((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ProductSlidersAPI(locale, accessToken).productSlidersControllerSetItems(sliderId, {
        productIds: new Set(orderedIds),
      });
      toast.success("ბლოკის პროდუქტები წარმატებით შეინახა!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროდუქტების შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <S.FormRow>
        <S.FormGroup style={{ flex: 1 }}>
          <Select<ProductOption, true>
            isMulti
            isSearchable
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{ Option: CheckboxOption }}
            options={availableOptions}
            value={addingOptions}
            onChange={(selected) => setAddingOptions(selected ? [...selected] : [])}
            placeholder="— პროდუქტების ძიება და დამატება —"
            noOptionsMessage={() => "პროდუქტი ვერ მოიძებნა"}
            styles={selectStyles}
          />
        </S.FormGroup>
        <S.ActionButton type="button" variant="secondary" onClick={handleAdd} disabled={addingOptions.length === 0}>
          დამატება{addingOptions.length > 0 ? ` (${addingOptions.length})` : ""}
        </S.ActionButton>
      </S.FormRow>

      {selectedProducts.length === 0 ? (
        <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>
          ბლოკში პროდუქტები არ არის დამატებული — ზემოთ ჩამონათვალიდან აირჩიეთ.
        </p>
      ) : (
        <S.QuestionsList style={{ marginTop: 12 }}>
          {selectedProducts.map((product, index) => (
            <S.QuestionCard key={product.id}>
              <S.CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "13px", color: "var(--ref-text-secondary)", width: 20 }}>{index + 1}.</span>
                  <S.QuestionText>{getCategoryName(product, locale)}</S.QuestionText>
                </div>
                <S.CardActions>
                  <S.ActionButton
                    type="button"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                    title="ზემოთ აწევა"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <ArrowRightIcon size={14} />
                  </S.ActionButton>
                  <S.ActionButton
                    type="button"
                    variant="outline"
                    disabled={index === selectedProducts.length - 1}
                    onClick={() => handleMove(index, 1)}
                    title="ქვემოთ ჩაწევა"
                    style={{ transform: "rotate(90deg)" }}
                  >
                    <ArrowRightIcon size={14} />
                  </S.ActionButton>
                  <S.ActionButton type="button" variant="danger" onClick={() => handleRemove(product.id)}>
                    <TrashIcon size={16} />
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      <S.ModalFooter>
        <S.ActionButton type="button" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "ინახება..." : "პროდუქტების შენახვა"}
        </S.ActionButton>
      </S.ModalFooter>
    </div>
  );
};

export default ProductSliderItemsForm;
