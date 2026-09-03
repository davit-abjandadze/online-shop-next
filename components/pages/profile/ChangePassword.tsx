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
  const { lang, t } = useTranslation("profile");
  // ვალიდაციის შეტყობინებები common.json-შია (`validation-*`) — "common:" პრეფიქსით ვიღებთ.
  const tValidation = (key: string, query?: Record<string, unknown>) => t(`common:${key}`, query);

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: loading },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema(tValidation)),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <>
        <Header />
        <S.PageWrapper>
          <S.Container style={{ textAlign: "center", paddingTop: "100px" }}>
            <p style={{ fontSize: "16px", color: "var(--ref-text-secondary)" }}>{t("loading")}</p>
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
            <S.AccessDeniedTitle>{t("access-denied-title")}</S.AccessDeniedTitle>
            <S.AccessDeniedText>{t("access-denied-text")}</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              {t("back-to-home")}
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

      setSuccess(t("password-changed-success"));
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.message || t("password-change-failed");
      setError(msg);
    }
  };

  return (
    <ProfileLayout
      activeTab="password"
      title={t("change-password-title")}
      subtitle={t("change-password-subtitle")}
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
            <S.Label>{t("field-old-password")}</S.Label>
            <S.InputWrapper>
              <S.Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                $invalid={!!errors.oldPassword}
                {...register("oldPassword")}
              />
              <S.ToggleBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? t("hide-password") : t("show-password")}
              </S.ToggleBtn>
            </S.InputWrapper>
            {errors.oldPassword && <S.FieldError>{errors.oldPassword.message}</S.FieldError>}
          </S.FormGroup>

          <S.FormGroup style={{ marginBottom: "18px" }}>
            <S.Label>{t("field-new-password")}</S.Label>
            <S.InputWrapper>
              <S.Input
                type={showPassword ? "text" : "password"}
                placeholder={t("new-password-placeholder")}
                $invalid={!!errors.newPassword}
                {...register("newPassword")}
              />
            </S.InputWrapper>
            {errors.newPassword && <S.FieldError>{errors.newPassword.message}</S.FieldError>}
          </S.FormGroup>

          <S.FormGroup style={{ marginBottom: "18px" }}>
            <S.Label>{t("field-confirm-password")}</S.Label>
            <S.InputWrapper>
              <S.Input
                type={showPassword ? "text" : "password"}
                placeholder={t("confirm-password-placeholder")}
                $invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </S.InputWrapper>
            {errors.confirmPassword && <S.FieldError>{errors.confirmPassword.message}</S.FieldError>}
          </S.FormGroup>

          <S.FormFooter style={{ borderTop: "none", paddingTop: 0, marginTop: "8px" }}>
            <S.ActionButton type="submit" variant="primary" disabled={loading}>
              {loading ? t("changing-password") : t("change-password-button")}
            </S.ActionButton>
          </S.FormFooter>
        </form>
      </S.Card>
    </ProfileLayout>
  );
};

export default ChangePasswordComponent;
