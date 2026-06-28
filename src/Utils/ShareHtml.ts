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

// Collapse whitespace/newlines and cap length so the preview description stays
// within what crawlers display (~300 chars).
const normalizeDescription = (value: string, max = 300): string => {
  const collapsed = value.replace(/\s+/g, " ").trim();
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
}

export const renderProductShareHtml = (meta: ProductShareMeta): string => {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(normalizeDescription(meta.description || meta.title));
  const imageUrl = escapeHtml(meta.imageUrl);
  const shareUrl = escapeHtml(meta.shareUrl);
  const redirectUrl = escapeHtml(meta.redirectUrl);
  const siteName = escapeHtml(meta.siteName || "SN Lingerie");

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
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:alt" content="${title}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:locale" content="ar_AR" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <link rel="canonical" href="${redirectUrl}" />
  <!-- Real browsers get redirected to the storefront; crawlers stop here. -->
  <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
</head>
<body>
  <p>جارٍ تحويلك إلى المنتج… <a href="${redirectUrl}">اضغط هنا إذا لم يتم تحويلك تلقائيًا</a></p>
  <script>window.location.replace(${JSON.stringify(meta.redirectUrl)});</script>
</body>
</html>`;
};
