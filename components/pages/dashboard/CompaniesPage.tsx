import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CompaniesAPI } from "@/API_Client";
import { Company } from "@/API_Client/client/models";
import { BuildingIcon, CloseIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { CDN_URL } from "@/constants";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { CompanyFormValues, companyFormSchema } from "./schemas";
import * as S from "./style";

const emptyCompanyForm: CompanyFormValues = {
  name: "",
  description: "",
  logoUrl: "",
  isActive: true,
  sortOrder: "0",
};

const resolveLogo = (url?: string) => (url ? (url.startsWith("http") ? url : `${CDN_URL}${url}`) : undefined);

/**
 * კომპანიების admin CRUD — ColorsPage.tsx-ის იგივე create/edit/delete +
 * modal პატერნით, ბრტყელი (ჩადგმული ველების გარეშე) ფორმით. აქ დამატებული
 * კომპანიები მერე ფილიალის (BranchesPage) და პროდუქტის (ProductsPage)
 * ფორმებში, მფლობელი კომპანიის მისანიჭებლად, გამოიყენება.
 */
export const CompaniesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: emptyCompanyForm,
  });

  const editForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: emptyCompanyForm,
  });

  const fetchCompanies = async () => {
    if (!session?.accessToken) return;
    setLoadingCompanies(true);
    try {
      const res = await CompaniesAPI(router.locale || "ka", session.accessToken).companiesControllerFindAllAdmin();
      setCompanies((res.data as unknown as Company[]) || []);
    } catch {
      toast.error("კომპანიების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptyCompanyForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await CompaniesAPI(router.locale || "ka", session!.accessToken!).companiesControllerCreate({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        logoUrl: data.logoUrl?.trim() || undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder.trim() ? Number(data.sortOrder) : undefined,
      });
      toast.success("კომპანია წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyCompanyForm);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კომპანიის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    editForm.reset({
      name: company.name,
      description: company.description || "",
      logoUrl: company.logoUrl || "",
      isActive: company.isActive,
      sortOrder: String(company.sortOrder),
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingCompany || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await CompaniesAPI(router.locale || "ka", session.accessToken).companiesControllerUpdate(
        String(editingCompany.id),
        {
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          logoUrl: data.logoUrl?.trim() || undefined,
          isActive: data.isActive,
          sortOrder: data.sortOrder.trim() ? Number(data.sortOrder) : undefined,
        }
      );
      toast.success("კომპანია წარმატებით განახლდა!");
      setEditingCompany(null);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კომპანიის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await CompaniesAPI(router.locale || "ka", session.accessToken).companiesControllerRemove(String(deleteTarget.id));
      toast.success("კომპანია წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "კომპანიის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderCompanyFields = (form: typeof createForm) => (
    <>
      <S.FormGroup>
        <S.Label>დასახელება</S.Label>
        <S.Input type="text" placeholder="მაგ: შპს ამბოლი" {...form.register("name")} />
        {form.formState.errors.name && <S.FieldError>{form.formState.errors.name.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>აღწერა (არასავალდებულო)</S.Label>
        <S.Textarea rows={3} {...form.register("description")} />
      </S.FormGroup>
      <S.FormGroup>
        <S.Label>ლოგოს URL (არასავალდებულო)</S.Label>
        <S.Input type="text" placeholder="https://.../logo.png" {...form.register("logoUrl")} />
        {form.formState.errors.logoUrl && <S.FieldError>{form.formState.errors.logoUrl.message}</S.FieldError>}
      </S.FormGroup>
      <S.FormRow>
        <S.FormGroup>
          <S.Label>დალაგების რიგი</S.Label>
          <S.Input type="text" inputMode="numeric" placeholder="0" {...form.register("sortOrder")} />
          {form.formState.errors.sortOrder && <S.FieldError>{form.formState.errors.sortOrder.message}</S.FieldError>}
        </S.FormGroup>
      </S.FormRow>
      <S.CategoryCheckboxItem checked={form.watch("isActive")}>
        <input type="checkbox" {...form.register("isActive")} /> აქტიურია
      </S.CategoryCheckboxItem>
    </>
  );

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ კომპანიები — ფილიალები და პროდუქტები მათ ეკუთვნის"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი კომპანია
        </S.ActionButton>
      }
    >
      {loadingCompanies ? (
        <ListSkeleton count={3} />
      ) : companies.length === 0 ? (
        <S.EmptyState>
          <BuildingIcon size={48} />
          <S.EmptyTitle>კომპანიები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი კომპანია, რომ ფილიალები/პროდუქტები მიაბათ.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> კომპანიის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {companies.map((company) => (
            <S.QuestionCard key={company.id}>
              <S.CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {company.logoUrl ? (
                    <img
                      src={resolveLogo(company.logoUrl)}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain", flexShrink: 0 }}
                    />
                  ) : (
                    <BuildingIcon size={32} />
                  )}
                  <div>
                    <S.QuestionText>{company.name}</S.QuestionText>
                    {company.description && (
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                        {company.description}
                      </p>
                    )}
                    <S.BadgeGroup style={{ marginTop: "8px" }}>
                      <S.Badge variant={company.isActive ? "active" : "inactive"}>
                        {company.isActive ? "აქტიური" : "არააქტიური"}
                      </S.Badge>
                    </S.BadgeGroup>
                  </div>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(company)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(company)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE COMPANY MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BuildingIcon size={18} /> ახალი კომპანიის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              {renderCompanyFields(createForm)}
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

      {/* ═══ EDIT COMPANY MODAL ═════════════════════════════════════════════════ */}
      {editingCompany && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingCompany(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> კომპანიის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingCompany(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              {renderCompanyFields(editForm)}
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingCompany(null)}>
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
        title="კომპანიის წაშლა"
        description="ნამდვილად გსურთ ამ კომპანიის წაშლა? მასთან მიბმული ფილიალები ავტომატურად წაიშლება, პროდუქტებზე კი მხოლოდ მიბმა მოიხსნება. ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default CompaniesPage;
