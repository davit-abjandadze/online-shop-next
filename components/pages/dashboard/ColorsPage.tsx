import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorsAPI } from "@/API_Client";
import { CreateColorDto, UpdateColorDto } from "@/API_Client/client/models";
import { Color } from "@/API_Client/types";
import { CloseIcon, EditIcon, PaletteIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getCategoryName } from "@/utils/getCategoryName";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { ColorFormValues, buildNameTranslationsDto, colorFormSchema, readNameTranslations } from "./schemas";
import * as S from "./style";

const emptyColorForm: ColorFormValues = {
  translations: { ka: { name: "" }, en: { name: "" }, ru: { name: "" } },
  hexCode: "",
};

/**
 * ფერების ბიბლიოთეკის admin CRUD — BranchesPage.tsx-ის იგივე
 * create/edit/delete + modal პატერნით, უბრალოდ workingHours-ის მსგავსი
 * ჩადგმული ველების გარეშე. აქ დამატებული ფერები მერე პროდუქტის ფორმაში
 * (ProductColorsForm.tsx) გამოიყენება stock-ის მისანიჭებლად.
 */
export const ColorsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [colors, setColors] = useState<Color[]>([]);
  const [loadingColors, setLoadingColors] = useState<boolean>(true);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Color | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: emptyColorForm,
  });

  const editForm = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: emptyColorForm,
  });

  const fetchColors = async () => {
    if (!session?.accessToken) return;
    setLoadingColors(true);
    try {
      const res = await ColorsAPI(router.locale || "ka", session.accessToken).colorsControllerFindAll();
      setColors((res.data as unknown as Color[]) || []);
    } catch {
      toast.error("ფერების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingColors(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptyColorForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await ColorsAPI(router.locale || "ka", session!.accessToken!).colorsControllerCreate({
        translations: buildNameTranslationsDto(data.translations),
        hexCode: data.hexCode?.trim() || undefined,
        // TODO: generated CreateColorDto not yet regenerated for translations — remove cast after yarn generate:api
      } as unknown as CreateColorDto);
      toast.success("ფერი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyColorForm);
      fetchColors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფერის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (color: Color) => {
    setEditingColor(color);
    editForm.reset({
      translations: readNameTranslations(color.translations),
      hexCode: color.hexCode || "",
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingColor || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await ColorsAPI(router.locale || "ka", session.accessToken).colorsControllerUpdate(String(editingColor.id), {
        translations: buildNameTranslationsDto(data.translations),
        hexCode: data.hexCode?.trim() || undefined,
        // TODO: generated UpdateColorDto not yet regenerated for translations — remove cast after yarn generate:api
      } as unknown as UpdateColorDto);
      toast.success("ფერი წარმატებით განახლდა!");
      setEditingColor(null);
      fetchColors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფერის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await ColorsAPI(router.locale || "ka", session.accessToken).colorsControllerRemove(String(deleteTarget.id));
      toast.success("ფერი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchColors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფერის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderColorFields = (form: typeof createForm) => (
    <>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>დასახელება (ქართულად)</S.Label>
          <S.Input type="text" placeholder="მაგ: წითელი" {...form.register("translations.ka.name")} />
          {form.formState.errors.translations?.ka?.name && (
            <S.FieldError>{form.formState.errors.translations.ka.name.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>დასახელება (ინგლისურად)</S.Label>
          <S.Input type="text" placeholder="e.g. Red" {...form.register("translations.en.name")} />
          {form.formState.errors.translations?.en?.name && (
            <S.FieldError>{form.formState.errors.translations.en.name.message}</S.FieldError>
          )}
        </S.FormGroup>
        <S.FormGroup>
          <S.Label>დასახელება (რუსულად)</S.Label>
          <S.Input type="text" placeholder="напр. Красный" {...form.register("translations.ru.name")} />
          {form.formState.errors.translations?.ru?.name && (
            <S.FieldError>{form.formState.errors.translations.ru.name.message}</S.FieldError>
          )}
        </S.FormGroup>
      </S.FormRow>
      <S.FormGroup>
        <S.Label>HEX კოდი (არასავალდებულო)</S.Label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <S.Input type="text" placeholder="#FF0000" {...form.register("hexCode")} />
          {form.watch("hexCode") && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.watch("hexCode") || "") && (
            <S.ColorSwatch type="button" style={{ backgroundColor: form.watch("hexCode"), cursor: "default" }} />
          )}
        </div>
        {form.formState.errors.hexCode && <S.FieldError>{form.formState.errors.hexCode.message}</S.FieldError>}
      </S.FormGroup>
    </>
  );

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ წინასწარ განსაზღვრული ფერების ბიბლიოთეკა პროდუქტებისთვის"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი ფერი
        </S.ActionButton>
      }
    >
      {loadingColors ? (
        <ListSkeleton count={3} />
      ) : colors.length === 0 ? (
        <S.EmptyState>
          <PaletteIcon size={48} />
          <S.EmptyTitle>ფერები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი ფერი, რომ პროდუქტებზე ფერების მითითება შეძლოთ.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> ფერის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {colors.map((color) => (
            <S.QuestionCard key={color.id}>
              <S.CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {color.hexCode && (
                    <S.ColorSwatch type="button" style={{ backgroundColor: color.hexCode, cursor: "default", flexShrink: 0 }} />
                  )}
                  <div>
                    <S.QuestionText>{getCategoryName(color, router.locale)}</S.QuestionText>
                    <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                      {getCategoryName(color, "ka")} / {getCategoryName(color, "en")}
                      {color.hexCode && ` · ${color.hexCode}`}
                    </p>
                  </div>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(color)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(color)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE COLOR MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PaletteIcon size={18} /> ახალი ფერის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              {renderColorFields(createForm)}
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

      {/* ═══ EDIT COLOR MODAL ═════════════════════════════════════════════════ */}
      {editingColor && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingColor(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> ფერის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingColor(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              {renderColorFields(editForm)}
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingColor(null)}>
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
        title="ფერის წაშლა"
        description="ნამდვილად გსურთ ამ ფერის წაშლა? ის ავტომატურად მოიხსნება ყველა პროდუქტიდან, სადაც მიბმულია. ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default ColorsPage;
