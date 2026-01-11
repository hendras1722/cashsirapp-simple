import { NextResponse } from 'next/server'

// const PUBLIC_ROUTES  = ["/"];
// const AUTH_ROUTES    = ["/login", "/register", "/change-password", "/forgot-password", "/callback"];
// const PATH_PROTECTED = ["/admin"];

export default async function middleware() {
  console.log('Boilerplate Next Syahendra A')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
