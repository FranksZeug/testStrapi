export type PreviewStatus = 'draft' | 'published';

export type StrapiPublication = Record<string, unknown>;

function pickDocumentFromResponse(json: { data?: unknown }): StrapiPublication | null {
  const d = json.data;
  if (d == null) return null;
  // Bei i18n kann GET /api/.../:documentId?locale=… eine Liste liefern
  if (Array.isArray(d)) {
    const first = d[0];
    return first && typeof first === 'object' ? (first as StrapiPublication) : null;
  }
  if (typeof d === 'object') return d as StrapiPublication;
  return null;
}

async function strapiGet(url: string, apiToken: string): Promise<{ ok: boolean; status: number; body: string }> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiToken}` },
    cache: 'no-store',
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

function buildPublicationUrl(
  base: string,
  mode: 'one' | 'list',
  documentId: string,
  options: { status: PreviewStatus; locale?: string; populate?: string }
): string {
  const root = base.replace(/\/$/, '');
  if (mode === 'one') {
    const url = new URL(`${root}/api/publications/${encodeURIComponent(documentId)}`);
    if (options.populate) url.searchParams.set('populate', options.populate);
    url.searchParams.set('status', options.status);
    if (options.locale) url.searchParams.set('locale', options.locale);
    return url.toString();
  }
  const url = new URL(`${root}/api/publications`);
  url.searchParams.set('filters[documentId][$eq]', documentId);
  if (options.populate) url.searchParams.set('populate', options.populate);
  url.searchParams.set('status', options.status);
  if (options.locale) url.searchParams.set('locale', options.locale);
  return url.toString();
}

/**
 * Lädt eine Publikation per REST (Strapi v5).
 * Fallbacks: Listen-Filter bei 404, bei Entwurf zusätzlich „published“.
 * @see https://docs.strapi.io/cms/api/rest/status
 */
export async function fetchPublicationPreview(options: {
  documentId: string;
  locale?: string;
  status: PreviewStatus;
  strapiUrl: string;
  apiToken: string;
}): Promise<StrapiPublication> {
  const { documentId, locale, status, strapiUrl, apiToken } = options;

  if (!apiToken.trim()) {
    throw new Error(
      'STRAPI_API_TOKEN fehlt. Lege in Strapi unter Settings → API Tokens ein Token an (für Entwürfe: „Full access" oder Custom mit Zugriff auf Entwürfe).'
    );
  }

  const attempts: Array<{ status: PreviewStatus; populate?: string }> = [
    { status, populate: '*' },
    { status },
  ];

  if (status === 'draft') {
    attempts.push({ status: 'published', populate: '*' });
    attempts.push({ status: 'published' });
  }

  let lastDetail = '';

  for (const att of attempts) {
    for (const mode of ['one', 'list'] as const) {
      const url = buildPublicationUrl(strapiUrl, mode, documentId, {
        status: att.status,
        locale,
        populate: att.populate,
      });

      const { ok, status: httpStatus, body } = await strapiGet(url, apiToken);
      lastDetail = `HTTP ${httpStatus}: ${body.slice(0, 350)}`;

      if (!ok) {
        if (httpStatus === 404) continue;
        throw new Error(`Strapi ${lastDetail}`);
      }

      let json: { data?: unknown };
      try {
        json = JSON.parse(body) as { data?: unknown };
      } catch {
        throw new Error(`Strapi: keine JSON-Antwort. ${lastDetail}`);
      }

      const doc = pickDocumentFromResponse(json);
      if (doc) return doc;
    }
  }

  throw new Error(
    `Strapi: Publikation nicht gefunden (404 nach mehreren Versuchen). ` +
      `Häufig: API-Token ist nur „Read-only" und darf keine Entwürfe lesen — in Strapi ein Token mit „Full access" (oder Custom-Rechten inkl. Draft) verwenden. ` +
      `Außerdem prüfen: documentId, Locale und ob die Publikation unter „Settings → Users & Permissions → Roles" für die Rolle „Authenticated" bzw. Token sichtbar ist. ` +
      `Technisch: ${lastDetail}`
  );
}

/** Strapi v4-ähnliche { attributes } oder flache v5-Felder vereinheitlichen */
export function flattenEntry(entry: StrapiPublication): Record<string, unknown> {
  const attrs = entry.attributes;
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    return { ...entry, ...(attrs as Record<string, unknown>) };
  }
  return entry;
}
