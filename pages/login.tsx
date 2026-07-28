import { useState } from "react";
import Header from "@/components/shared/Header";
import AuthModal from "@/components/shared/AuthModal";

export default function LoginPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F8FA" }}>
      <Header onOpenAuth={() => setModalOpen(true)} />
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
}
