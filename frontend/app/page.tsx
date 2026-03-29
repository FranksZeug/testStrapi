import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>Publikations-Vorschau</h1>
        <p className={styles.lead}>
          Dieses Next.js-Frontend lädt Entwürfe oder veröffentlichte Publikationen aus Strapi – nur mit gültigem{' '}
          <code>secret</code> und Server-seitigem API-Token.
        </p>
        <section className={styles.section}>
          <h2>Beispiel-URL</h2>
          <pre className={styles.pre}>
            {`/preview?documentId=DEINE_DOCUMENT_ID&secret=DEIN_PREVIEW_SECRET&status=draft&locale=de`}
          </pre>
          <p className={styles.hint}>
            <code>status</code>: <code>draft</code> (Standard) oder <code>published</code>. <code>locale</code>{' '}
            nur setzen, wenn die Publikation lokalisiert ist.
          </p>
        </section>
        <p>
          <Link className={styles.link} href="/preview">
            Zur Vorschau-Route (ohne Parameter → Hinweis)
          </Link>
        </p>
        <p className={styles.hint}>
          Konfiguration: <code>frontend/.env.example</code> nach <code>.env.local</code> kopieren.
        </p>
      </main>
    </div>
  );
}
