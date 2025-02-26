import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  const { data } = await supabase.auth.getSession()

  const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || request.nextUrl.origin

  // If there's no session and the user is trying to access a protected route
  if (!data.session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", productionUrl))
  }

  // If there's a session and the user is trying to access auth routes
  if (
    data.session &&
    (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", productionUrl))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}

