import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/products");
  }, [router]);

  return null;
}
