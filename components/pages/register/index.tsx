import React, { useState } from "react";
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
import { AuthAPI } from "@/API_Client";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterForm: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z
    .object({
      firstName: z
        .string()
        .min(1, t("register-validation-first-name-required"))
        .min(2, t("register-validation-first-name-min")),
      lastName: z
        .string()
        .min(1, t("register-validation-last-name-required"))
        .min(2, t("register-validation-last-name-min")),
      email: z
        .string()
        .min(1, t("register-validation-email-required"))
        .email(t("register-validation-email-invalid")),
      password: z
        .string()
        .min(1, t("register-validation-password-required"))
        .min(6, t("register-validation-password-min")),
      confirmPassword: z
        .string()
        .min(1, t("register-validation-confirm-password-required")),
    })
    .refine((data) => data.confirmPassword === data.password, {
      message: t("register-validation-confirm-password-match") as string,
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
  });

  const { lang } = useTranslation("common");
  const session = useSession();

  const registration = async (data: RegisterFormValues) => {
    const resp = await (
      await AuthAPI(
        lang,
        session?.data?.accessToken ?? ""
      ).authControllerRegister({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
    ).data;

    console.log(resp, "xxx");
    return resp;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      const resp = await registration(data);

      // შეამოწმე შენი ბექენდის სტატუსი (თუ წარმატებულია, აგრძელებს ლოგინს)
      if (resp?.statusCode && resp.statusCode !== 200) {
        setServerError(resp?.message || t("register-error-generic"));
        return;
      }

      toast.success(t("register-success") as string);

      // რეგისტრაციის მერე ავტომატური ავტორიზაცია
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        router.push("/login");
      } else {
        router.push("/");
      }
    } catch (error) {
      setServerError(t("register-error-network"));
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(session.data?.accessToken, "accessToken");

  return (
    <S.Wrapper>
      <S.Card>
        <S.Title>{t("register-title")}</S.Title>
        <S.Subtitle>{t("register-subtitle")}</S.Subtitle>

        {serverError && <S.ErrorBanner>{serverError}</S.ErrorBanner>}

        <Form onSubmit={handleSubmit(onSubmit)} isLoading={isSubmitting}>
          <S.Fields>
            <S.Row>
              <TextInput
                label={t("register-first-name")}
                placeholder={t("register-first-name-placeholder")}
                validationData={{
                  name: "firstName",
                  onChange: register("firstName").onChange,
                  onBlur: register("firstName").onBlur,
                  ref: register("firstName").ref,
                  invalid: !!errors.firstName,
                  errorMessage: errors.firstName?.message,
                }}
              />
              <TextInput
                label={t("register-last-name")}
                placeholder={t("register-last-name-placeholder")}
                validationData={{
                  name: "lastName",
                  onChange: register("lastName").onChange,
                  onBlur: register("lastName").onBlur,
                  ref: register("lastName").ref,
                  invalid: !!errors.lastName,
                  errorMessage: errors.lastName?.message,
                }}
              />
            </S.Row>

            <TextInput
              label={t("register-email")}
              placeholder={t("register-email-placeholder")}
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
              label={t("register-password")}
              placeholder={t("register-password-placeholder")}
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

            <TextInput
              label={t("register-confirm-password")}
              placeholder={t("register-confirm-password-placeholder")}
              type="password"
              validationData={{
                name: "confirmPassword",
                onChange: register("confirmPassword").onChange,
                onBlur: register("confirmPassword").onBlur,
                ref: register("confirmPassword").ref,
                invalid: !!errors.confirmPassword,
                errorMessage: errors.confirmPassword?.message,
              }}
            />

            <S.SubmitWrapper>
              <Button
                type="submit"
                variant="primary"
                fill
                isLoading={isSubmitting}
              >
                {t("register-submit")}
              </Button>
            </S.SubmitWrapper>
          </S.Fields>
        </Form>

        <S.Footer>
          {t("register-have-account")}{" "}
          <a href="/login">{t("register-login-link")}</a>
        </S.Footer>
      </S.Card>
    </S.Wrapper>
  );
};

export default RegisterForm;
