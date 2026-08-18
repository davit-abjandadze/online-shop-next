import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserAPI } from "@/API_Client";
import { PaginationMetaDto, User } from "@/API_Client/client/models";
import {
  UsersControllerSearchGenderEnum,
  UsersControllerSearchOrderEnum,
  UsersControllerSearchRoleEnum,
} from "@/API_Client/client/apis/users-api";
import { CloseIcon, ClipboardIcon, EditIcon, PeopleIcon, PlusIcon, SearchIcon, TrashIcon } from "@/components/ui/RefIcons";
import { getPaginationRange } from "@/utils/getPaginationRange";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import DashboardLayout from "./DashboardLayout";
import ConfirmDialog from "./ConfirmDialog";
import { ListSkeleton } from "./Skeletons";
import { UserCreateFormValues, userCreateFormSchema, UserEditFormValues, userEditFormSchema } from "./schemas";
import * as S from "./style";

const USERS_PAGE_SIZE = 10;

const emptyCreateForm: UserCreateFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
  gender: "",
  age: "",
};

export const UsersPage: React.FC = () => {
  const { session } = useAdminGuard();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingU, setLoadingU] = useState<boolean>(true);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersMeta, setUsersMeta] = useState<PaginationMetaDto | null>(null);

  // ─── გაფართოებული ძიება/ფილტრები ────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterGender, setFilterGender] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("createdAt");
  const [filterOrder, setFilterOrder] = useState<string>("DESC");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setUsersPage(1);
  }, [debouncedSearch, filterRole, filterGender, filterSortBy, filterOrder]);

  const hasActiveFilters =
    debouncedSearch !== "" || filterRole !== "" || filterGender !== "" || filterSortBy !== "createdAt" || filterOrder !== "DESC";

  const handleResetFilters = () => {
    setSearchText("");
    setFilterRole("");
    setFilterGender("");
    setFilterSortBy("createdAt");
    setFilterOrder("DESC");
    setUsersPage(1);
  };

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  const createForm = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
    defaultValues: emptyCreateForm,
  });

  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: { firstName: "", lastName: "", email: "", role: "user", gender: "", age: "" },
  });

  const fetchUsers = async () => {
    if (!session?.accessToken) return;
    setLoadingU(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerSearch(
        usersPage,
        USERS_PAGE_SIZE,
        filterSortBy || undefined,
        (filterOrder || undefined) as UsersControllerSearchOrderEnum | undefined,
        debouncedSearch || undefined,
        (filterRole || undefined) as UsersControllerSearchRoleEnum | undefined,
        (filterGender || undefined) as UsersControllerSearchGenderEnum | undefined
      );
      const data = res.data as any;
      setUsers(Array.isArray(data?.data) ? data.data : []);
      setUsersMeta(data?.meta || null);
    } catch {
      toast.error("მომხმარებლების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingU(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, usersPage, debouncedSearch, filterRole, filterGender, filterSortBy, filterOrder]);

  const handleOpenCreate = () => {
    createForm.reset(emptyCreateForm);
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = createForm.handleSubmit(async (data) => {
    if (!session?.accessToken) return;
    setCreateSubmitting(true);
    try {
      await UserAPI(router.locale || "ka", session.accessToken).usersControllerCreate({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
        gender: data.gender || undefined,
        age: data.age ? Number(data.age) : undefined,
      } as any);
      toast.success("მომხმარებელი წარმატებით დაემატა!");
      setIsCreateOpen(false);
      createForm.reset(emptyCreateForm);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მომხმარებლის დამატება ვერ მოხერხდა");
    } finally {
      setCreateSubmitting(false);
    }
  });

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      gender: user.gender || "",
      age: user.age != null ? String(user.age) : "",
    });
  };

  const handleEditSubmit = editForm.handleSubmit(async (data) => {
    if (!editingUser || !session?.accessToken) return;
    setEditSubmitting(true);
    try {
      await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(String(editingUser.id), {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        role: data.role,
        gender: data.gender || undefined,
        age: data.age ? Number(data.age) : undefined,
      } as any);
      toast.success("მომხმარებელი წარმატებით განახლდა!");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მომხმარებლის განახლება ვერ მოხერხდა");
    } finally {
      setEditSubmitting(false);
    }
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return;
    setDeleteSubmitting(true);
    try {
      await UserAPI(router.locale || "ka", session.accessToken).usersControllerRemove(String(deleteTarget.id));
      toast.success("მომხმარებელი წარმატებით წაიშალა!");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "მომხმარებლის წაშლა ვერ მოხერხდა");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const isSelf = (user: User) => String(session?.user?.id) === String(user.id);

  return (
    <DashboardLayout
      title="ადმინ დეშბორდი"
      subtitle="მართეთ პლატფორმის მომხმარებლები და მათი უფლებები"
      headerAction={
        <S.ActionButton variant="primary" onClick={handleOpenCreate}>
          <PlusIcon size={16} /> ახალი მომხმარებელი
        </S.ActionButton>
      }
    >
      <S.FilterBar>
        <S.FilterBarHeader>
          <S.FilterBarTitle>
            <ClipboardIcon size={16} />
            გაფართოებული ძიება
            {hasActiveFilters && <S.FilterCountBadge>აქტიური</S.FilterCountBadge>}
          </S.FilterBarTitle>
          <S.FilterActions>
            <S.ActionButton type="button" variant="secondary" onClick={handleResetFilters} disabled={!hasActiveFilters}>
              <CloseIcon size={14} /> ფილტრის გასუფთავება
            </S.ActionButton>
          </S.FilterActions>
        </S.FilterBarHeader>

        <S.FilterGrid>
          <S.FilterGroup>
            <S.FilterLabel>ძიება</S.FilterLabel>
            <S.SearchInputWrapper>
              <SearchIcon size={16} />
              <S.Input
                type="text"
                placeholder="სახელით, გვარით ან ელ. ფოსტით..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </S.SearchInputWrapper>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>როლი</S.FilterLabel>
            <S.Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="">ყველა</option>
              <option value="admin">ადმინისტრატორი</option>
              <option value="user">მომხმარებელი</option>
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>სქესი</S.FilterLabel>
            <S.Select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="">ყველა</option>
              <option value="male">მამრობითი</option>
              <option value="female">მდედრობითი</option>
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>დალაგება</S.FilterLabel>
            <S.Select value={filterSortBy} onChange={(e) => setFilterSortBy(e.target.value)}>
              <option value="createdAt">დამატების თარიღი</option>
              <option value="firstName">სახელი</option>
              <option value="lastName">გვარი</option>
              <option value="email">ელ. ფოსტა</option>
              <option value="role">როლი</option>
              <option value="age">ასაკი</option>
            </S.Select>
          </S.FilterGroup>

          <S.FilterGroup>
            <S.FilterLabel>მიმართულება</S.FilterLabel>
            <S.Select value={filterOrder} onChange={(e) => setFilterOrder(e.target.value)}>
              <option value="DESC">კლებადობით</option>
              <option value="ASC">ზრდადობით</option>
            </S.Select>
          </S.FilterGroup>
        </S.FilterGrid>
      </S.FilterBar>

      {loadingU ? (
        <ListSkeleton count={3} />
      ) : users.length === 0 ? (
        <S.EmptyState>
          <PeopleIcon size={48} />
          <S.EmptyTitle>მომხმარებლები არ არის</S.EmptyTitle>
          <S.EmptyText>დაამატეთ პირველი მომხმარებელი.</S.EmptyText>
          <S.ActionButton variant="primary" onClick={handleOpenCreate}>
            <PlusIcon size={16} /> მომხმარებლის დამატება
          </S.ActionButton>
        </S.EmptyState>
      ) : (
        <S.QuestionsList>
          {users.map((user) => (
            <S.QuestionCard key={user.id}>
              <S.CardHeader>
                <div>
                  <S.QuestionText style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PeopleIcon size={18} /> {user.firstName} {user.lastName}
                  </S.QuestionText>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--ref-text-secondary)" }}>{user.email}</p>
                  <S.BadgeGroup style={{ marginTop: "8px" }}>
                    <S.Badge variant={user.role === "admin" ? "approved" : "date"}>
                      {user.role === "admin" ? "ადმინისტრატორი" : "მომხმარებელი"}
                    </S.Badge>
                    {user.gender && (
                      <S.Badge variant="date">{user.gender === "male" ? "მამრობითი" : "მდედრობითი"}</S.Badge>
                    )}
                    {user.age != null && <S.Badge variant="date">{user.age} წლის</S.Badge>}
                  </S.BadgeGroup>
                </div>
                <S.CardActions>
                  <S.ActionButton variant="outline" onClick={() => handleOpenEdit(user)}>
                    <EditIcon size={16} /> რედაქტირება
                  </S.ActionButton>
                  <S.ActionButton
                    variant="danger"
                    disabled={isSelf(user)}
                    title={isSelf(user) ? "საკუთარი ანგარიშის წაშლა შეუძლებელია" : undefined}
                    onClick={() => setDeleteTarget(user)}
                  >
                    <TrashIcon size={16} /> წაშლა
                  </S.ActionButton>
                </S.CardActions>
              </S.CardHeader>
            </S.QuestionCard>
          ))}
        </S.QuestionsList>
      )}

      {usersMeta && usersMeta.totalPages > 1 && (
        <S.PaginationBar>
          <S.PageButton onClick={() => setUsersPage((p) => Math.max(1, p - 1))} disabled={!usersMeta.hasPrevious}>
            ←
          </S.PageButton>

          <S.PageNumbers>
            {getPaginationRange(usersMeta.page, usersMeta.totalPages).map((item, idx) =>
              item === "..." ? (
                <S.PageEllipsis key={`ellipsis-${idx}`}>...</S.PageEllipsis>
              ) : (
                <S.PageNumberButton key={item} active={item === usersMeta.page} onClick={() => setUsersPage(item)}>
                  {item}
                </S.PageNumberButton>
              )
            )}
          </S.PageNumbers>

          <S.PageButton onClick={() => setUsersPage((p) => p + 1)} disabled={!usersMeta.hasNext}>
            →
          </S.PageButton>
        </S.PaginationBar>
      )}

      {/* ═══ CREATE USER MODAL ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <S.ModalOverlay onClick={() => setIsCreateOpen(false)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PeopleIcon size={18} /> ახალი მომხმარებლის დამატება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setIsCreateOpen(false)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleCreateSubmit} noValidate>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input type="text" placeholder="მაგ: გიორგი" {...createForm.register("firstName")} />
                {createForm.formState.errors.firstName && <S.FieldError>{createForm.formState.errors.firstName.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input type="text" placeholder="მაგ: გიორგაძე" {...createForm.register("lastName")} />
                {createForm.formState.errors.lastName && <S.FieldError>{createForm.formState.errors.lastName.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ელ. ფოსტა</S.Label>
                <S.Input type="email" placeholder="მაგ: example@mail.com" {...createForm.register("email")} />
                {createForm.formState.errors.email && <S.FieldError>{createForm.formState.errors.email.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>პაროლი</S.Label>
                <S.Input type="password" placeholder="მინიმუმ 6 სიმბოლო" {...createForm.register("password")} />
                {createForm.formState.errors.password && <S.FieldError>{createForm.formState.errors.password.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>როლი</S.Label>
                <S.Select {...createForm.register("role")}>
                  <option value="user">მომხმარებელი</option>
                  <option value="admin">ადმინისტრატორი</option>
                </S.Select>
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>სქესი (არასავალდებულო)</S.Label>
                <S.Select {...createForm.register("gender")}>
                  <option value="">არ არის მითითებული</option>
                  <option value="male">მამრობითი</option>
                  <option value="female">მდედრობითი</option>
                </S.Select>
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ასაკი (არასავალდებულო)</S.Label>
                <S.Input type="number" min={0} {...createForm.register("age")} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={createSubmitting}>{createSubmitting ? "ემატება..." : "შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      {/* ═══ EDIT USER MODAL ═════════════════════════════════════════════════ */}
      {editingUser && (
        <S.ModalOverlay onClick={() => setEditingUser(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalHeader>
              <S.ModalTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditIcon size={18} /> მომხმარებლის რედაქტირება
              </S.ModalTitle>
              <S.CloseButton onClick={() => setEditingUser(null)}><CloseIcon size={16} /></S.CloseButton>
            </S.ModalHeader>
            <form onSubmit={handleEditSubmit} noValidate>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input type="text" {...editForm.register("firstName")} />
                {editForm.formState.errors.firstName && <S.FieldError>{editForm.formState.errors.firstName.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input type="text" {...editForm.register("lastName")} />
                {editForm.formState.errors.lastName && <S.FieldError>{editForm.formState.errors.lastName.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ელ. ფოსტა</S.Label>
                <S.Input type="email" {...editForm.register("email")} />
                {editForm.formState.errors.email && <S.FieldError>{editForm.formState.errors.email.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>როლი</S.Label>
                <S.Select disabled={isSelf(editingUser)} {...editForm.register("role")}>
                  <option value="user">მომხმარებელი</option>
                  <option value="admin">ადმინისტრატორი</option>
                </S.Select>
                {isSelf(editingUser) && (
                  <span style={{ fontSize: "12px", color: "var(--ref-text-secondary)" }}>
                    საკუთარი როლის შეცვლა შეუძლებელია
                  </span>
                )}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>სქესი (არასავალდებულო)</S.Label>
                <S.Select {...editForm.register("gender")}>
                  <option value="">არ არის მითითებული</option>
                  <option value="male">მამრობითი</option>
                  <option value="female">მდედრობითი</option>
                </S.Select>
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ასაკი (არასავალდებულო)</S.Label>
                <S.Input type="number" min={0} {...editForm.register("age")} />
              </S.FormGroup>
              <S.ModalFooter>
                <S.ActionButton type="button" variant="secondary" onClick={() => setEditingUser(null)}>გაუქმება</S.ActionButton>
                <S.ActionButton type="submit" variant="primary" disabled={editSubmitting}>{editSubmitting ? "ინახება..." : "ცვლილებების შენახვა"}</S.ActionButton>
              </S.ModalFooter>
            </form>
          </S.ModalContent>
        </S.ModalOverlay>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="მომხმარებლის წაშლა"
        description="ნამდვილად გსურთ ამ მომხმარებლის წაშლა? ეს მოქმედება შეუქცევადია."
        confirming={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default UsersPage;
