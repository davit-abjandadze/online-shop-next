import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/shared/Header";
import { AuthAPI } from "@/API_Client";
import useTranslation from "next-translate/useTranslation";
import { CheckCircleIcon, LockIcon, WarningIcon } from "@/components/ui/RefIcons";
import { ProfileLayout } from "./ProfileLayout";
import * as S from "./style";
import {
  ChangePasswordFormValues,
  changePasswordSchema,
} from "@/components/shared/validation/schemas";

export const ChangePasswordComponent: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { lang } = useTranslation("common");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: loading },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

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

  const changePassword = async (data: ChangePasswordFormValues) => {
    const resp = await (
      await AuthAPI(lang, session?.accessToken ?? "").authControllerChangePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
    ).data;

    return resp;
  };

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setError(null);
    setSuccess(null);

    try {
      await changePassword(data);

      setSuccess("პაროლი წარმატებით შეიცვალა");
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "პაროლის შეცვლა ვერ მოხერხდა";
      setError(msg);
    }
  };

  return (
    <ProfileLayout
      activeTab="password"
      title="პაროლის შეცვლა"
      subtitle="შეიყვანეთ მიმდინარე და ახალი პაროლი"
    >
      <S.Card>
        {error && (
          <S.Alert>
            <WarningIcon size={16} /> {error}
          </S.Alert>
        )}
        {success && (
          <S.Alert success>
            <CheckCircleIcon size={16} /> {success}
          </S.Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <S.FormGroup style={{ marginBottom: "18px" }}>
            <S.Label>მიმდინარე პაროლი</S.Label>
            <S.InputWrapper>
              <S.Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                $invalid={!!errors.oldPassword}
                {...register("oldPassword")}
              />
              <S.ToggleBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "დამალვა" : "ჩვენება"}
              </S.ToggleBtn>
            </S.InputWrapper>
            {errors.oldPassword && <S.FieldError>{errors.oldPassword.message}</S.FieldError>}
          </S.FormGroup>

          <S.FormGroup style={{ marginBottom: "18px" }}>
            <S.Label>ახალი პაროლი</S.Label>
            <S.InputWrapper>
              <S.Input
                type={showPassword ? "text" : "password"}
                placeholder="მინიმუმ 6 სიმბოლო"
                $invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
            </S.InputWrapper>
            {errors.newPassword && <S.FieldError>{errors.newPassword.message}</S.FieldError>}
          </S.FormGroup>

          <S.FormGroup style={{ marginBottom: "18px" }}>
            <S.Label>გაიმეორეთ ახალი პაროლი</S.Label>
            <S.InputWrapper>
              <S.Input
                type={showPassword ? "text" : "password"}
                placeholder="გაიმეორეთ ახალი პაროლი"
                $invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </S.InputWrapper>
            {errors.confirmPassword && <S.FieldError>{errors.confirmPassword.message}</S.FieldError>}
          </S.FormGroup>

          <S.FormFooter style={{ borderTop: "none", paddingTop: 0, marginTop: "8px" }}>
            <S.ActionButton type="submit" variant="primary" disabled={loading}>
              {loading ? "მიმდინარეობს შეცვლა..." : "პაროლის შეცვლა"}
            </S.ActionButton>
          </S.FormFooter>
        </form>
      </S.Card>
    </ProfileLayout>
  );
};

export default ChangePasswordComponent;
