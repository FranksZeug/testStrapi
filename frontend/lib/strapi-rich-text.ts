/**
 * Strapi Rich-Text (Blocks) aus der REST-API: oft JSON-Array, nicht HTML-String.
 * Vorschau: minimal nach HTML für dangerouslySetInnerHTML.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTextNode(n: Record<string, unknown>): string {
  let t = escapeHtml(String(n.text ?? ''));
  if (n.code) t = `<code>${t}</code>`;
  if (n.bold) t = `<strong>${t}</strong>`;
  if (n.italic) t = `<em>${t}</em>`;
  if (n.underline) t = `<u>${t}</u>`;
  if (n.strikethrough) t = `<s>${t}</s>`;
  return t;
}

function renderChildren(children: unknown): string {
  if (!Array.isArray(children)) return '';
  return children.map((c) => renderBlockNode(c)).join('');
}

function renderBlockNode(node: unknown): string {
  if (node == null || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  const type = n.type;

  if (type === 'text') return renderTextNode(n);

  if (type === 'paragraph') return `<p>${renderChildren(n.children)}</p>`;

  if (type === 'heading') {
    const level = Math.min(6, Math.max(1, Number(n.level) || 1));
    return `<h${level}>${renderChildren(n.children)}</h${level}>`;
  }

  if (type === 'list') {
    const tag = n.format === 'ordered' ? 'ol' : 'ul';
    return `<${tag}>${renderChildren(n.children)}</${tag}>`;
  }

  if (type === 'list-item') return `<li>${renderChildren(n.children)}</li>`;

  if (type === 'link') {
    const href = escapeHtml(String(n.url ?? ''));
    return `<a href="${href}" rel="noopener noreferrer">${renderChildren(n.children)}</a>`;
  }

  if (type === 'quote') return `<blockquote>${renderChildren(n.children)}</blockquote>`;

  if (type === 'code') {
    const inner = renderChildren(n.children);
    return `<pre><code>${inner || escapeHtml(String(n.plainText ?? ''))}</code></pre>`;
  }

  if (type === 'image') {
    const img = n.image;
    if (img && typeof img === 'object') {
      const im = img as Record<string, unknown>;
      const url = String(im.url ?? '');
      if (!url) return '';
      const alt = escapeHtml(String(im.alternativeText ?? ''));
      return `<figure><img src="${escapeHtml(url)}" alt="${alt}" /></figure>`;
    }
  }

  if (Array.isArray(n.children)) return renderChildren(n.children);

  return '';
}

function blocksToHtml(blocks: unknown[]): string {
  return blocks.map((b) => renderBlockNode(b)).join('');
}

/**
 * Schema-Feld `Abstract` / klassisches HTML-String-Rich-Text / Blocks-Array.
 */
export function strapiRichTextToHtml(value: unknown): string {
  if (value == null) return '';

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return '';
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) return blocksToHtml(parsed);
      } catch {
        return s;
      }
    }
    return s;
  }

  if (Array.isArray(value)) return blocksToHtml(value);

  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (Array.isArray(o.children)) return blocksToHtml(o.children as unknown[]);
  }

  return '';
}
