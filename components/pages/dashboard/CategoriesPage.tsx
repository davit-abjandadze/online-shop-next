import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AttributesAPI, CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/client/models";
import { Attribute, CategoryAttribute, PaginatedResponseDto } from "@/API_Client/types";
import { CheckSquareIcon, CloseIcon, EditIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getCategoryName } from "@/utils/getCategoryName";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { CategoryFormValues, categoryFormSchema } from "./schemas";
import * as S from "./style";

const emptyCategoryForm: CategoryFormValues = { nameKa: "", nameEn: "", slug: "", parentId: "", isActive: true };

export const CategoriesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingC, setLoadingC] = useState<boolean>(true);

  const [isCatCreateOpen, setIsCatCreateOpen] = useState<boolean>(false);
  const [catCreateSubmitting, setCatCreateSubmitting] = useState<boolean>(false);

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catEditSubmitting, setCatEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // ─── Attribute-ების მიბმა (category ↔ attribute) ───────────────────────────
  const [managingCat, setManagingCat] = useState<Category | null>(null);
  const [categoryAttrs, setCategoryAttrs] = useState<CategoryAttribute[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
  const [attrsLoading, setAttrsLoading] = useState<boolean>(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [attrMutating, setAttrMutating] = useState<boolean>(false);

  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryForm,
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryForm,
  });

  const fetchCategories = async () => {
    if (!session?.accessToken) return;
    setLoadingC(true);
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll(1, 100);
      const data = res.data as unknown as PaginatedResponseDto<Category>;
      setCategories(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("კატეგორიების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingC(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptyCategoryForm);
    setIsCatCreateOpen(true);
  };

  const handleCatCreateSubmit = createForm.handleSubmit(async (data) => {
    setCatCreateSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session!.accessToken!).categoryControllerCreate({
        nameKa: data.nameKa.trim(),
        nameEn: data.nameEn.trim(),
        slug: data.slug.trim(),
        parentId: data.parentId || undefined,
        isActive: data.isActive,
      });
      toast.success("კატეგორია წარმატებით დაემატა!");
      setIsCatCreateOpen(false);
      createForm.reset(emptyCategoryForm);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის დამატება ვერ მოხერხდა");
    } finally {
      setCatCreateSubmitting(false);
    }
  });

  const handleOpenEditCat = (cat: Category) => {
    setEditingCat(cat);
    editForm.reset({
      nameKa: cat.nameKa,
      nameEn: cat.nameEn,
      slug: cat.slug,
      parentId: cat.parent?.id || "",
      isActive: cat.isActive,
    });
  };

  const handleCatEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingCat || !session?.accessToken) return;
    setCatEditSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerUpdate(
        String(editingCat.id),
        {
          nameKa: data.nameKa.trim(),
          nameEn: data.nameEn.trim(),
          slug: data.slug.trim(),
          parentId: data.parentId || undefined,
          isActive: data.isActive,
        }
      );
      toast.success("კატეგორია წარმატებით განახლდა!");
      setEditingCat(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის განახლება ვერ მოხერხდა");
    } finally {
      setCatEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await CategoriesAPI(router.locale || "ka", session?.accessToken || "").categoryControllerRemove(String(deleteTarget.id));
      toast.success("კატეგორია წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კატეგორიის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ─── Attribute-ების მიბმა (category ↔ attribute) ───────────────────────────
  const fetchCategoryAttrs = async (categoryId: string) => {
    if (!session?.accessToken) return;
    setAttrsLoading(true);
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAttributes(
        categoryId
      );
      setCategoryAttrs((res.data as unknown as CategoryAttribute[]) || []);
    } catch {
      toast.error("მახასიათებლების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setAttrsLoading(false);
    }
  };

  const handleOpenManageAttributes = async (cat: Category) => {
    setManagingCat(cat);
    setSelectedAttributeId("");
    fetchCategoryAttrs(String(cat.id));
    if (allAttributes.length === 0 && session?.accessToken) {
      try {
        const res = await AttributesAPI(router.locale || "ka", session.accessToken).attributeControllerFindAll(1, 100);
        const data = res.data as unknown as PaginatedResponseDto<Attribute>;
        setAllAttributes(Array.isArray(data?.data) ? data.data : []);
      } catch {
        toast.error("მახასიათებლების სიის ჩატვირთვა ვერ მოხერხდა");
      }
    }
  };

  const handleAddAttribute = async () => {
    if (!managingCat || !selectedAttributeId || !session?.accessToken) return;
    setAttrMutating(true);
    try {
      await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerAddAttribute(
        String(managingCat.id),
        { attributeId: selectedAttributeId }
      );
      toast.success("მახასიათებელი წარმატებით მიემატა კატეგორიას!");
      setSelectedAttributeId("");
      fetchCategoryAttrs(String(managingCat.id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მახასიათებლის მიმაგრება ვერ მოხერხდა");
    } finally {
      setAttrMutating(false);
    }
  };

  const handleRemoveAttribute = async (attributeId: string) => {
    if (!managingCat || !session?.accessToken) return;
    setAttrMutating(true);
    try {
      await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerRemoveAttribute(
        String(managingCat.id),
        attributeId
      );
      toast.success("მახასიათებელი წარმატებით მოხსნილია!");
      fetchCategoryAttrs(String(managingCat.id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მახასიათებლის მოხსნა ვერ მოხერხდა");
    } finally {
      setAttrMutating(false);
    }
  };

  // მიბმული attribute-ების id-ები — dropdown-ში მხოლოდ ჯერ არ მიბმულები ჩნდება.
  const linkedAttributeIds = new Set(categoryAttrs.map((ca) => ca.attributeId));
  const availableToAdd = allAttributes.filter((a) => !linkedAttributeIds.has(a.id));

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ რეფერენდუმის კითხვები, კატეგორიები და სავარაუდო პასუხები"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი კატეგორია
        </S.ActionButton>
      }
    >
      {loadingC ? (
        <ListSkeleton count={3} />
      ) : categories.length === 0 ? (
        <S.EmptyState>
          <TagIcon size={48} />
          <S.EmptyTitle>კატეგორიები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი კატეგორია კითხვების გასაჯგუფებლად.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> კატეგორიის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {categories.map((cat) => (
            <S.QuestionCard key={cat.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TagIcon size={18} /> {getCategoryName(cat, router.locale)}
                  </S.QuestionText>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--ref-text-secondary)" }}>
                    /{cat.slug}
                    {cat.parent && ` · მშობელი: ${getCategoryName(cat.parent, router.locale)}`}
                  </p>
                  <S.BadgeGroup style={{ marginTop: "8px" }}>
                    <S.Badge variant={cat.isActive ? "active" : "inactive"}>
                      {cat.isActive ? "აქტიური" : "არააქტიური"}
                    </S.Badge>
                    <S.Badge variant="date">{cat.products?.length || 0} პროდუქტი</S.Badge>
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="secondary" onClick={() => handleOpenManageAttributes(cat)}>
                    <CheckSquareIcon size={16} /> მახასიათებლები
                  </S.ActionButton>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEditCat(cat)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(cat)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE CATEGORY MODAL ═══════════════════════════════════════════════ */}
      {isCatCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCatCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TagIcon size={18} /> ახალი კატეგორიის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCatCreateOpen(false)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatCreateSubmit} noValidate>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>სახელი (ქართულად)</S.Label>
                  <S.Input type="text" placeholder="მაგ: ელექტრონიკა" {...createForm.register("nameKa")} />
                  {createForm.formState.errors.nameKa && <S.FieldError>{createForm.formState.errors.nameKa.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>სახელი (ინგლისურად)</S.Label>
                  <S.Input type="text" placeholder="e.g. Electronics" {...createForm.register("nameEn")} />
                  {createForm.formState.errors.nameEn && <S.FieldError>{createForm.formState.errors.nameEn.message}</S.FieldError>}
                </S.FormGroup>
              </S.FormRow>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>Slug</S.Label>
                  <S.Input type="text" placeholder="მაგ: electronics" {...createForm.register("slug")} />
                  {createForm.formState.errors.slug && <S.FieldError>{createForm.formState.errors.slug.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>მშობელი კატეგორია (არასავალდებულო)</S.Label>
                  <S.Select {...createForm.register("parentId")}>
                    <option value="">— root კატეგორია —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getCategoryName(cat, router.locale)}
                      </option>
                    ))}
                  </S.Select>
                </S.FormGroup>
              </S.FormRow>
              <S.CategoryCheckboxItem checked={createForm.watch("isActive")}>
                <input type="checkbox" {...createForm.register("isActive")} /> აქტიურია
              </S.CategoryCheckboxItem>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCatCreateOpen(false)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catCreateSubmitting}>{catCreateSubmitting ? "ემატება..." : "შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT CATEGORY MODAL ═════════════════════════════════════════════════ */}
      {editingCat && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingCat(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> კატეგორიის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingCat(null)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatEditSubmit} noValidate>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>სახელი (ქართულად)</S.Label>
                  <S.Input type="text" {...editForm.register("nameKa")} />
                  {editForm.formState.errors.nameKa && <S.FieldError>{editForm.formState.errors.nameKa.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>სახელი (ინგლისურად)</S.Label>
                  <S.Input type="text" {...editForm.register("nameEn")} />
                  {editForm.formState.errors.nameEn && <S.FieldError>{editForm.formState.errors.nameEn.message}</S.FieldError>}
                </S.FormGroup>
              </S.FormRow>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>Slug</S.Label>
                  <S.Input type="text" {...editForm.register("slug")} />
                  {editForm.formState.errors.slug && <S.FieldError>{editForm.formState.errors.slug.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>მშობელი კატეგორია (არასავალდებულო)</S.Label>
                  <S.Select {...editForm.register("parentId")}>
                    <option value="">— root კატეგორია —</option>
                    {categories
                      .filter((cat) => cat.id !== editingCat?.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {getCategoryName(cat, router.locale)}
                        </option>
                      ))}
                  </S.Select>
                </S.FormGroup>
              </S.FormRow>
              <S.CategoryCheckboxItem checked={editForm.watch("isActive")}>
                <input type="checkbox" {...editForm.register("isActive")} /> აქტიურია
              </S.CategoryCheckboxItem>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingCat(null)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={catEditSubmitting}>{catEditSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ MANAGE ATTRIBUTES MODAL ═══════════════════════════════════════ */}
      {managingCat && (
        <S.ModalOverlay {...getOverlayProps(() => setManagingCat(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckSquareIcon size={18} /> {getCategoryName(managingCat, router.locale)} — მახასიათებლები
              </S.ModalTitle>
              <S.CloseButton onClick={() => setManagingCat(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>

            {attrsLoading ? (
              <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
            ) : categoryAttrs.length === 0 ? (
              <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)" }}>
                ამ კატეგორიაზე მახასიათებელი არ არის მიმაგრებული.
              </p>
            ) : (
              <S.ImageList>
                {categoryAttrs.map((ca) => {
                  const isOwn = ca.categoryId === String(managingCat.id);
                  return (
                    <S.ImageRow key={ca.id}>
                      <span style={{ flex: 1, fontSize: "14px" }}>
                        {getCategoryName(ca.attribute, router.locale)}{" "}
                        <span style={{ color: "var(--ref-text-secondary)" }}>({ca.attribute.code})</span>
                        {!isOwn && (
                          <S.Badge variant="date" style={{ marginLeft: "8px" }}>
                            მემკვიდრეობით
                          </S.Badge>
                        )}
                      </span>
                      {isOwn ? (
                        <S.ActionButton
                          type="button"
                          variant="danger"
                          disabled={attrMutating}
                          onClick={() => handleRemoveAttribute(ca.attributeId)}
                        >
                          <TrashIcon size={14} /> მოხსნა
                        </S.ActionButton>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--ref-text-secondary)" }}>
                          მოეხსენოს მშობელი კატეგორიიდან
                        </span>
                      )}
                    </S.ImageRow>
                  );
                })}
              </S.ImageList>
            )}

            <S.FormGroup style={{ marginTop: "16px" }}>
              <S.Label>მახასიათებლის დამატება</S.Label>
              <S.ImageRow>
                <S.Select value={selectedAttributeId} onChange={(e) => setSelectedAttributeId(e.target.value)}>
                  <option value="">— აირჩიეთ მახასიათებელი —</option>
                  {availableToAdd.map((a) => (
                    <option key={a.id} value={a.id}>
                      {getCategoryName(a, router.locale)} ({a.code})
                    </option>
                  ))}
                </S.Select>
                <S.ActionButton
                  type="button"
                  variant="primary"
                  disabled={!selectedAttributeId || attrMutating}
                  onClick={handleAddAttribute}
                >
                  <PlusIcon size={14} /> დამატება
                </S.ActionButton>
              </S.ImageRow>
              {availableToAdd.length === 0 && allAttributes.length > 0 && (
                <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                  ყველა არსებული მახასიათებელი უკვე მიმაგრებულია.
                </p>
              )}
              {allAttributes.length === 0 && (
                <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                  ჯერ არ არსებობს არცერთი მახასიათებელი — შექმენით &quot;მახასიათებლები&quot; გვერდზე.
                </p>
              )}
            </S.FormGroup>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="კატეგორიის წაშლა"
        description="ნამდვილად გსურთ ამ კატეგორიის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default CategoriesPage;
