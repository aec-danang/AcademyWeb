import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Admin pages are strictly English, bypass i18n completely
  if (pathname.startsWith('/management')) {
    return; // Pass through
  }

  const isElearning = pathname.startsWith('/elearning') || pathname.startsWith('/en/elearning') || pathname.startsWith('/vi/elearning');

  const handleI18nRouting = createMiddleware({
    locales: ['vi', 'en'],
    // Elearning defaults to english, everything else defaults to vietnamese
    defaultLocale: isElearning ? 'en' : 'vi',
    localePrefix: 'as-needed'
  });

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
