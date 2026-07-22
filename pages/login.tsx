import { useState } from "react";
import Header from "@/components/shared/Header";
import AuthModal from "@/components/shared/AuthModal";

export default function LoginPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Header onOpenAuth={() => setModalOpen(true)} />
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
}
