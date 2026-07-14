import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Admin pages are strictly English, bypass i18n completely
  if (pathname.startsWith('/admin')) {
    return; // Pass through
  }

  // Next-intl handles the rest
  return handleI18nRouting(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
