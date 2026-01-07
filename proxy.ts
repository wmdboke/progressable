import { auth } from "./auth";

export default auth((req) => {
  // req.auth will contain session info
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
