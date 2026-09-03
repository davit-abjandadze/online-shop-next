import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE } from "@/constants";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NextAuth და ყველა API route, _next და static ფაილები უნდა გაიაროს უცვლელად
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (req.nextUrl.locale === "default") {
    const locale = DEFAULT_LOCALE;

    return NextResponse.redirect(
      new URL(`/${locale}${pathname}${req.nextUrl.search}`, req.url)
    );
  }

  return NextResponse.next();
}

// NOTE: matcher config ამოღებულია next-translate-routes-ის და Next.js-ის
// ცნობილი ბაგის გამო (matcher + rewrites იწვევს API routes-ის 500 შეცდომას).
// ფილტრაცია ხდება პირდაპირ middleware ფუნქციის შიგნით conditional statements-ით.
