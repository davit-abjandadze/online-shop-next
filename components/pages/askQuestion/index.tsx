import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/shared/Header";
import { CategoriesAPI, QuestionAPI } from "@/API_Client";
import { Category } from "@/API_Client/client/models";
import {
  CheckCircleIcon,
  HourglassIcon,
  LockIcon,
  PlusIcon,
  QuestionMarkIcon,
  TrashIcon,
  WarningIcon,
} from "@/components/ui/RefIcons";
import { AskQuestionFormValues, askQuestionSchema } from "./schemas";
import * as S from "./style";

const emptyForm: AskQuestionFormValues = {
  text: "",
  type: "single",
  categoryId: "",
  answers: [{ text: "" }, { text: "" }],
};

const MAX_ANSWERS = 4;

export const AskQuestionComponent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<AskQuestionFormValues>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: emptyForm,
  });
  const answersField = useFieldArray({ control: form.control, name: "answers" });

  const fetchCategories = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await CategoriesAPI(router.locale || "ka", session.accessToken).categoryControllerFindAll();
      const data = res.data as any;
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // ჩამონათვალის ჩატვირთვის შეცდომას მდუმარედ ვიგნორებთ
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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
            <S.AccessDeniedText>კითხვის დასამატებლად გთხოვთ გაიაროთ ავტორიზაცია.</S.AccessDeniedText>
            <S.ActionButton variant="primary" onClick={() => router.push("/")}>
              მთავარ გვერდზე დაბრუნება
            </S.ActionButton>
          </S.AccessDeniedCard>
        </S.PageWrapper>
      </>
    );
  }

  const answersError = () => {
    const err = form.formState.errors.answers as any;
    return err?.message || err?.root?.message;
  };

  const onSubmit = form.handleSubmit(async (data) => {
    if (!session?.accessToken) return;
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const validAnswers = data.answers.map((a) => a.text.trim()).filter((a) => a.length > 0);
      await QuestionAPI(router.locale || "ka", session.accessToken).questionControllerCreate({
        text: data.text.trim(),
        type: data.type as any,
        categoryId: Number(data.categoryId),
        answers: validAnswers.map((text) => ({ text })),
      });
      setSuccess(true);
      form.reset(emptyForm);
    } catch (err: any) {
      // Backend აბრუნებს ცალკე ტექსტს ორივე შესაძლო 409 შემთხვევისთვის
      // (დღეში 1 კითხვა / იმავე მოწყობილობიდან სხვა ანგარიშით) — პირდაპირ ვაჩვენებთ.
      setError(err?.response?.data?.message || "კითხვის დამატება ვერ მოხერხდა");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <>
      <Header />
      <S.PageWrapper>
        <S.Container>
          <S.HeaderSection>
            <S.PageTitle>
              <QuestionMarkIcon size={26} /> კითხვის დამატება
            </S.PageTitle>
            <S.PageSubtitle>
              დასვით საკუთარი კითხვა — ის გამოქვეყნდება მას შემდეგ, რაც ადმინისტრატორი დაადასტურებს.
            </S.PageSubtitle>
          </S.HeaderSection>

          <S.Card>
            {error && (
              <S.Alert>
                <WarningIcon size={16} /> {error}
              </S.Alert>
            )}
            {success && (
              <S.Alert success>
                <HourglassIcon size={16} /> თქვენი კითხვა წარმატებით გაიგზავნა და ამჟამად მოლოდინშია
                admin-ის დასტურამდე. დამტკიცების შემდეგ ის გამოჩნდება საიტზე.
              </S.Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
              <S.FormGroup>
                <S.Label>კითხვის ტექსტი</S.Label>
                <S.Input
                  type="text"
                  placeholder="მაგ: რომელ ქალაქს ანიჭებთ უპირატესობას?"
                  $invalid={!!form.formState.errors.text}
                  {...form.register("text")}
                />
                {form.formState.errors.text && <S.FieldError>{form.formState.errors.text.message}</S.FieldError>}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კატეგორია</S.Label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <S.Select
                      $invalid={!!form.formState.errors.categoryId}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">— აირჩიეთ კატეგორია —</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </S.Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <S.FieldError>{form.formState.errors.categoryId.message}</S.FieldError>
                )}
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>კითხვის ტიპი</S.Label>
                <S.Select {...form.register("type")}>
                  <option value="single">ერთარჩევიანი (Single Choice)</option>
                  <option value="multiple">მრავალარჩევიანი (Multiple Choice)</option>
                </S.Select>
              </S.FormGroup>

              <S.FormGroup>
                <S.Label>სავარაუდო პასუხები (მინიმუმ 2, მაქსიმუმ {MAX_ANSWERS})</S.Label>
                {answersField.fields.map((field, index) => (
                  <S.AnswerInputRow key={field.id}>
                    <S.Input
                      type="text"
                      placeholder={`პასუხის ვარიანტი ${index + 1}`}
                      {...form.register(`answers.${index}.text` as const)}
                    />
                    {answersField.fields.length > 2 && (
                      <S.ActionButton
                        type="button"
                        variant="secondary"
                        style={{ color: "var(--ref-danger)", padding: "10px 14px" }}
                        onClick={() => answersField.remove(index)}
                      >
                        <TrashIcon size={16} />
                      </S.ActionButton>
                    )}
                  </S.AnswerInputRow>
                ))}
                {answersError() && <S.FieldError>{answersError()}</S.FieldError>}
                {answersField.fields.length < MAX_ANSWERS && (
                  <S.ActionButton
                    type="button"
                    variant="outline"
                    style={{ marginTop: "8px", justifyContent: "center" }}
                    onClick={() => answersField.append({ text: "" })}
                  >
                    <PlusIcon size={14} /> პასუხის ვარიანტის დამატება
                  </S.ActionButton>
                )}
              </S.FormGroup>

              <S.FormFooter>
                <S.ActionButton type="submit" variant="primary" disabled={submitting}>
                  <CheckCircleIcon size={16} /> {submitting ? "იგზავნება..." : "კითხვის გაგზავნა"}
                </S.ActionButton>
              </S.FormFooter>
            </form>
          </S.Card>
        </S.Container>
      </S.PageWrapper>
    </>
  );
};

export default AskQuestionComponent;
