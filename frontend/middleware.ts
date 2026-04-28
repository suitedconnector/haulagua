import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isProtectedPage = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedPage && !isAuth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}