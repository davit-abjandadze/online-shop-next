import { useSession } from "next-auth/react";

/**
 * ცენტრალიზებული role-based access ჰუკი ადმინის დეშბორდისთვის.
 * აერთიანებს სესიის სტატუსისა და `admin` როლის შემოწმებას, რომელიც
 * აქამდე დუბლირებული იყო `DashboardLayout`-სა და თითოეულ დეშბორდის გვერდზე.
 */
export const useAdminGuard = () => {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAdmin = status === "authenticated" && session?.user?.role?.toLowerCase() === "admin";
  const isDenied = !isLoading && !isAdmin;

  return { session, status, isLoading, isAdmin, isDenied };
};

export default useAdminGuard;
