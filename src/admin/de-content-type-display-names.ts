/**
 * React-Intl-IDs für Content-Type-Anzeigenamen sind oft der Klartext selbst (ohne Plugin-Präfix).
 * Für locale "de" fehlen sie sonst in der Map → MISSING_TRANSLATION trotz korrektem Fallback.
 *
 * Bei neuen Sammlungstypen: `info.displayName` aus `src/api/.../schema.json` hier ergänzen (Key = Wert).
 */
export const deContentTypeDisplayNames: Record<string, string> = {
  Autor: 'Autor',
  Publikation: 'Publikation',
  Thema: 'Thema',
  Schlagwort: 'Schlagwort',
  Publikationstyp: 'Publikationstyp',
  Tabelle: 'Tabelle',
};
