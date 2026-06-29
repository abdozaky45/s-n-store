// Builds the lightweight HTML page returned by the product "share" endpoint.
//
// Why HTML and not JSON: social platforms (WhatsApp, Messenger, Facebook,
// Telegram...) generate the link preview by crawling the URL server-side and
// reading Open Graph <meta> tags out of the returned HTML. Their crawlers do
// NOT execute JavaScript and do NOT read JSON, so a SPA route or an API that
// returns JSON can never produce a rich preview. This page exposes the OG tags
// for the crawler and then redirects a real browser to the storefront product
// page.

// Escape a value for safe interpolation inside a double-quoted HTML attribute
// or text node, so a product name/description can never break the markup.
export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Decode the HTML entities that survive after tags are removed, so e.g.
// "&amp;", "&nbsp;" or "&#39;" become real characters instead of leaking into
// the preview text.
const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/(?:&#0*39;|&apos;)/gi, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

// Product descriptions are stored as rich-text HTML. Social crawlers render the
// og:description as literal text, so any <p>/<strong>/<br> tags would show up
// verbatim in the preview. Strip tags to plain text before it ever reaches the
// meta tag (block-level boundaries become spaces so words don't glue together).
export const stripHtml = (html: string): string =>
  decodeHtmlEntities(
    html
      .replace(/<\s*\/?\s*(p|div|li|ul|ol|br|h[1-6]|tr|table)\b[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, "")
  );

// Strip HTML, collapse whitespace/newlines and cap length so the preview
// description stays within what crawlers display (~160 chars).
const normalizeDescription = (value: string, max = 160): string => {
  const collapsed = stripHtml(value).replace(/\s+/g, " ").trim();
  return collapsed.length > max ? `${collapsed.slice(0, max - 1).trimEnd()}…` : collapsed;
};

export interface ProductShareMeta {
  title: string;
  description: string;
  imageUrl: string;
  // Canonical URL of the share page itself (what was shared).
  shareUrl: string;
  // Storefront product page a real visitor should land on.
  redirectUrl: string;
  siteName?: string;
  // Image hints for the preview card. Defaults assume square product images;
  // pass the real dimensions per product when available.
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
}

export const renderProductShareHtml = (meta: ProductShareMeta): string => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(normalizeDescription(meta.description || meta.title));
  const imageUrl = escapeHtml(meta.imageUrl);
  const shareUrl = escapeHtml(meta.shareUrl);
  const siteName = escapeHtml(meta.siteName || "SN Lingerie");
  const imageWidth = meta.imageWidth ?? 1080;
  const imageHeight = meta.imageHeight ?? 1080;
  const imageType = escapeHtml(meta.imageType || "image/jpeg");

  // Only emit image tags when there actually is an image — an empty og:image
  // would suppress the preview card entirely.
  const imageTags = meta.imageUrl
    ? `  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="${imageType}" />
  <meta property="og:image:width" content="${imageWidth}" />
  <meta property="og:image:height" content="${imageHeight}" />
  <meta property="og:image:alt" content="${title}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${imageUrl}" />
`
    : `  <meta name="twitter:card" content="summary" />\n`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph (WhatsApp, Messenger, Facebook, Telegram, Instagram link sticker) -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:locale" content="ar_EG" />
${imageTags}
  <!-- Twitter / X -->
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
</head>
<body>
  <p>جارٍ التحويل…</p>
  <!-- Redirect via JS only. NOT meta-refresh / 3xx: social crawlers follow those
       and leave this OG page before rendering the card. Crawlers don't run JS,
       so they keep the preview; real browsers run this and go to the storefront. -->
  <script>window.location.replace(${JSON.stringify(meta.redirectUrl)});</script>
</body>
</html>`;
};
