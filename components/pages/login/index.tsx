import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import Form from "@/components/ui/Form";
import * as S from "./style";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session } = useSession();

  const schema = z.object({
    email: z
      .string()
      .min(1, t("login-validation-email-required"))
      .email(t("login-validation-email-invalid")),
    password: z.string().min(1, t("login-validation-password-required")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setServerError(t("login-error-invalid"));
        return;
      }

      toast.success(t("login-success") as string);
      router.push((router.query.callbackUrl as string) || "/");
    } catch {
      setServerError(t("login-error-network"));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log(session);
  }, [session]);

  return (
    <S.Wrapper>
      <S.Card>
        <S.Title>{t("login-title")}</S.Title>
        <S.Subtitle>{t("login-subtitle")}</S.Subtitle>

        {serverError && <S.ErrorBanner>{serverError}</S.ErrorBanner>}

        <Form onSubmit={handleSubmit(onSubmit)} isLoading={isSubmitting}>
          <S.Fields>
            <TextInput
              label={t("login-email")}
              placeholder={t("login-email-placeholder")}
              type="email"
              validationData={{
                name: "email",
                onChange: register("email").onChange,
                onBlur: register("email").onBlur,
                ref: register("email").ref,
                invalid: !!errors.email,
                errorMessage: errors.email?.message,
              }}
            />

            <TextInput
              label={t("login-password")}
              placeholder={t("login-password-placeholder")}
              type="password"
              validationData={{
                name: "password",
                onChange: register("password").onChange,
                onBlur: register("password").onBlur,
                ref: register("password").ref,
                invalid: !!errors.password,
                errorMessage: errors.password?.message,
              }}
            />

            <S.ForgotPassword>
              <a href="/forgot-password">{t("login-forgot-password")}</a>
            </S.ForgotPassword>

            <S.SubmitWrapper>
              <Button
                type="submit"
                variant="primary"
                fill
                isLoading={isSubmitting}
              >
                {t("login-submit")}
              </Button>
            </S.SubmitWrapper>
          </S.Fields>
        </Form>

        <S.Footer>
          {t("login-no-account")}{" "}
          <a href="/register">{t("login-register-link")}</a>
        </S.Footer>
      </S.Card>
    </S.Wrapper>
  );
};

export default LoginForm;
