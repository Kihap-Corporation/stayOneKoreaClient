// Temporarily disable next-intl middleware to avoid 404 issues
// import createMiddleware from 'next-intl/middleware';

// export default createMiddleware({
//   // A list of all locales that are supported
//   locales: ['ko', 'en', 'zh', 'fr'],

//   // Used when no locale matches
//   defaultLocale: 'ko',

//   // Only add locale prefix when necessary
//   localePrefix: 'as-needed'
// });

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(ko|en|zh|fr)/:path*']
// };

// For now, use a simple middleware that doesn't interfere
export default function middleware() {
  // No-op middleware
}
