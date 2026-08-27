import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ProductAttributeValueItemDto } from "@/API_Client/client/models";
import { CategoryAttribute, ProductAttributeValue } from "@/API_Client/types";
import { getCategoryName } from "@/utils/getCategoryName";
import * as S from "./style";

// AttributeOption-ს `nameKa`/`nameEn` არა, `valueKa`/`valueEn` აქვს —
// getCategoryName-ის იმავე fallback-ლოგიკის მცირე ვარიაცია.
const getOptionValue = (opt: { valueKa: string; valueEn: string }, locale?: string) =>
  locale === "en" ? opt.valueEn || opt.valueKa : opt.valueKa || opt.valueEn;

interface DynamicAttributeFormProps {
  categoryAttrs: CategoryAttribute[];
  values: ProductAttributeValue[];
  saving: boolean;
  onSave: (items: ProductAttributeValueItemDto[]) => void;
}

type FieldState = {
  attributeOptionId?: string;
  attributeOptionIds?: string[];
  valueText?: string;
  valueNumber?: string;
  valueBoolean?: boolean;
};

/**
 * კატეგორიის attribute set-ის (`CategoryAttribute[]`, მემკვიდრეობის
 * ჩათვლით) მიხედვით დინამიურად რენდერავს ველებს, ტიპის მიხედვით
 * (`Attribute.type`) — `select`/`multi_select`/`number`/`range`/`text`/
 * `boolean`. საწყისი მნიშვნელობები `ProductAttributeValue[]`-იდან
 * (`GET /products/:id/attribute-values`) ივსება.
 */
export const DynamicAttributeForm: React.FC<DynamicAttributeFormProps> = ({
  categoryAttrs,
  values,
  saving,
  onSave,
}) => {
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, FieldState>>({});

  useEffect(() => {
    const next: Record<string, FieldState> = {};
    for (const ca of categoryAttrs) {
      const type = ca.attribute.type;
      if (type === "multi_select") {
        next[ca.attributeId] = {
          attributeOptionIds: values.filter((v) => v.attributeId === ca.attributeId).map((v) => v.attributeOptionId!),
        };
        continue;
      }
      const existing = values.find((v) => v.attributeId === ca.attributeId);
      if (!existing) {
        next[ca.attributeId] = {};
        continue;
      }
      next[ca.attributeId] = {
        attributeOptionId: existing.attributeOptionId || undefined,
        valueText: existing.valueText ?? undefined,
        valueNumber: existing.valueNumber != null ? String(existing.valueNumber) : undefined,
        valueBoolean: existing.valueBoolean ?? undefined,
      };
    }
    setFields(next);
  }, [categoryAttrs, values]);

  const isRequired = (ca: CategoryAttribute) => ca.isRequiredOverride ?? ca.attribute.isRequired;

  const updateField = (attributeId: string, patch: Partial<FieldState>) =>
    setFields((prev) => ({ ...prev, [attributeId]: { ...prev[attributeId], ...patch } }));

  const toggleMultiOption = (attributeId: string, optionId: string) => {
    const current = fields[attributeId]?.attributeOptionIds || [];
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    updateField(attributeId, { attributeOptionIds: next });
  };

  const handleSave = () => {
    const items: ProductAttributeValueItemDto[] = [];
    for (const ca of categoryAttrs) {
      const state = fields[ca.attributeId];
      if (!state) continue;
      const type = ca.attribute.type;
      if (type === "select") {
        if (state.attributeOptionId) items.push({ attributeId: ca.attributeId, attributeOptionId: state.attributeOptionId });
      } else if (type === "multi_select") {
        if (state.attributeOptionIds && state.attributeOptionIds.length > 0) {
          items.push({ attributeId: ca.attributeId, attributeOptionIds: state.attributeOptionIds });
        }
      } else if (type === "number" || type === "range") {
        if (state.valueNumber !== undefined && state.valueNumber !== "") {
          items.push({ attributeId: ca.attributeId, valueNumber: Number(state.valueNumber) });
        }
      } else if (type === "text") {
        if (state.valueText) items.push({ attributeId: ca.attributeId, valueText: state.valueText });
      } else if (type === "boolean") {
        if (state.valueBoolean !== undefined) items.push({ attributeId: ca.attributeId, valueBoolean: state.valueBoolean });
      }
    }
    onSave(items);
  };

  if (categoryAttrs.length === 0) {
    return (
      <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>
        ამ პროდუქტის კატეგორიაზე მახასიათებელი არ არის მიმაგრებული.
      </p>
    );
  }

  return (
    <div>
      {categoryAttrs.map((ca) => {
        const { attribute } = ca;
        const state = fields[attribute.id] || {};
        const label = `${getCategoryName(attribute, router.locale)}${attribute.unit ? ` (${attribute.unit})` : ""}${
          isRequired(ca) ? " *" : ""
        }`;

        return (
          <S.FormGroup key={attribute.id}>
            <S.Label>{label}</S.Label>
            {attribute.type === "select" && (
              <S.Select
                value={state.attributeOptionId || ""}
                onChange={(e) => updateField(attribute.id, { attributeOptionId: e.target.value || undefined })}
              >
                <option value="">— არჩევა —</option>
                {(attribute.options || []).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {getOptionValue(opt, router.locale)}
                  </option>
                ))}
              </S.Select>
            )}

            {attribute.type === "multi_select" && (
              <S.CategoryCheckboxGrid>
                {(attribute.options || []).map((opt) => (
                  <S.CategoryCheckboxItem key={opt.id} checked={(state.attributeOptionIds || []).includes(opt.id)}>
                    <input
                      type="checkbox"
                      checked={(state.attributeOptionIds || []).includes(opt.id)}
                      onChange={() => toggleMultiOption(attribute.id, opt.id)}
                    />{" "}
                    {getOptionValue(opt, router.locale)}
                  </S.CategoryCheckboxItem>
                ))}
              </S.CategoryCheckboxGrid>
            )}

            {(attribute.type === "number" || attribute.type === "range") && (
              <S.Input
                type="text"
                inputMode="decimal"
                placeholder="მაგ: 60"
                value={state.valueNumber ?? ""}
                onChange={(e) => updateField(attribute.id, { valueNumber: e.target.value })}
              />
            )}

            {attribute.type === "text" && (
              <S.Input
                type="text"
                value={state.valueText ?? ""}
                onChange={(e) => updateField(attribute.id, { valueText: e.target.value })}
              />
            )}

            {attribute.type === "boolean" && (
              <S.CategoryCheckboxItem checked={!!state.valueBoolean}>
                <input
                  type="checkbox"
                  checked={!!state.valueBoolean}
                  onChange={(e) => updateField(attribute.id, { valueBoolean: e.target.checked })}
                />{" "}
                კი
              </S.CategoryCheckboxItem>
            )}
          </S.FormGroup>
        );
      })}
      <S.ModalFooter>
        <S.ActionButton type="button" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? "ინახება..." : "მახასიათებლების შენახვა"}
        </S.ActionButton>
      </S.ModalFooter>
    </div>
  );
};

export default DynamicAttributeForm;
