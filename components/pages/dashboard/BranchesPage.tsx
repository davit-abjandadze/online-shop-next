import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BranchesAPI } from "@/API_Client";
import { Branch, BranchWorkingHours } from "@/API_Client/types";
import { CloseIcon, EditIcon, PinIcon, PlusIcon, TrashIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { BRANCH_DAY_KEYS, BRANCH_DAY_LABELS, BranchFormValues, branchFormSchema } from "./schemas";
import * as S from "./style";

const emptyDayHours = { closed: false, open: "09:30", close: "19:00" };

const emptyBranchForm: BranchFormValues = {
  title: "",
  address: "",
  phoneNumber: "",
  email: "",
  latitude: "",
  longitude: "",
  workingHours: {
    mon: emptyDayHours,
    tue: emptyDayHours,
    wed: emptyDayHours,
    thu: emptyDayHours,
    fri: emptyDayHours,
    sat: emptyDayHours,
    sun: emptyDayHours,
  },
  isActive: true,
};

// ბექენდის workingHours-ის ფორმა (თითო დღეზე `{open,close}|null`) ფორმის
// ველების ფორმაში გარდაიქმნება (`closed` ალამი + ცარიელი ველების placeholder-ები).
const toFormWorkingHours = (wh: BranchWorkingHours): BranchFormValues["workingHours"] => {
  const result = {} as BranchFormValues["workingHours"];
  BRANCH_DAY_KEYS.forEach((day) => {
    const dayHours = wh[day];
    result[day] = dayHours
      ? { closed: false, open: dayHours.open, close: dayHours.close }
      : { closed: true, open: "09:30", close: "19:00" };
  });
  return result;
};

const toApiWorkingHours = (wh: BranchFormValues["workingHours"]): BranchWorkingHours => {
  const result = {} as BranchWorkingHours;
  BRANCH_DAY_KEYS.forEach((day) => {
    const dayValue = wh[day];
    result[day] = dayValue.closed ? null : { open: dayValue.open, close: dayValue.close };
  });
  return result;
};

export const BranchesPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: emptyBranchForm,
  });

  const editForm = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: emptyBranchForm,
  });

  const fetchBranches = async () => {
    if (!session?.accessToken) return;
    setLoadingBranches(true);
    try {
      const res = await BranchesAPI(router.locale || "ka", session.accessToken).branchesControllerFindAllAdmin();
      setBranches((res.data as unknown as Branch[]) || []);
    } catch {
      toast.error("ფილიალების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchBranches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const handleOpenCreate = () => {
    createForm.reset(emptyBranchForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    setCreateSubmitting(true);
    try {
      await BranchesAPI(router.locale || "ka", session!.accessToken!).branchesControllerCreate({
        title: data.title.trim(),
        address: data.address.trim(),
        phoneNumber: data.phoneNumber.trim(),
        email: data.email?.trim() || undefined,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        workingHours: toApiWorkingHours(data.workingHours),
        isActive: data.isActive,
      });
      toast.success("ფილიალი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyBranchForm);
      fetchBranches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფილიალის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    editForm.reset({
      title: branch.title,
      address: branch.address,
      phoneNumber: branch.phoneNumber,
      email: branch.email || "",
      latitude: String(branch.latitude),
      longitude: String(branch.longitude),
      workingHours: toFormWorkingHours(branch.workingHours),
      isActive: branch.isActive,
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingBranch || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await BranchesAPI(router.locale || "ka", session.accessToken).branchesControllerUpdate(
        String(editingBranch.id),
        {
          title: data.title.trim(),
          address: data.address.trim(),
          phoneNumber: data.phoneNumber.trim(),
          email: data.email?.trim() || undefined,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          workingHours: toApiWorkingHours(data.workingHours),
          isActive: data.isActive,
        }
      );
      toast.success("ფილიალი წარმატებით განახლდა!");
      setEditingBranch(null);
      fetchBranches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფილიალის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await BranchesAPI(router.locale || "ka", session.accessToken).branchesControllerRemove(String(deleteTarget.id));
      toast.success("ფილიალი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchBranches();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ფილიალის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const renderWorkingHoursFields = (form: typeof createForm) => (
    <S.FormGroup>
      <S.Label>სამუშაო საათები</S.Label>
      <S.WorkingHoursGrid>
        {BRANCH_DAY_KEYS.map((day) => {
          const closed = form.watch(`workingHours.${day}.closed`);
          return (
            <S.WorkingHoursRow key={day}>
              <S.WorkingHoursDay>{BRANCH_DAY_LABELS[day]}</S.WorkingHoursDay>
              <S.CategoryCheckboxItem checked={closed}>
                <input type="checkbox" {...form.register(`workingHours.${day}.closed`)} /> დახურულია
              </S.CategoryCheckboxItem>
              <S.WorkingHoursTimeInput type="time" disabled={closed} {...form.register(`workingHours.${day}.open`)} />
              <S.WorkingHoursTimeInput type="time" disabled={closed} {...form.register(`workingHours.${day}.close`)} />
            </S.WorkingHoursRow>
          );
        })}
      </S.WorkingHoursGrid>
    </S.FormGroup>
  );

  const formatWorkingHoursSummary = (wh: BranchWorkingHours) => {
    const openDays = BRANCH_DAY_KEYS.filter((day) => wh[day]);
    if (openDays.length === 0) return "ყოველთვის დახურული";
    const first = wh[openDays[0]]!;
    const allSame = openDays.every((day) => wh[day]!.open === first.open && wh[day]!.close === first.close);
    return allSame
      ? `${first.open} - ${first.close}`
      : openDays.map((day) => `${BRANCH_DAY_LABELS[day]}: ${wh[day]!.open}-${wh[day]!.close}`).join(", ");
  };

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ ფილიალები checkout-ის „ფილიალიდან გატანა“ ვარიანტისთვის"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი ფილიალი
        </S.ActionButton>
      }
    >
      {loadingBranches ? (
        <ListSkeleton count={3} />
      ) : branches.length === 0 ? (
        <S.EmptyState>
          <PinIcon size={48} />
          <S.EmptyTitle>ფილიალები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი ფილიალი, რომ „ფილიალიდან გატანა“ checkout-ზე ჩართოთ.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> ფილიალის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {branches.map((branch) => (
            <S.QuestionCard key={branch.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PinIcon size={18} /> {branch.title}
                  </S.QuestionText>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--ref-text-secondary)" }}>
                    {branch.address} · {branch.phoneNumber}
                    {branch.email && ` · ${branch.email}`}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                    {formatWorkingHoursSummary(branch.workingHours)}
                  </p>
                  <S.BadgeGroup style={{ marginTop: "8px" }}>
                    <S.Badge variant={branch.isActive ? "active" : "inactive"}>
                      {branch.isActive ? "აქტიური" : "არააქტიური"}
                    </S.Badge>
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(branch)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton variant="danger" onClick={() => setDeleteTarget(branch)}>
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {/* ═══ CREATE BRANCH MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PinIcon size={18} /> ახალი ფილიალის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>დასახელება</S.Label>
                  <S.Input type="text" placeholder="მაგ: ჯ. თბილისი, ვაკე" {...createForm.register("title")} />
                  {createForm.formState.errors.title && <S.FieldError>{createForm.formState.errors.title.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>ტელეფონის ნომერი</S.Label>
                  <S.Input type="text" placeholder="(032) 215 40 40" {...createForm.register("phoneNumber")} />
                  {createForm.formState.errors.phoneNumber && (
                    <S.FieldError>{createForm.formState.errors.phoneNumber.message}</S.FieldError>
                  )}
                </S.FormGroup>
              </S.FormRow>
              <S.FormGroup>
                <S.Label>მისამართი</S.Label>
                <S.Input type="text" placeholder="0177, უნივერსიტეტის ქ. N6" {...createForm.register("address")} />
                {createForm.formState.errors.address && <S.FieldError>{createForm.formState.errors.address.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>ელ-ფოსტა (არასავალდებულო)</S.Label>
                  <S.Input type="email" placeholder="info@amboli.ge" {...createForm.register("email")} />
                  {createForm.formState.errors.email && <S.FieldError>{createForm.formState.errors.email.message}</S.FieldError>}
                </S.FormGroup>
              </S.FormRow>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>რუკის განედი (latitude)</S.Label>
                  <S.Input type="text" inputMode="decimal" placeholder="41.7225" {...createForm.register("latitude")} />
                  {createForm.formState.errors.latitude && <S.FieldError>{createForm.formState.errors.latitude.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>რუკის გრძედი (longitude)</S.Label>
                  <S.Input type="text" inputMode="decimal" placeholder="44.7635" {...createForm.register("longitude")} />
                  {createForm.formState.errors.longitude && (
                    <S.FieldError>{createForm.formState.errors.longitude.message}</S.FieldError>
                  )}
                </S.FormGroup>
              </S.FormRow>
              {renderWorkingHoursFields(createForm)}
              <S.CategoryCheckboxItem checked={createForm.watch("isActive")}>
                <input type="checkbox" {...createForm.register("isActive")} /> აქტიურია
              </S.CategoryCheckboxItem>
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

      {/* ═══ EDIT BRANCH MODAL ═════════════════════════════════════════════════ */}
      {editingBranch && (
        <S.ModalOverlay {...getOverlayProps(() => setEditingBranch(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> ფილიალის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingBranch(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>დასახელება</S.Label>
                  <S.Input type="text" {...editForm.register("title")} />
                  {editForm.formState.errors.title && <S.FieldError>{editForm.formState.errors.title.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>ტელეფონის ნომერი</S.Label>
                  <S.Input type="text" {...editForm.register("phoneNumber")} />
                  {editForm.formState.errors.phoneNumber && (
                    <S.FieldError>{editForm.formState.errors.phoneNumber.message}</S.FieldError>
                  )}
                </S.FormGroup>
              </S.FormRow>
              <S.FormGroup>
                <S.Label>მისამართი</S.Label>
                <S.Input type="text" {...editForm.register("address")} />
                {editForm.formState.errors.address && <S.FieldError>{editForm.formState.errors.address.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>ელ-ფოსტა (არასავალდებულო)</S.Label>
                  <S.Input type="email" {...editForm.register("email")} />
                  {editForm.formState.errors.email && <S.FieldError>{editForm.formState.errors.email.message}</S.FieldError>}
                </S.FormGroup>
              </S.FormRow>
              <S.FormRow>
                <S.FormGroup>
                  <S.Label>რუკის განედი (latitude)</S.Label>
                  <S.Input type="text" inputMode="decimal" {...editForm.register("latitude")} />
                  {editForm.formState.errors.latitude && <S.FieldError>{editForm.formState.errors.latitude.message}</S.FieldError>}
                </S.FormGroup>
                <S.FormGroup>
                  <S.Label>რუკის გრძედი (longitude)</S.Label>
                  <S.Input type="text" inputMode="decimal" {...editForm.register("longitude")} />
                  {editForm.formState.errors.longitude && (
                    <S.FieldError>{editForm.formState.errors.longitude.message}</S.FieldError>
                  )}
                </S.FormGroup>
              </S.FormRow>
              {renderWorkingHoursFields(editForm)}
              <S.CategoryCheckboxItem checked={editForm.watch("isActive")}>
                <input type="checkbox" {...editForm.register("isActive")} /> აქტიურია
              </S.CategoryCheckboxItem>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingBranch(null)}>
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
        title="ფილიალის წაშლა"
        description="ნამდვილად გსურთ ამ ფილიალის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default BranchesPage;
