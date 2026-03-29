/**
 * Ergänzt fehlende de-Strings im Content-Manager (Blocks/Wysiwyg, Feld-Labels pro Content-Type, …).
 * Strapi liefert oft nur defaultMessage; de.json ist unvollständig → Konsole: MISSING_TRANSLATION.
 * @see https://docs.strapi.io/cms/admin-panel-customization/locales-translations
 */
const P = 'content-manager.';

export const contentManagerDeBlocksWysiwyg: Record<string, string> = {
  [`${P}components.Wysiwyg.ToggleMode.markdown-mode`]: 'Markdown-Modus',
  [`${P}components.Wysiwyg.ToggleMode.preview-mode`]: 'Vorschau',
  [`${P}components.Wysiwyg.blocks.code`]: 'Code',
  [`${P}components.Wysiwyg.selectOptions.title`]: 'Überschriften',
  [`${P}components.Wysiwyg.selectOptions.H1`]: 'Überschrift 1',
  [`${P}components.Wysiwyg.selectOptions.H2`]: 'Überschrift 2',
  [`${P}components.Wysiwyg.selectOptions.H3`]: 'Überschrift 3',
  [`${P}components.Wysiwyg.selectOptions.H4`]: 'Überschrift 4',
  [`${P}components.Wysiwyg.selectOptions.H5`]: 'Überschrift 5',
  [`${P}components.Wysiwyg.selectOptions.H6`]: 'Überschrift 6',
  [`${P}components.Wysiwyg.collapse`]: 'Einklappen',
  [`${P}components.WysiwygBottomControls.fullscreen`]: 'Vollbild',

  [`${P}components.Blocks.modifiers.bold`]: 'Fett',
  [`${P}components.Blocks.modifiers.italic`]: 'Kursiv',
  [`${P}components.Blocks.modifiers.underline`]: 'Unterstrichen',
  [`${P}components.Blocks.modifiers.strikethrough`]: 'Durchgestrichen',
  [`${P}components.Blocks.modifiers.code`]: 'Inline-Code',

  [`${P}components.Blocks.blocks.bulletList`]: 'Aufzählungsliste',
  [`${P}components.Blocks.blocks.numberList`]: 'Nummerierte Liste',
  [`${P}components.Blocks.blocks.unorderedList`]: 'Aufzählungsliste',
  [`${P}components.Blocks.blocks.orderedList`]: 'Nummerierte Liste',
  [`${P}components.Blocks.blocks.image`]: 'Bild',
  [`${P}components.Blocks.blocks.quote`]: 'Zitat',
  [`${P}components.Blocks.blocks.text`]: 'Text',
  [`${P}components.Blocks.blocks.code`]: 'Codeblock',
  [`${P}components.Blocks.blocks.code.languageLabel`]: 'Sprache wählen',
  [`${P}components.Blocks.blocks.heading1`]: 'Überschrift 1',
  [`${P}components.Blocks.blocks.heading2`]: 'Überschrift 2',
  [`${P}components.Blocks.blocks.heading3`]: 'Überschrift 3',
  [`${P}components.Blocks.blocks.heading4`]: 'Überschrift 4',
  [`${P}components.Blocks.blocks.heading5`]: 'Überschrift 5',
  [`${P}components.Blocks.blocks.heading6`]: 'Überschrift 6',
  [`${P}components.Blocks.blocks.selectBlock`]: 'Block auswählen',

  [`${P}components.Blocks.popover.link`]: 'Link',
  [`${P}components.Blocks.popover.text`]: 'Text',
  [`${P}components.Blocks.popover.text.placeholder`]: 'Linktext eingeben',
  [`${P}components.Blocks.popover.link.placeholder`]: 'Link einfügen',
  [`${P}components.Blocks.popover.link.rel`]: 'Rel (optional)',
  [`${P}components.Blocks.popover.link.rel.placeholder`]: 'noopener, nofollow, noreferrer',
  [`${P}components.Blocks.popover.link.target`]: 'Ziel (optional)',
  [`${P}components.Blocks.popover.link.target.placeholder`]: '_blank, _self, _parent, _top',
  [`${P}components.Blocks.popover.remove`]: 'Entfernen',

  [`${P}components.Blocks.link`]: 'Link',

  // Feld-Labels: content-manager.content-types.{uid}.{attributeName}
  [`${P}content-types.api::publication.publication.subtitle`]: 'Untertitel',
};
