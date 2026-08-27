import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AttributesAPI } from "@/API_Client";
import { Attribute, AttributeOption, AttributeType, PaginatedResponseDto } from "@/API_Client/types";
import { CloseIcon, EditIcon, PlusIcon, CheckSquareIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import {
  AttributeFormValues,
  attributeFormSchema,
  AttributeOptionFormValues,
  attributeOptionFormSchema,
} from "./schemas";
import * as S from "./style";

const emptyAttributeForm: AttributeFormValues = {
  nameKa: "",
  nameEn: "",
  code: "",
  type: "select",
  unit: "",
  isFilterable: true,
  isRequired: false,
  sortOrder: "0",
};

const emptyOptionForm: AttributeOptionFormValues = { valueKa: "", valueEn: "", code: "", sortOrder: "0" };

const TYPE_LABELS: Record<AttributeType, string> = {
  select: "ერთი მნიშვნელობა (select)",
  multi_select: "რამდენიმე მნიშვნელობა (multi-select)",
  number: "რიცხვი",
  text: "ტექსტი",
  boolean: "კი/არა",
  range: "დიაპაზონი",
};

const hasOptions = (type: AttributeType) => type === "select" || type === "multi_select";

export const AttributesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Attribute | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const [editingOption, setEditingOption] = useState<AttributeOption | null>(null);
  const [optionSubmitting, setOptionSubmitting] = useState<boolean>(false);
  const [deleteOptionTarget, setDeleteOptionTarget] = useState<AttributeOption | null>(null);

  const createForm = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: emptyAttributeForm,
  });

  const editForm = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: emptyAttributeForm,
  });

  const optionForm = useForm<AttributeOptionFormValues>({
    resolver: zodResolver(attributeOptionFormSchema),
    defaultValues: emptyOptionForm,
  });

  const fetchAttributes = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerFindAll(1, 100);
      const data = res.data as unknown as PaginatedResponseDto<Attribute>;
      setAttributes(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("მახასიათებლების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchAttributes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const toDto = (data: AttributeFormValues) => ({
    nameKa: data.nameKa.trim(),
    nameEn: data.nameEn.trim(),
    code: data.code.trim(),
    type: data.type,
    unit: data.unit?.trim() || undefined,
    isFilterable: data.isFilterable,
    isRequired: data.isRequired,
    sortOrder: data.sortOrder === "" ? undefined : Number(data.sortOrder),
  });

  const handleOpenCreate = () => {
    createForm.reset(emptyAttributeForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await AttributesAPI(router.locale || "ka", session!.accessToken!).attributeControllerCreate(toDto(data));
      toast.success("მახასიათებელი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyAttributeForm);
      fetchAttributes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მახასიათებლის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  // რედაქტირების მოდალის გახსნისას options-ის სანახავად სვეჟი (options-ითურთ)
  // ჩანაწერს ვიღებთ — სიის endpoint-ის row-ს options შესაძლოა არ მოსდევდეს.
  const handleOpenEdit = async (attr: Attribute) => {
    if (!session?.accessToken) return;
    try {
      const res = await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerFindOne(
        String(attr.id)
      );
      const full = res.data as unknown as Attribute;
      setEditingAttr(full);
      editForm.reset({
        nameKa: full.nameKa,
        nameEn: full.nameEn,
        code: full.code,
        type: full.type,
        unit: full.unit || "",
        isFilterable: full.isFilterable,
        isRequired: full.isRequired,
        sortOrder: String(full.sortOrder ?? 0),
      });
      optionForm.reset(emptyOptionForm);
      setEditingOption(null);
    } catch {
      toast.error("მახასიათებლის ჩატვირთვა ვერ მოხერხდა");
    }
  };

  const refetchEditingAttr = async () => {
    if (!editingAttr || !session?.accessToken) return;
    const res = await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerFindOne(
      String(editingAttr.id)
    );
    setEditingAttr(res.data as unknown as Attribute);
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingAttr || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerUpdate(
        String(editingAttr.id),
        toDto(data)
      );
      toast.success("მახასიათებელი წარმატებით განახლდა!");
      setEditingAttr(null);
      fetchAttributes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მახასიათებლის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerRemove(String(deleteTarget.id));
      toast.success("მახასიათებელი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchAttributes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მახასიათებლის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ─── Options (მხოლოდ select/multi_select) ─────────────────────────────────
  const handleOpenAddOption = () => {
    optionForm.reset(emptyOptionForm);
    setEditingOption(null);
  };

  const handleOpenEditOption = (opt: AttributeOption) => {
    setEditingOption(opt);
    optionForm.reset({ valueKa: opt.valueKa, valueEn: opt.valueEn, code: opt.code, sortOrder: String(opt.sortOrder ?? 0) });
  };

  const handleOptionSubmit = optionForm.handleSubmit(async (data) => {
    if (!editingAttr || !session?.accessToken) return;
    setOptionSubmitting(true);
    const dto = {
      valueKa: data.valueKa.trim(),
      valueEn: data.valueEn.trim(),
      code: data.code.trim(),
      sortOrder: data.sortOrder === "" ? undefined : Number(data.sortOrder),
    };
    try {
      const api = AttributesAPI(router.locale || "ka", session.accessToken);
      if (editingOption) {
        await api.attributeControllerUpdateOption(String(editingAttr.id), String(editingOption.id), dto);
        toast.success("Option წარმატებით განახლდა!");
      } else {
        await api.attributeControllerAddOption(String(editingAttr.id), dto);
        toast.success("Option წარმატებით დაემატა!");
      }
      optionForm.reset(emptyOptionForm);
      setEditingOption(null);
      await refetchEditingAttr();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Option-ის შენახვა ვერ მოხერხდა");
    } finally {
      setOptionSubmitting(false);
    }
  });

  const handleConfirmDeleteOption = async () => {
    if (!editingAttr || !deleteOptionTarget || !session?.accessToken) return;
    try {
      await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerRemoveOption(
        String(editingAttr.id),
        String(deleteOptionTarget.id)
      );
      toast.success("Option წარმატებით წაიშალა!");
      setDeleteOptionTarget(null);
      await refetchEditingAttr();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Option-ის წაშლა ვერ მოხერხდა");
    }
  };

  // ─── საერთო ფორმის რენდერი (create/edit) ───────────────────────────────────
  const renderForm = (
    form: typeof createForm | typeof editForm,
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>,
    submitting: boolean,
    submitLabel: string
  ) => (
    <form onSubmit={onSubmit} noValidate>
      <S.FormGroup>
        <S.Label>სახელი (ქართულად)</S.Label>
        <S.Input type="text" placeholder="მაგ: ბრენდი" {...form.register("nameKa")} />
        {form.formState.errors.nameKa && <S.FieldError>{form.formState.errors.nameKa.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>სახელი (ინგლისურად)</S.Label>
        <S.Input type="text" placeholder="e.g. Brand" {...form.register("nameEn")} />
        {form.formState.errors.nameEn && <S.FieldError>{form.formState.errors.nameEn.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>Code</S.Label>
        <S.Input type="text" placeholder="მაგ: brand" {...form.register("code")} />
        {form.formState.errors.code && <S.FieldError>{form.formState.errors.code.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>ტიპი</S.Label>
        <S.Select {...form.register("type")}>
          {(Object.keys(TYPE_LABELS) as AttributeType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </S.Select>
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>ერთეული (არასავალდებულო, მაგ: Ah, V, mm)</S.Label>
        <S.Input type="text" placeholder="მაგ: Ah" {...form.register("unit")} />
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>რიგითობა (sortOrder)</S.Label>
        <S.Input type="text" inputMode="numeric" placeholder="0" {...form.register("sortOrder")} />
        {form.formState.errors.sortOrder && <S.FieldError>{form.formState.errors.sortOrder.message}</S.FieldError>}
      </S.FormGroup>
      <S.CategoryCheckboxItem checked={form.watch("isFilterable")}>
        <input type="checkbox" {...form.register("isFilterable")} /> გამოსახილვადია (ფილტრში ჩაერთვება)
      </S.CategoryCheckboxItem>
      <S.CategoryCheckboxItem checked={form.watch("isRequired")}>
        <input type="checkbox" {...form.register("isRequired")} /> სავალდებულოა
      </S.CategoryCheckboxItem>
      <S.ModalFooter>
        <S.ActionButton type="submit" variant="primary" disabled={submitting}>
          {submitting ? "ინახება..." : submitLabel}
        </S.ActionButton>
      </S.ModalFooter>
    </form>
  );

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ პროდუქტების დინამიური მახასიათებლები (ბრენდი, ზომა, ტევადობა და სხვ.)"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი მახასიათებელი
        </S.ActionButton>
      }
    >
      {loading ? (
        <ListSkeleton count={3} />
      ) : attributes.length === 0 ? (
        <S.EmptyState>
          <CheckSquareIcon size={48} />
          <S.EmptyTitle>მახასიათებლები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი მახასიათებელი (მაგ. ბრენდი, ტევადობა) კატეგორიებზე მისამაგრებლად.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> მახასიათებლის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {attributes.map((attr) => (
            <S.QuestionCard key={attr.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckSquareIcon size={18} /> {attr.nameKa}
                  </S.QuestionText>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--ref-text-secondary)" }}>
                    {attr.code} {attr.unit && `· ${attr.unit}`}
                  </p>
                  <S.BadgeGroup style={{ marginTop: "8px" }}>
                    <S.Badge variant="date">{TYPE_LABELS[attr.type]}</S.Badge>
                    <S.Badge variant={attr.isFilterable ? "active" : "inactive"}>
                      {attr.isFilterable ? "ფილტრში" : "ფილტრის გარეშე"}
                    </S.Badge>
                    {attr.isRequired && <S.Badge variant="pinned">სავალდებულო</S.Badge>}
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(attr)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(attr)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay onClick={() => setIsCreateOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquareIcon size={18} /> ახალი მახასიათებლის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            {renderForm(createForm, handleCreateSubmit, createSubmitting, "შენახვა")}
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT MODAL (+ OPTIONS) ═════════════════════════════════════ */}
      {editingAttr && (
        <S.ModalOverlay onClick={() => setEditingAttr(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> მახასიათებლის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingAttr(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            {renderForm(editForm, handleEditSubmit, editSubmitting, "ცვლილებების შენახვა")}

            {hasOptions(editingAttr.type) && (
              <div style={{ marginTop: "20px", borderTop: "1px solid var(--ref-border)", paddingTop: "16px" }}>
                <S.Label>მნიშვნელობები (options)</S.Label>
                <S.ImageList style={{ marginTop: "10px" }}>
                  {(editingAttr.options || []).map((opt) => (
                    <S.ImageRow key={opt.id}>
                      <span style={{ flex: 1, fontSize: "14px" }}>
                        {opt.valueKa} <span style={{ color: "var(--ref-text-secondary)" }}>({opt.code})</span>
                      </span>
                      <S.ActionButton type="button" variant="outline" onClick={() => handleOpenEditOption(opt)}>
                        <EditIcon size={14} />
                      </S.ActionButton>
                      <S.ActionButton type="button" variant="danger" onClick={() => setDeleteOptionTarget(opt)}>
                        <TrashIcon size={14} />
                      </S.ActionButton>
                    </S.ImageRow>
                  ))}
                </S.ImageList>

                <form onSubmit={handleOptionSubmit} noValidate style={{ marginTop: "12px" }}>
                  <S.ImageRow>
                    <S.Input placeholder="მნიშვნელობა (ქართულად)" {...optionForm.register("valueKa")} />
                    <S.Input placeholder="Value (English)" {...optionForm.register("valueEn")} />
                    <S.Input placeholder="code" {...optionForm.register("code")} />
                    <S.ActionButton type="submit" variant="secondary" disabled={optionSubmitting}>
                      {editingOption ? "შენახვა" : <PlusIcon size={14} />}
                    </S.ActionButton>
                    {editingOption && (
                      <S.ActionButton type="button" variant="outline" onClick={handleOpenAddOption}>
                        <CloseIcon size={14} />
                      </S.ActionButton>
                    )}
                  </S.ImageRow>
                  {(optionForm.formState.errors.valueKa ||
                    optionForm.formState.errors.valueEn ||
                    optionForm.formState.errors.code) && (
                    <S.FieldError>
                      {optionForm.formState.errors.valueKa?.message ||
                        optionForm.formState.errors.valueEn?.message ||
                        optionForm.formState.errors.code?.message}
                    </S.FieldError>
                  )}
                </form>
              </div>
            )}
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="მახასიათებლის წაშლა"
        description="ნამდვილად გსურთ ამ მახასიათებლის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteOptionTarget}
        title="Option-ის წაშლა"
        description="ნამდვილად გსურთ ამ option-ის წაშლა?"
        onConfirm={handleConfirmDeleteOption}
        onCancel={() => setDeleteOptionTarget(null)}
      />
    </DashboardLayout>
  );
};

export default AttributesPage;
