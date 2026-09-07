import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

/**
 * სერვერ-საიდზე ადმინის დაცვა /dashboard/* გვერდებისთვის.
 *
 * აქამდე ადმინის დეშბორდი მხოლოდ კლიენტ-საიდზე იყო დაცული (`useAdminGuard` /
 * `DashboardLayout`), რაც ნიშნავდა, რომ HTML/JS ბანდლი და თავად გვერდის
 * getServerSideProps-ის ბლოკები (თუ იქნებოდა) ნებისმიერი ვიზიტორისთვის
 * გამოითვლებოდა სერვერზე — access guard მხოლოდ React render-ის შემდეგ ჩნდებოდა
 * ბრაუზერში, ხოლო SSR-ის დროს გვერდი მარტივად "flash"-დებოდა ადმინის კონტენტით
 * არაავტორიზებულ მომხმარებელზეც (view-source/no-JS-ზეც კი ხელმისაწვდომი იყო).
 * ეს ჰელპერი session-ს (და role-ს) სერვერზე ამოწმებს და non-admin-ს
 * getServerSideProps დონეზევე რედირექტავს — გვერდის React კოდი საერთოდ არ
 * ირენდერება არაავტორიზებულისთვის.
 */
export async function getAdminServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, never>>> {
  const session = await getServerSession(context.req, context.res, authOptions);
  const role = (session?.user as any)?.role;
  const isAdmin = typeof role === "string" && role.toLowerCase() === "admin";

  if (!isAdmin) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
}
