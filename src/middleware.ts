import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // If the request is for the login page, we don't want to redirect
    // console.log(request.nextUrl.pathname)
    if (!request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};