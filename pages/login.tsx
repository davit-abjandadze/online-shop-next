import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { toast } from "react-toastify";
import Header from "@/components/shared/Header";
import AuthModal, { AuthMode } from "@/components/shared/AuthModal";

export default function LoginPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  // ?mode=forgot — reset-password გვერდის "ახალი ბმულის მოთხოვნა" პირდაპირ
  // პაროლის აღდგენის რეჟიმში ხსნის მოდალს (ცალკე /forgot-password გვერდი არ არსებობს).
  const initialMode: AuthMode = router.query.mode === "forgot" ? "forgot" : "login";

  // API_Client-ის 401 interceptor (?sessionExpired=1) და ChangePassword
  // (?passwordChanged=1) აქ გადმოდიან — ადრე ეს მხოლოდ გამოუყენებელ
  // components/pages/login-ში იკითხებოდა და მომხმარებელი უბრალოდ გამოსული ხვდებოდა.
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.sessionExpired) toast.error(t("session-expired") as string);
    if (router.query.passwordChanged) toast.success(t("password-changed-relogin") as string);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F8FA" }}>
      <Head>
        <title>{`${t("login-page-title")} - ${t("default-page-title")}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Header onOpenAuth={() => setModalOpen(true)} />
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={initialMode}
      />
    </div>
  );
}
