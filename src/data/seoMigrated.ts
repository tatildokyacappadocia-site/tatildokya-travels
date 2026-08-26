export const SITE_URL = 'https://tatildokya.com';

export function normalizePath(input = '/') {
  let value = String(input || '/').trim();

  if (/^https?:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {}
  }

  value = value.split('#')[0].split('?')[0] || '/';

  if (!value.startsWith('/')) value = `/${value}`;

  value = value.replace(/\/{2,}/g, '/');

  if (
    value !== '/' &&
    !value.endsWith('/') &&
    !/\.[a-z0-9]{2,6}$/i.test(value)
  ) {
    value += '/';
  }

  return value;
}

export function canonicalUrl(input = '/') {
  return `${SITE_URL}${normalizePath(input)}`;
}

/**
 * Keep the page's own title and description as the source of truth.
 * seoAdmin.generated.ts can override these later inside SeoHead.astro.
 *
 * This intentionally does NOT invent or replace page copy.
 */
export function resolveSeo(
  inputPath = '/',
  fallbackTitle = 'Tatildokya Travels',
  fallbackDescription = ''
) {
  const path = normalizePath(inputPath);

  return {
    path,
    title: fallbackTitle || 'Tatildokya Travels',
    description: fallbackDescription || '',
    focusKeyword: '',
  };
}

/**
 * Build hreflang alternatives only for normal /en/, /tr/, /es/ routes.
 * Legacy root redirects and admin/API paths should not generate fake alternates.
 */
export function alternateUrls(inputPath = '/') {
  const path = normalizePath(inputPath);

  if (
    path.startsWith('/admin/') ||
    path.startsWith('/api/') ||
    path === '/admin/' ||
    path === '/api/'
  ) {
    return [];
  }

  const match = path.match(/^\/(en|tr|es)(\/.*)?$/i);
  if (!match) return [];

  const suffix = match[2] || '/';

  return [
    { lang: 'en', href: `${SITE_URL}/en${suffix}` },
    { lang: 'tr', href: `${SITE_URL}/tr${suffix}` },
    { lang: 'es', href: `${SITE_URL}/es${suffix}` },
  ];
}
