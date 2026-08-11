import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/shared/Header";
import { UserAPI } from "@/API_Client";
import { User, UserGenderEnum } from "@/API_Client/client/models";
import { ProfileLayout } from "./ProfileLayout";
import { CalendarIcon, LockIcon, ShieldIcon, UserIcon } from "@/components/ui/RefIcons";
import * as S from "./style";
import {
  ProfileEditFormValues,
  profileEditSchema,
  AGE_MIN,
  AGE_MAX,
} from "@/components/shared/validation/schemas";

export const ProfileComponent: React.FC = () => {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: savingUser },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { firstName: "", lastName: "", age: "", gender: "" },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const gender = watch("gender");

  const fetchUser = async () => {
    if (!session?.accessToken || !session?.user?.id) return;
    setLoadingUser(true);
    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerFindOne(session.user.id);
      const u = res.data;
      setUser(u);
      setEmail(u.email || "");
      reset({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        age: u.age != null ? String(u.age) : "",
        gender: (u.gender as any) || "",
      });
    } catch {
      toast.error("მომხმარებლის ინფორმაციის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, session]);

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </S.Container>
        </S.PageWrapper>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.AccessDeniedCard>
            <LockIcon size={48} />
            <S.AccessDeniedTitle>წვდომა უარყოფილია</S.AccessDeniedTitle>
            <S.AccessDeniedText>ამ გვერდზე გადასასვლელად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  const getUserInitials = () => {
    const fn = firstName || user?.firstName || "";
    const ln = lastName || user?.lastName || "";
    if (fn || ln) return `${fn[0] || ""}${ln[0] || ""}`.toUpperCase() || "U";
    const name = session?.user?.name || session?.user?.email || "";
    return name.slice(0, 2).toUpperCase() || "U";
  };

  const onSaveUser = async (data: ProfileEditFormValues) => {
    if (!session?.accessToken || !session?.user?.id) return;

    try {
      const res = await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: email.trim(),
          gender: data.gender ? (data.gender as any) : undefined,
          age: data.age?.trim() ? Number(data.age) : undefined,
        },
        session.user.id
      );
      setUser(res.data);
      await updateSession({ name: `${data.firstName.trim()} ${data.lastName.trim()}` });
      toast.success("პროფილი წარმატებით განახლდა!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "პროფილის განახლება ვერ მოხერხდა");
    }
  };

  return (
    <ProfileLayout
      activeTab="info"
      title="პროფილი"
      subtitle="მართეთ თქვენი პირადი ინფორმაცია და ფავორიტი კითხვები"
    >
      <S.Card>
        <S.ProfileSummary>
          <S.AvatarCircle>{getUserInitials()}</S.AvatarCircle>
          <div>
            <S.ProfileName>
              {(user?.firstName || firstName) ? `${firstName || user?.firstName} ${lastName || user?.lastName}` : session?.user?.name || session?.user?.email}
            </S.ProfileName>
            <S.ProfileEmail>{email || session?.user?.email}</S.ProfileEmail>
            {user?.role && (
              <S.Badge variant="role">
                {user.role === "admin" ? <ShieldIcon size={14} /> : <UserIcon size={14} />}
                {user.role === "admin" ? "ადმინისტრატორი" : "მომხმარებელი"}
              </S.Badge>
            )}
            {user?.createdAt && (
              <S.Badge variant="date" style={{ marginLeft: "8px" }}>
                <CalendarIcon size={13} /> რეგისტრირებულია {new Date(user.createdAt).toLocaleDateString("ka-GE")}
              </S.Badge>
            )}
          </div>
        </S.ProfileSummary>

        {loadingUser ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "var(--ref-text-secondary)" }}>იტვირთება...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSaveUser)}>
            <S.FormGrid>
              <S.FormGroup>
                <S.Label>სახელი</S.Label>
                <S.Input
                  type="text"
                  $invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName && <S.FieldError>{errors.firstName.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>გვარი</S.Label>
                <S.Input
                  type="text"
                  $invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName && <S.FieldError>{errors.lastName.message}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ასაკი</S.Label>
                <S.Input
                  type="number"
                  min={AGE_MIN}
                  max={AGE_MAX}
                  $invalid={!!errors.age}
                  {...register("age")}
                />
                {errors.age && <S.FieldError>{errors.age.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სქესი</S.Label>
                <S.Select value={gender} onChange={(e) => setValue("gender", e.target.value as any)}>
                  <option value="" disabled hidden>
                    აირჩიეთ სქესი
                  </option>
                  <option value={UserGenderEnum.Male}>მამრობითი</option>
                  <option value={UserGenderEnum.Female}>მდედრობითი</option>
                </S.Select>
                {errors.gender && <S.FieldError>{errors.gender.message as string}</S.FieldError>}
              </S.FormGroup>
              <S.FormGroup>
                <S.Label>ელფოსტა</S.Label>
                <S.Input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                />
              </S.FormGroup>
            </S.FormGrid>

            <S.FormFooter>
              <S.ActionButton type="submit" variant="primary" disabled={savingUser}>
                {savingUser ? "ინახება..." : "ცვლილებების შენახვა"}
              </S.ActionButton>
            </S.FormFooter>
          </form>
        )}
      </S.Card>
    </ProfileLayout>
  );
};

export default ProfileComponent;
