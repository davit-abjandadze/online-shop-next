import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import GoogleProvider from "next-auth/providers/google"; // ← ეს


export const authOptions: NextAuthOptions = {
  providers: [

     // ← 2. დაამატე Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const loginData = {
          email: String(credentials.email),
          password: String(credentials.password),
        };
        
        const targetUrl = `${API_URL}/auth/login`;

        try {
          const response = await axios.post(targetUrl, loginData, {
            headers: {
              "Content-Type": "application/json",
            },
            validateStatus: () => true,
          });

          const data = response.data;

          if (response.status !== 200 || !data || !data.access_token || !data.user) {
            return null;
          }

          return {
            id: String(data.user.id),
            name: data.user.firstName && data.user.lastName
              ? `${data.user.firstName} ${data.user.lastName}`
              : data.user.email,
            email: data.user.email,
            access_token: data.access_token,
            role: data.user.role,
          };
        } catch (error: any) {
          console.error("NextAuth Authorize Error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET || "your-super-secret-key",

  callbacks: {

// ⭐ 3. ახალი signIn callback: Google-ით შესვლისას ვუკავშირდებით ბექენდს
        async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const response = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              // ⭐ აქ გამოვიყენეთ 'as any' TypeScript-ის ერორის ასაცილებლად
              firstName: (profile as any)?.given_name || "",
              lastName: (profile as any)?.family_name || "",
            }),
          });

          const data = await response.json();

          if (response.ok && data.access_token) {
            (user as any).access_token = data.access_token;
            (user as any).role = data.user.role;
            (user as any).id = String(data.user.id);
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google Sign In Error:", error);
          return false;
        }
      }
      return true;
    },


    async jwt({ token, user }) {
      if (user) {
        token.access_token = (user as any).access_token;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.access_token as string;
        if (session.user) {
          (session.user as any).role = token.role;
        }
      }
      return session;
    },
  },
};

const nextAuthHandler = NextAuth(authOptions);

export default async function handler(req: any, res: any) {
  // Next.js Dev Server-ის ცნობილი ბაგის პრევენცია:
  // 401 სტატუსის დროს Dev Server ცდილობს შიდა _error გვერდის ჩატვირთვას.
  // 401-ის 200-ით ჩანაცვლებით NextAuth-ის { url: "...?error=CredentialsSignin" } პასუხი
  // უპრობლემოდ მიეწოდება კლიენტს (signIn) და ფრონტზე გამოაქვს არასწორი პაროლის შეტყობინება 500-ის გარეშე.
  const originalStatus = res.status.bind(res);
  res.status = (statusCode: number) => {
    if (statusCode === 401 && req.url?.includes("callback/credentials")) {
      return originalStatus(200);
    }
    return originalStatus(statusCode);
  };

  try {
    return await nextAuthHandler(req, res);
  } catch (err: any) {
    return originalStatus(500).json({ error: err?.message || String(err) });
  }
}




