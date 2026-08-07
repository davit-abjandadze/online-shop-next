import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/questions");
  }, [router]);

  return null;
}
