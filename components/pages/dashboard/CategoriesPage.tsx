import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoriesAPI } from "@/API_Client";
import { Category } from "@/API_Client/client/models";
import { PaginatedResponseDto } from "@/API_Client/types";
import { CloseIcon, EditIcon, PlusIcon, TagIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingC, setLoadingC] = useState<boolean>(true);

  const [isCatCreateOpen, setIsCatCreateOpen] = useState<boolean>(false);
  const [catCreateSubmitting, setCatCreateSubmitting] = useState<boolean>(false);

  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catEditSubmitting, setCatEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

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
        <S.ModalOverlay onClick={() => setIsCatCreateOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TagIcon size={18} /> ახალი კატეგორიის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCatCreateOpen(false)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatCreateSubmit} noValidate>
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
        <S.ModalOverlay onClick={() => setEditingCat(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> კატეგორიის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingCat(null)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCatEditSubmit} noValidate>
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
