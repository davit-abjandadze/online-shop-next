import { useEffect } from "react";
import { useRouter } from "next/router";

export { getAdminServerSideProps as getServerSideProps } from "@/utils/getAdminServerSideProps";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/products");
  }, [router]);

  return null;
}
