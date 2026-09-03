import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useTranslation from "next-translate/useTranslation";
import * as S from "@/components/shared/AuthModal/style";
import { CloseIcon, WarningIcon } from "@/components/ui/RefIcons";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import MobilePopup from "@/components/ui/MobilePopup";
import { UserAPI } from "@/API_Client";
import {
  CompleteProfileFormValues,
  completeProfileSchema,
} from "@/components/shared/validation/schemas";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  // მოსახმარებელი ბოლომდე ავსებს ასაკს და სქესს — გამოძახდება წარმატებული შენახვის შემდეგ
  onCompleted: () => void;
}

// ხმის მიცემისას თუ ავტორიზებულ მომხმარებელს არ აქვს შევსებული ასაკი და სქესი,
// ეს მოდალი ითხოვს მათ შევსებას (მობილურზე MobilePopup-ის სახით).
export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const isMobile = useIsMobileDevice();
  // ვალიდაციის შეტყობინებები common.json-შია (`validation-*`) — ამ მოდალს ცალკე
  // page-level namespace არ აქვს, ამიტომ პირდაპირ "common"-ს ვიღებთ.
  const { t } = useTranslation("common");

  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: loading },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema(t)),
    defaultValues: { age: "", gender: undefined },
  });

  const age = watch("age");
  const gender = watch("gender");

  if (!isOpen) return null;

  const onSubmit = async (data: CompleteProfileFormValues) => {
    setError(null);

    if (!session?.accessToken || !session?.user?.id) {
      setError(t("complete-profile-error-auth"));
      return;
    }

    try {
      await UserAPI(router.locale || "ka", session.accessToken).usersControllerUpdate(
        session.user.id,
        {
          age: Number(data.age),
          gender: data.gender as any,
        }
      );
      toast.success(t("complete-profile-success"));
      onCompleted();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("complete-profile-error-generic"));
    }
  };

  const content = (
    <>
      <S.ModalHeader>
        <S.Title>{t("complete-profile-title")}</S.Title>
        <S.CloseButton onClick={onClose} aria-label="Close">
          <CloseIcon size={16} />
        </S.CloseButton>
      </S.ModalHeader>

      <div style={{ padding: "0 28px", marginTop: "16px" }}>
        <p style={{ fontSize: "14px", color: "var(--ref-text-secondary)", margin: 0 }}>
          {t("complete-profile-description")}
        </p>
        {error && (
          <S.ErrorAlert style={{ marginTop: "16px" }}>
            <WarningIcon size={16} /> {error}
          </S.ErrorAlert>
        )}
      </div>

      <S.FormContainer onSubmit={handleSubmit(onSubmit)}>
        <S.FormGroup>
          <S.Label>{t("complete-profile-age-label")}</S.Label>
          <S.Input
            type="number"
            placeholder={t("complete-profile-age-placeholder")}
            min={14}
            max={120}
            value={age}
            onChange={(e) => setValue("age", e.target.value)}
            $invalid={!!errors.age}
          />
          {errors.age && <S.FieldError>{errors.age.message}</S.FieldError>}
        </S.FormGroup>

        <S.FormGroup>
          <S.Label>{t("complete-profile-gender-label")}</S.Label>
          <S.GenderSwitch>
            <S.GenderThumb position={gender === "female" ? "right" : "left"} />
            <S.GenderOption
              type="button"
              active={gender === "male"}
              onClick={() => setValue("gender", "male")}
            >
              {t("complete-profile-gender-male")}
            </S.GenderOption>
            <S.GenderOption
              type="button"
              active={gender === "female"}
              onClick={() => setValue("gender", "female")}
            >
              {t("complete-profile-gender-female")}
            </S.GenderOption>
          </S.GenderSwitch>
          {errors.gender && <S.FieldError>{errors.gender.message}</S.FieldError>}
        </S.FormGroup>

        <S.SubmitButton type="submit" disabled={loading}>
          {loading ? t("complete-profile-submitting") : t("complete-profile-submit")}
        </S.SubmitButton>
      </S.FormContainer>
    </>
  );

  if (isMobile) {
    return (
      <MobilePopup onClose={onClose} overflowScroll>
        {content}
      </MobilePopup>
    );
  }

  return (
    <S.Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>{content}</S.ModalContainer>
    </S.Overlay>
  );
};

export default CompleteProfileModal;
