type FieldMeta = {
  /**
   * Relationen: Anzeigefeld des Zieltyps. Strapi lädt pro Eintrag nur dieses Feld (+ Metadaten);
   * bei `path` kann die UI sonst auf `documentId` zurückfallen (z. B. "ygsoj4hz…").
   * Hierarchie bleibt über die Spalte „Themenpfad“ in der Themen-Liste sichtbar.
   */
  edit?: { label?: string; description?: string; placeholder?: string; mainField?: string };
  list?: { label?: string; mainField?: string };
};

export const germanLabelsByUid: Record<string, Record<string, FieldMeta>> = {
  'api::author.author': {
    first_name: { edit: { label: 'Vorname' }, list: { label: 'Vorname' } },
    last_name: { edit: { label: 'Nachname' }, list: { label: 'Nachname' } },
    orcid: { edit: { label: 'ORCID' }, list: { label: 'ORCID' } },
    affiliation: { edit: { label: 'Institution' }, list: { label: 'Institution' } },
    publications: { edit: { label: 'Publikationen' }, list: { label: 'Publikationen' } },
  },
  'api::publication.publication': {
    title: { edit: { label: 'Titel' }, list: { label: 'Titel' } },
    subtitle: { edit: { label: 'Untertitel' }, list: { label: 'Untertitel' } },
    abstract: { edit: { label: 'Kurzfassung' }, list: { label: 'Kurzfassung' } },
    publication_date: { edit: { label: 'Erscheinungsdatum' }, list: { label: 'Erscheinungsdatum' } },
    Sperrfrist: { edit: { label: 'Sperrfrist' }, list: { label: 'Sperrfrist' } },
    Doi: { edit: { label: 'DOI' }, list: { label: 'DOI' } },
    authors: { edit: { label: 'Autor:innen' }, list: { label: 'Autor:innen' } },
    publication_type: { edit: { label: 'Publikationstyp' }, list: { label: 'Publikationstyp' } },
    keywords: { edit: { label: 'Schlagwörter' }, list: { label: 'Schlagwörter' } },
    topics: {
      edit: { label: 'Themen', mainField: 'name' },
      list: { label: 'Themen', mainField: 'name' },
    },
  },
  'api::publication-type.publication-type': {
    name: { edit: { label: 'Name' }, list: { label: 'Name' } },
    description: { edit: { label: 'Beschreibung' }, list: { label: 'Beschreibung' } },
    publications: { edit: { label: 'Publikationen' }, list: { label: 'Publikationen' } },
  },
  'api::keyword.keyword': {
    name: { edit: { label: 'Bezeichnung' }, list: { label: 'Bezeichnung' } },
    publications: { edit: { label: 'Publikationen' }, list: { label: 'Publikationen' } },
  },
  'api::topic.topic': {
    name: { edit: { label: 'Name' }, list: { label: 'Name' } },
    description: { edit: { label: 'Beschreibung' }, list: { label: 'Beschreibung' } },
    level: { edit: { label: 'Ebene' }, list: { label: 'Ebene' } },
    path: { edit: { label: 'Themenpfad' }, list: { label: 'Themenpfad' } },
    parent_topic: {
      edit: { label: 'Übergeordnetes Thema', mainField: 'name' },
      list: { label: 'Übergeordnetes Thema', mainField: 'name' },
    },
    child_topics: {
      edit: { label: 'Unterthemen', mainField: 'name' },
      list: { label: 'Unterthemen', mainField: 'name' },
    },
    publications: { edit: { label: 'Publikationen' }, list: { label: 'Publikationen' } },
  },
  'api::tabelle.tabelle': {
    Tabelleninhalt: { edit: { label: 'Tabelleninhalt' }, list: { label: 'Tabelleninhalt' } },
  },
};

type StoredMeta = { edit?: Record<string, unknown>; list?: Record<string, unknown> };

export function mergeFieldMetadatas(
  existing: Record<string, StoredMeta> | undefined,
  patches: Record<string, FieldMeta>
): Record<string, StoredMeta> {
  const next: Record<string, StoredMeta> = { ...(existing ?? {}) };
  for (const [attr, patch] of Object.entries(patches)) {
    const prev = next[attr] ?? { edit: {}, list: {} };
    next[attr] = {
      edit: { ...(prev.edit ?? {}), ...(patch.edit ?? {}) },
      list: { ...(prev.list ?? {}), ...(patch.list ?? {}) },
    };
  }
  return next;
}
