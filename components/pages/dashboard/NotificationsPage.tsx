import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import Select, { components, OptionProps, StylesConfig } from "react-select";
import { NotificationsAdminAPI, UserAPI } from "@/API_Client";
import { NotificationActionDto, NotificationActionDtoTypeEnum, NotificationResponseDto } from "@/API_Client/client/models";
import { PaginatedResponseDto, User } from "@/API_Client/types";
import { BellIcon, CloseIcon, EditIcon, PlusIcon, TrashIcon, UploadIcon } from "@/components/ui/RefIcons";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useOverlayCloseHandlers } from "@/hooks/useOverlayClose";
import { getPaginationRange } from "@/utils/getPaginationRange";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import RichTextEditor from "./RichTextEditor";
import { ListSkeleton } from "./Skeletons";
import * as S from "./style";

const NOTIFICATIONS_PAGE_SIZE = 10;

interface NotificationFormValues {
  title: string;
  contentHtml: string;
  imageUrl: string;
  sendToAll: boolean;
  targetUserIds: number[];
  actions: NotificationActionDto[];
}

const emptyForm: NotificationFormValues = {
  title: "",
  contentHtml: "",
  imageUrl: "",
  sendToAll: true,
  targetUserIds: [],
  actions: [],
};

interface NotificationEditFormValues {
  title: string;
  contentHtml: string;
  imageUrl: string;
  actions: NotificationActionDto[];
}

const emptyAction: NotificationActionDto = {
  label: "",
  type: NotificationActionDtoTypeEnum.Close,
  url: "",
};

/**
 * ვალიდაცია: "Link" ტიპის ღილაკს უნდა ჰქონდეს არაცარიელი http(s) URL.
 * ბექენდიც ვალიდაციას აკეთებს (400 თუ არასწორია), მაგრამ ადრეულ ეტაპზე ვაჩერებთ UX-ისთვის.
 */
const validateActions = (actions: NotificationActionDto[]): string | null => {
  for (const action of actions) {
    if (!action.label.trim()) {
      return "ყველა ღილაკს უნდა ჰქონდეს ტექსტი";
    }
    if (action.type === NotificationActionDtoTypeEnum.Link) {
      const url = (action.url || "").trim();
      if (!url || !/^https?:\/\//i.test(url)) {
        return "'ლინკი' ტიპის ღილაკს უნდა ჰქონდეს http(s) URL";
      }
    }
  }
  return null;
};

interface UserOption {
  value: number;
  label: string;
}

/**
 * `react-select`-ის თემასთან შესაბამისობაში მოყვანილი სტილები —
 * ProductSliderItemsForm.tsx-ის იგივე პატერნი.
 */
const userSelectStyles: StylesConfig<UserOption, true> = {
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
  multiValue: (base) => ({ ...base, background: "var(--ref-border)" }),
  multiValueLabel: (base) => ({ ...base, color: "var(--ref-text-primary)" }),
  input: (base) => ({ ...base, color: "var(--ref-text-primary)" }),
  placeholder: (base) => ({ ...base, color: "var(--ref-text-secondary)" }),
};

const UserCheckboxOption = (props: OptionProps<UserOption, true>) => (
  <components.Option {...props}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="checkbox" checked={props.isSelected} onChange={() => {}} style={{ cursor: "pointer" }} />
      <span>{props.label}</span>
    </div>
  </components.Option>
);

/**
 * ადმინის შეტყობინებების გვერდი — Phase F1 (გაგზავნის ფორმა rich-text
 * ედიტორით, სურათის ატვირთვით, სამიზნე აუდიტორიის არჩევით) და Phase F2
 * (გაგზავნილი შეტყობინებების ისტორია + წაშლა). HeroSlidesPage.tsx-ის იგივე
 * modal/CRUD პატერნით.
 */
export const NotificationsPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();
  const { getOverlayProps } = useOverlayCloseHandlers();

  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [meta, setMeta] = useState<PaginatedResponseDto<NotificationResponseDto>["meta"] | null>(null);
  const [page, setPage] = useState<number>(1);

  const [users, setUsers] = useState<User[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<NotificationResponseDto | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const [editTarget, setEditTarget] = useState<NotificationResponseDto | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);
  const [editUploading, setEditUploading] = useState<boolean>(false);

  const form = useForm<NotificationFormValues>({ defaultValues: emptyForm });
  const editForm = useForm<NotificationEditFormValues>({
    defaultValues: { title: "", contentHtml: "", imageUrl: "", actions: [] },
  });

  const actionsFieldArray = useFieldArray({ control: form.control, name: "actions" });
  const editActionsFieldArray = useFieldArray({ control: editForm.control, name: "actions" });

  const fetchNotifications = async () => {
    if (!session?.accessToken) return;
    setLoadingList(true);
    try {
      const res = await NotificationsAdminAPI(
        router.locale || "ka",
        session.accessToken
      ).notificationsControllerFindAll(page, NOTIFICATIONS_PAGE_SIZE, "createdAt", "DESC" as any);
      const data = res.data as unknown as PaginatedResponseDto<NotificationResponseDto>;
      setNotifications(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
    } catch {
      toast.error("შეტყობინებების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchUsers = async () => {
    if (!session?.accessToken) return;
    try {
      // limit მაქსიმუმ 100-ია ბექენდზე (PaginationDto @Max(100))
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerSearch(1, 100);
      const data = res.data as unknown as PaginatedResponseDto<User>;
      setUsers(Array.isArray(data?.data) ? data.data : []);
    } catch {
      toast.error("მომხმარებლების სიის ჩატვირთვა ვერ მოხერხდა");
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, page]);

  useEffect(() => {
    if (session?.accessToken && isCreateOpen) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, isCreateOpen]);

  const handleOpenCreate = () => {
    form.reset(emptyForm);
    setIsCreateOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !session?.accessToken) return;
    setUploading(true);
    try {
      const res = await NotificationsAdminAPI(
        router.locale || "ka",
        session.accessToken
      ).notificationsControllerUploadImage(file);
      form.setValue("imageUrl", res.data.url);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სურათის ატვირთვა ვერ მოხერხდა");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = form.handleSubmit(async (data) => {
    if (!session?.accessToken) return;
    if (!data.title.trim()) {
      toast.error("გთხოვთ შეავსოთ სათაური");
      return;
    }
    if (!data.contentHtml.trim()) {
      toast.error("გთხოვთ შეავსოთ შეტყობინების ტექსტი");
      return;
    }
    if (!data.sendToAll && data.targetUserIds.length === 0) {
      toast.error("გთხოვთ აირჩიოთ მინიმუმ ერთი მიმღები, ან მონიშნეთ 'ყველას გაგზავნა'");
      return;
    }
    const actionsError = validateActions(data.actions);
    if (actionsError) {
      toast.error(actionsError);
      return;
    }

    setCreateSubmitting(true);
    try {
      await NotificationsAdminAPI(router.locale || "ka", session.accessToken).notificationsControllerCreate({
        title: data.title.trim(),
        contentHtml: data.contentHtml,
        imageUrl: data.imageUrl.trim() || undefined,
        targetUserIds: data.sendToAll ? undefined : data.targetUserIds,
        actions: data.actions.length > 0 ? data.actions.map((a) => ({ ...a, label: a.label.trim() })) : undefined,
      });
      toast.success("შეტყობინება წარმატებით გაიგზავნა!");
      setIsCreateOpen(false);
      form.reset(emptyForm);
      // page-ის ცვლილება useEffect-ს გაუშვებს fetchNotifications()-ზე;
      // თუ უკვე 1-ინ გვერდზეა, page არ იცვლება და fetch ხელით უნდა გავუშვათ
      if (page === 1) {
        fetchNotifications();
      } else {
        setPage(1);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "შეტყობინების გაგზავნა ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (notification: NotificationResponseDto) => {
    editForm.reset({
      title: notification.title,
      contentHtml: notification.contentHtml,
      imageUrl: notification.imageUrl || "",
      actions: notification.actions || [],
    });
    setEditTarget(notification);
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !session?.accessToken) return;
    setEditUploading(true);
    try {
      const res = await NotificationsAdminAPI(
        router.locale || "ka",
        session.accessToken
      ).notificationsControllerUploadImage(file);
      editForm.setValue("imageUrl", res.data.url);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "სურათის ატვირთვა ვერ მოხერხდა");
    } finally {
      setEditUploading(false);
    }
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editTarget || !session?.accessToken) return;
    if (!data.title.trim()) {
      toast.error("გთხოვთ შეავსოთ სათაური");
      return;
    }
    if (!data.contentHtml.trim()) {
      toast.error("გთხოვთ შეავსოთ შეტყობინების ტექსტი");
      return;
    }
    const actionsError = validateActions(data.actions);
    if (actionsError) {
      toast.error(actionsError);
      return;
    }

    setEditSubmitting(true);
    try {
      await NotificationsAdminAPI(router.locale || "ka", session.accessToken).notificationsControllerUpdate(
        editTarget.id,
        {
          title: data.title.trim(),
          contentHtml: data.contentHtml,
          imageUrl: data.imageUrl.trim() || undefined,
          actions: data.actions.length > 0 ? data.actions.map((a) => ({ ...a, label: a.label.trim() })) : undefined,
        }
      );
      toast.success("შეტყობინება წარმატებით განახლდა!");
      setEditTarget(null);
      fetchNotifications();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "შეტყობინების განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await NotificationsAdminAPI(router.locale || "ka", session.accessToken).notificationsControllerRemove(
        deleteTarget.id
      );
      toast.success("შეტყობინება წარმატებით წაიშალა!");
      setDeleteTarget(null);
      // თუ ეს გვერდის ერთადერთი item იყო და page > 1, ეს გვერდი წაშლის
      // შემდეგ აღარ არსებობს — წინა გვერდზე დაბრუნება, თუარა ცარიელი
      // სია გამოჩნდება. useEffect (page-ის ცვლაზე) გაუშვებს fetch-ს.
      if (notifications.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchNotifications();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "შეტყობინების წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const userOptions: UserOption[] = users.map((u) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName} (${u.email})`,
  }));

  const sendToAll = form.watch("sendToAll");
  const imageUrl = form.watch("imageUrl");
  const editImageUrl = editForm.watch("imageUrl");

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ user-ებისთვის გასაგზავნი შეტყობინებები"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი შეტყობინება
        </S.ActionButton>
      }
    >
      {loadingList ? (
        <ListSkeleton count={3} />
      ) : notifications.length === 0 ? (
        <S.EmptyState>
          <BellIcon size={48} />
          <S.EmptyTitle>შეტყობინებები არ არის</S.EmptyTitle>
          <S.EmptyText>გაგზავნეთ პირველი შეტყობინება user-ებისთვის.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> შეტყობინების გაგზავნა
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <>
          <S.QuestionsList>
            {notifications.map((notification) => (
              <S.QuestionCard key={notification.id}>
                <S.CardHeader>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {notification.imageUrl ? (
                      <S.ImageThumb>
                        <img src={notification.imageUrl} alt="" />
                      </S.ImageThumb>
                    ) : (
                      <S.ImageThumb>
                        <BellIcon size={16} />
                      </S.ImageThumb>
                    )}
                    <div>
                      <S.QuestionText>{notification.title}</S.QuestionText>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ref-text-secondary)" }}>
                        {new Date(notification.createdAt).toLocaleString("ka-GE")}
                      </p>
                    </div>
                  </div>
                  <S.CardActions>
                    <S.ActionButton variant="secondary" onClick={() => handleOpenEdit(notification)}>
                      <EditIcon size={16} /> რედაქტირება
                    </S.ActionButton>
                    <S.ActionButton variant="danger" onClick={() => setDeleteTarget(notification)}>
                      <TrashIcon size={16} /> წაშლა
                    </S.ActionButton>
                  </S.CardActions>
                </S.CardHeader>
              </S.QuestionCard>
            ))}
          </S.QuestionsList>

          {meta && meta.totalPages > 1 && (
            <S.PaginationBar>
              <S.PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta.hasPrevious}>
                ←
              </S.PageButton>
              <S.PageNumbers>
                {getPaginationRange(meta.page, meta.totalPages).map((item, idx) =>
                  item === "..." ? (
                    <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
                  ) : (
                    <S.PageNumberButton key={item} active={item === meta.page} onClick={() => setPage(item)}>
                      {item}
                    </S.PageNumberButton>
                  )
                )}
              </S.PageNumbers>
              <S.PageButton onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNext}>
                →
              </S.PageButton>
            </S.PaginationBar>
          )}
        </>
      )}

      {/* ═══ CREATE NOTIFICATION MODAL ═══════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay {...getOverlayProps(() => setIsCreateOpen(false))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BellIcon size={18} /> ახალი შეტყობინების გაგზავნა
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              <S.FormGroup>
                <S.Label>სათაური</S.Label>
                <S.Input type="text" placeholder="მაგ: ახალი ფასდაკლება!" {...form.register("title")} />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>შეტყობინების ტექსტი</S.Label>
                <Controller
                  control={form.control}
                  name="contentHtml"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="დაწერეთ შეტყობინების ტექსტი..."
                    />
                  )}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სურათი (არასავალდებულო)</S.Label>
                <S.ImageRow>
                  <S.ImageThumb>
                    {imageUrl ? <img src={imageUrl} alt="" /> : <BellIcon size={16} />}
                  </S.ImageThumb>
                  <S.Input type="text" placeholder="https://.../image.jpg" {...form.register("imageUrl")} />
                  <S.UploadImageLabel disabled={uploading} title="ატვირთვა კომპიუტერიდან">
                    {uploading ? "…" : <UploadIcon size={16} />}
                    <input type="file" accept="image/*" hidden disabled={uploading} onChange={handleFileChange} />
                  </S.UploadImageLabel>
                </S.ImageRow>
              </S.FormGroup>

              <S.FormGroup>
                <S.CategoryCheckboxItem checked={sendToAll}>
                  <input type="checkbox" {...form.register("sendToAll")} /> გაეგზავნოს ყველა user-ს
                </S.CategoryCheckboxItem>
              </S.FormGroup>

              {!sendToAll && (
                <S.FormGroup>
                  <S.Label>კონკრეტული მიმღებები</S.Label>
                  <Controller
                    control={form.control}
                    name="targetUserIds"
                    render={({ field }) => {
                      const selected = userOptions.filter((o) => field.value.includes(o.value));
                      return (
                        <Select<UserOption, true>
                          isMulti
                          isSearchable
                          closeMenuOnSelect={false}
                          hideSelectedOptions={false}
                          components={{ Option: UserCheckboxOption }}
                          options={userOptions}
                          value={selected}
                          onChange={(opts) => field.onChange(opts ? opts.map((o) => o.value) : [])}
                          placeholder="— მომხმარებლის ძებნა —"
                          noOptionsMessage={() => "მომხმარებელი ვერ მოიძებნა"}
                          styles={userSelectStyles}
                        />
                      );
                    }}
                  />
                </S.FormGroup>
              )}

              <S.FormGroup>
                <S.Label>მოქმედების ღილაკები (არასავალდებულო)</S.Label>
                <S.ActionsBuilderList>
                  {actionsFieldArray.fields.map((field, index) => {
                    const actionType = form.watch(`actions.${index}.type`);
                    return (
                      <S.ActionBuilderRow key={field.id}>
                        <S.ActionBuilderField>
                          <S.Label>ტექსტი</S.Label>
                          <S.Input
                            type="text"
                            placeholder="მაგ: დახურვა"
                            {...form.register(`actions.${index}.label` as const)}
                          />
                        </S.ActionBuilderField>
                        <S.ActionBuilderField style={{ flex: "0 0 auto" }}>
                          <S.Label>ტიპი</S.Label>
                          <S.RadioGroup>
                            <S.RadioItem>
                              <input
                                type="radio"
                                value={NotificationActionDtoTypeEnum.Close}
                                {...form.register(`actions.${index}.type` as const)}
                              />
                              დახურვა
                            </S.RadioItem>
                            <S.RadioItem>
                              <input
                                type="radio"
                                value={NotificationActionDtoTypeEnum.Link}
                                {...form.register(`actions.${index}.type` as const)}
                              />
                              ლინკი
                            </S.RadioItem>
                          </S.RadioGroup>
                        </S.ActionBuilderField>
                        {actionType === NotificationActionDtoTypeEnum.Link && (
                          <S.ActionBuilderField>
                            <S.Label>URL</S.Label>
                            <S.Input
                              type="text"
                              placeholder="https://..."
                              {...form.register(`actions.${index}.url` as const)}
                            />
                          </S.ActionBuilderField>
                        )}
                        <S.RemoveActionBtn
                          type="button"
                          onClick={() => actionsFieldArray.remove(index)}
                          title="ღილაკის წაშლა"
                        >
                          <TrashIcon size={14} />
                        </S.RemoveActionBtn>
                      </S.ActionBuilderRow>
                    );
                  })}
                </S.ActionsBuilderList>
                <S.AddActionBtn
                  type="button"
                  onClick={() => actionsFieldArray.append({ ...emptyAction })}
                  style={{ marginTop: 8 }}
                >
                  <PlusIcon size={14} /> ღილაკის დამატება
                </S.AddActionBtn>
              </S.FormGroup>

              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={createSubmitting}>
                  {createSubmitting ? "იგზავნება..." : "გაგზავნა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT NOTIFICATION MODAL ═══════════════════════════════════════ */}
      {editTarget && (
        <S.ModalOverlay {...getOverlayProps(() => setEditTarget(null))}>
          <S.ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> შეტყობინების რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditTarget(null)}>
                <CloseIcon size={16} />
              </S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              <S.FormGroup>
                <S.Label>სათაური</S.Label>
                <S.Input type="text" placeholder="მაგ: ახალი ფასდაკლება!" {...editForm.register("title")} />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>შეტყობინების ტექსტი</S.Label>
                <Controller
                  control={editForm.control}
                  name="contentHtml"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="დაწერეთ შეტყობინების ტექსტი..."
                    />
                  )}
                />
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სურათი (არასავალდებულო)</S.Label>
                <S.ImageRow>
                  <S.ImageThumb>
                    {editImageUrl ? <img src={editImageUrl} alt="" /> : <BellIcon size={16} />}
                  </S.ImageThumb>
                  <S.Input type="text" placeholder="https://.../image.jpg" {...editForm.register("imageUrl")} />
                  <S.UploadImageLabel disabled={editUploading} title="ატვირთვა კომპიუტერიდან">
                    {editUploading ? "…" : <UploadIcon size={16} />}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={editUploading}
                      onChange={handleEditFileChange}
                    />
                  </S.UploadImageLabel>
                </S.ImageRow>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>მოქმედების ღილაკები (არასავალდებულო)</S.Label>
                <S.ActionsBuilderList>
                  {editActionsFieldArray.fields.map((field, index) => {
                    const actionType = editForm.watch(`actions.${index}.type`);
                    return (
                      <S.ActionBuilderRow key={field.id}>
                        <S.ActionBuilderField>
                          <S.Label>ტექსტი</S.Label>
                          <S.Input
                            type="text"
                            placeholder="მაგ: დახურვა"
                            {...editForm.register(`actions.${index}.label` as const)}
                          />
                        </S.ActionBuilderField>
                        <S.ActionBuilderField style={{ flex: "0 0 auto" }}>
                          <S.Label>ტიპი</S.Label>
                          <S.RadioGroup>
                            <S.RadioItem>
                              <input
                                type="radio"
                                value={NotificationActionDtoTypeEnum.Close}
                                {...editForm.register(`actions.${index}.type` as const)}
                              />
                              დახურვა
                            </S.RadioItem>
                            <S.RadioItem>
                              <input
                                type="radio"
                                value={NotificationActionDtoTypeEnum.Link}
                                {...editForm.register(`actions.${index}.type` as const)}
                              />
                              ლინკი
                            </S.RadioItem>
                          </S.RadioGroup>
                        </S.ActionBuilderField>
                        {actionType === NotificationActionDtoTypeEnum.Link && (
                          <S.ActionBuilderField>
                            <S.Label>URL</S.Label>
                            <S.Input
                              type="text"
                              placeholder="https://..."
                              {...editForm.register(`actions.${index}.url` as const)}
                            />
                          </S.ActionBuilderField>
                        )}
                        <S.RemoveActionBtn
                          type="button"
                          onClick={() => editActionsFieldArray.remove(index)}
                          title="ღილაკის წაშლა"
                        >
                          <TrashIcon size={14} />
                        </S.RemoveActionBtn>
                      </S.ActionBuilderRow>
                    );
                  })}
                </S.ActionsBuilderList>
                <S.AddActionBtn
                  type="button"
                  onClick={() => editActionsFieldArray.append({ ...emptyAction })}
                  style={{ marginTop: 8 }}
                >
                  <PlusIcon size={14} /> ღილაკის დამატება
                </S.AddActionBtn>
              </S.FormGroup>

              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditTarget(null)}>
                  გაუქმება
                </S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? "ინახება..." : "შენახვა"}
                </S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="შეტყობინების წაშლა"
        description="ნამდვილად გსურთ ამ შეტყობინების წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default NotificationsPage;
