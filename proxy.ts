import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 定义路由
  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isProtectedPage = nextUrl.pathname.startsWith('/dashboard');
  const isHomePage = nextUrl.pathname === '/';

  // 如果已登录，访问认证页面（登录/注册）或首页 → 重定向到 dashboard
  if (isLoggedIn && (isAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // 如果未登录，访问受保护页面 → 重定向到登录页
  if (!isLoggedIn && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 其他情况正常访问
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
