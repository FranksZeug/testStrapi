import { flattenEntry, fetchPublicationPreview } from '@/lib/strapi';
import { strapiRichTextToHtml } from '@/lib/strapi-rich-text';
import styles from './preview.module.css';

type SearchParams = {
  documentId?: string;
  secret?: string;
  locale?: string;
  status?: string;
};

function normalizeRelationArray(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && 'data' in (value as object)) {
    const d = (value as { data: unknown }).data;
    if (Array.isArray(d)) return d;
    if (d != null && typeof d === 'object') return [d];
    return [];
  }
  return [value];
}

function RelationTitles(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  const list = normalizeRelationArray(value);
  const parts: string[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const inner = o.attributes && typeof o.attributes === 'object' ? (o.attributes as Record<string, unknown>) : o;
    const title =
      (typeof inner.title === 'string' && inner.title) ||
      (typeof inner.name === 'string' && inner.name) ||
      (typeof inner.path === 'string' && inner.path) ||
      (typeof o.documentId === 'string' && o.documentId) ||
      '';
    if (title) parts.push(title);
  }
  return parts.join(', ');
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const expected = process.env.PREVIEW_SECRET;
  const secret = sp.secret ?? '';

  if (!expected || secret !== expected) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Vorschau</h1>
        <p className={styles.muted}>Ungültiges oder fehlendes Vorschau-Geheimnis (`secret`).</p>
      </div>
    );
  }

  const documentId = sp.documentId?.trim();
  if (!documentId) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Vorschau</h1>
        <p className={styles.muted}>Parameter <code>documentId</code> fehlt.</p>
      </div>
    );
  }

  const strapiUrl = process.env.STRAPI_URL;
  const apiToken = process.env.STRAPI_API_TOKEN;
  if (!strapiUrl || !apiToken) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Vorschau</h1>
        <p className={styles.error}>
          Server-Konfiguration unvollständig: <code>STRAPI_URL</code> und <code>STRAPI_API_TOKEN</code> setzen
          (siehe <code>.env.example</code>).
        </p>
      </div>
    );
  }

  const status = sp.status === 'published' ? 'published' : 'draft';
  const locale = sp.locale?.trim() || undefined;

  let doc: Record<string, unknown>;
  try {
    const raw = await fetchPublicationPreview({
      documentId,
      locale,
      status,
      strapiUrl,
      apiToken,
    });
    doc = flattenEntry(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Vorschau</h1>
        <p className={styles.error}>{msg}</p>
      </div>
    );
  }

  const title = typeof doc.title === 'string' ? doc.title : '';
  const subtitle = typeof doc.subtitle === 'string' ? doc.subtitle : '';
  const abstractHtml = strapiRichTextToHtml(doc.Abstract ?? doc.abstract);
  const publicationDate =
    (typeof doc.Publikationsdatum === 'string' && doc.Publikationsdatum) ||
    (typeof doc.publication_date === 'string' && doc.publication_date) ||
    '';
  const doi =
    (typeof doc.Doi === 'string' && doc.Doi) ||
    (typeof doc.doi === 'string' && doc.doi) ||
    '';

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.badge}>
          Vorschau · {status === 'draft' ? 'Entwurf' : 'Veröffentlicht'}
          {locale ? ` · ${locale}` : ''}
        </p>
        <h1 className={styles.title}>{title || '(ohne Titel)'}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <dl className={styles.meta}>
        {publicationDate ? (
          <>
            <dt>Erscheinungsdatum</dt>
            <dd>{publicationDate}</dd>
          </>
        ) : null}
        {doi ? (
          <>
            <dt>DOI</dt>
            <dd>{doi}</dd>
          </>
        ) : null}
        <dt>Autor:innen</dt>
        <dd>{RelationTitles(doc.Autoren ?? doc.authors) || '—'}</dd>
        <dt>Publikationstyp</dt>
        <dd>{RelationTitles(doc.Publikationsart ?? doc.publication_type) || '—'}</dd>
        <dt>Schlagwörter</dt>
        <dd>{RelationTitles(doc.keywords) || '—'}</dd>
        <dt>Themen</dt>
        <dd>{RelationTitles(doc.Themen ?? doc.topics) || '—'}</dd>
      </dl>

      {abstractHtml ? (
        <section className={styles.section}>
          <h2>Kurzfassung</h2>
          <div className={styles.rich} dangerouslySetInnerHTML={{ __html: abstractHtml }} />
        </section>
      ) : null}
    </div>
  );
}
