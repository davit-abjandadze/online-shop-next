import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SizesAPI } from "@/API_Client";
import { CreateSizeDto, UpdateSizeDto } from "@/API_Client/client/models";
import { Size } from "@/API_Client/types";
import { CloseIcon, EditIcon, GridTwoIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getCategoryName } from "@/utils/getCategoryName";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { SizeFormValues, buildNameTranslationsDto, sizeFormSchema, readNameTranslations } from "./schemas";
import * as S from "./style";

const emptySizeForm: SizeFormValues = {
  translations: { ka: { name: "" }, en: { name: "" }, ru: { name: "" } },
  code: "",
};

/**
 * ზომების ბიბლიოთეკის admin CRUD — ColorsPage.tsx-ის იგივე create/edit/delete
 * + modal პატერნით, hexCode/swatch-ის მაგივრად სავალდებულო `code` ველით. აქ
 * დამატებული ზომები მერე პროდუქტის ვარიანტების ფორმაში (ProductVariantsForm.tsx)
 * ფერთან ერთად გამოიყენება.
 */
export const SizesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [sizes, setSizes] = useState<Size[]>([]);
  const [loadingSizes, setLoadingSizes] = useState<boolean>(true);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Size | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<SizeFormValues>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: emptySizeForm,
  });

  const editForm = useForm<SizeFormValues>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: emptySizeForm,
  });

  const fetchSizes = async () => {
    if (!session?.accessToken) return;
    setLoadingSizes(true);
    try {
      const res = await SizesAPI(router.locale || "ka", session.accessToken).sizesControllerFindAll();
      setSizes((res.data as unknown as Size[]) || []);
    } catch {
      toast.error("ზომების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingSizes(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchSizes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptySizeForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await SizesAPI(router.locale || "ka", session!.accessToken!).sizesControllerCreate({
        translations: buildNameTranslationsDto(data.translations),
        code: data.code.trim(),
      } as unknown as CreateSizeDto);
      toast.success("ზომა წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptySizeForm);
      fetchSizes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ზომის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (size: Size) => {
    setEditingSize(size);
    editForm.reset({
      translations: readNameTranslations(size.translations),
      code: size.code || "",
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingSize || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await SizesAPI(router.locale || "ka", session.accessToken).sizesControllerUpdate(String(editingSize.id), {
        translations: buildNameTranslationsDto(data.translations),
        code: data.code.trim(),
      } as unknown as UpdateSizeDto);
      toast.success("ზომა წარმატებით განახლდა!");
      setEditingSize(null);
      fetchSizes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ზომის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await SizesAPI(router.locale || "ka", session.accessToken).sizesControllerRemove(String(deleteTarget.id));
      toast.success("ზომა წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchSizes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ზომის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderSizeFields = (form: typeof createForm) => (
    <>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>დასახელება (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: Sedan hatchback [3.4m-3.6m] 2S" {...form.register("translations.ka.name")} />
          {form.formState.errors.translations?.ka?.name && (
            <S.FieldError>{form.formState.errors.translations.ka.name.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>დასახელება (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. Sedan hatchback [3.4m-3.6m] 2S" {...form.register("translations.en.name")} />
          {form.formState.errors.translations?.en?.name && (
            <S.FieldError>{form.formState.errors.translations.en.name.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>დასახელება (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Sedan hatchback [3.4m-3.6m] 2S" {...form.register("translations.ru.name")} />
          {form.formState.errors.translations?.ru?.name && (
            <S.FieldError>{form.formState.errors.translations.ru.name.message}</S.FieldError>
          )}
        </S.FormGroup>
      </S.FormRow>
      <S.FormGroup>
        <S.Label>კოდი</S.Label>
        <S.Input type="text" placeholder="მაგ: 2S" {...form.register("code")} />
        {form.formState.errors.code && <S.FieldError>{form.formState.errors.code.message}</S.FieldError>}
      </S.FormGroup>
    </>
  );

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ წინასწარ განსაზღვრული ზომების ბიბლიოთეკა პროდუქტებისთვის"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი ზომა
        </S.ActionButton>
      }
    >
      {loadingSizes ? (
        <ListSkeleton count={3} />
      ) : sizes.length === 0 ? (
        <S.EmptyState>
          <GridTwoIcon size={48} />
          <S.EmptyTitle>ზომები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი ზომა, რომ პროდუქტებზე ვარიანტების მითითება შეძლოთ.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> ზომის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {sizes.map((size) => (
            <S.QuestionCard key={size.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText>{getCategoryName(size, router.locale)}</S.QuestionText>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                    {getCategoryName(size, "ka")} / {getCategoryName(size, "en")} · {size.code}
                  </p>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(size)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(size)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE SIZE MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GridTwoIcon size={18} /> ახალი ზომის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              {renderSizeFields(createForm)}
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={createSubmitting}>
                  {createSubmitting ? "ემატება..." : "შენახვა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT SIZE MODAL ═════════════════════════════════════════════════ */}
      {editingSize && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingSize(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> ზომის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingSize(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              {renderSizeFields(editForm)}
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingSize(null)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="ზომის წაშლა"
        description="ნამდვილად გსურთ ამ ზომის წაშლა? ის ავტომატურად მოიხსნება ყველა პროდუქტის ვარიანტიდან, სადაც მიბმულია. ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default SizesPage;
