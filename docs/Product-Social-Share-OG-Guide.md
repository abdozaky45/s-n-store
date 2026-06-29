# Product Social Share (Open Graph) — دليل التطبيق الكامل

دليل قابل لإعادة الاستخدام في أي مشروع Node/Express لعمل **endpoint يشير لينك منتج** يظهر بمعاينة
(صورة + اسم + وصف) على واتساب وماسنجر وفيسبوك وتيليجرام.

- **الـ Endpoint:** `GET /public/product/share/:productId`
- **بيرجّع:** صفحة HTML فيها Open Graph meta tags (مش JSON).
- **النتيجة:** الكراولر يقرا الوسوم ويرسم الكارت، والمستخدم الحقيقي يتحوّل لصفحة المنتج.

---

## 1) الفكرة الأساسية

لما تبعت لينك على منصة سوشيال، المنصة بتبعت **كراولر** يفتح اللينك ويقرا وسوم
`<meta property="og:...">` من الـ HTML، ويرسم بيها كارت المعاينة.

قاعدتان تحكمان التصميم كله:

1. **الكراولر مابيشغّلش JavaScript** → أي SPA (React/Vue/Angular) مفيهوش OG tags في
   الـ HTML الأولي = **مفيش بريفيو**.
2. **الكراولر مابيقراش JSON** → API عادية بترجّع JSON لا تنفع.

**الحل:** endpoint يرجّع صفحة HTML صغيرة فيها الـ OG tags، وتحوّل المستخدم الحقيقي
لصفحة المنتج بالـ **JavaScript** (مش meta-refresh ولا 301/302).

```
WhatsApp/FB crawler ──> GET /share/:id ──> HTML + og:tags ──> يرسم الكارت ويقف
Real user           ──> GET /share/:id ──> JS redirect    ──> صفحة المنتج (PDP)
```

---

## 2) معمارية القطع

```
GET /public/product/share/:productId   (endpoint عام — HTML مش JSON)
        │
        ├─ Router      → يعرّف المسار
        ├─ Validation  → يتأكد من productId ويسمح بأي query زيادة (.unknown)
        ├─ Controller  → يجيب المنتج ويبني الـ HTML ويرجّعه type("html")
        ├─ Service     → استعلام خفيف: name / description / image فقط (.lean)
        └─ HTML util   → يبني صفحة الـ OG (أهم ملف)
```

---

## 3) الكود

### (أ) باني الـ HTML — `Utils/ShareHtml.ts` (أهم ملف)

```ts
// 1) Escape: عشان اسم/وصف المنتج ميكسرش الـ HTML أو يعمل injection
export const escapeHtml = (v: string): string =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// 2) فك الـ HTML entities بعد ما نشيل الوسوم (&amp; &nbsp; &#39; ...)
const decodeHtmlEntities = (v: string): string =>
  v.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
   .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"')
   .replace(/(?:&#0*39;|&apos;)/gi, "'")
   .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
   .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

// 3) الوصف متخزّن HTML غني → نحوّله نص صافي
//    (حدود الـ block زي <p> و<br> تبقى مسافة عشان الكلام ميلزقش)
export const stripHtml = (html: string): string =>
  decodeHtmlEntities(
    html.replace(/<\s*\/?\s*(p|div|li|ul|ol|br|h[1-6]|tr|table)\b[^>]*>/gi, " ")
        .replace(/<[^>]*>/g, "")
  );

// 4) strip + دمج المسافات + قص لـ 160 حرف
const normalizeDescription = (v: string, max = 160): string => {
  const s = stripHtml(v).replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
};

export interface ProductShareMeta {
  title: string;
  description: string;
  imageUrl: string;
  shareUrl: string;     // رابط صفحة الشير نفسها (og:url)
  redirectUrl: string;  // صفحة المنتج اللي المستخدم يتحوّل لها
  siteName?: string;
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
  const w = meta.imageWidth ?? 1080, h = meta.imageHeight ?? 1080;
  const imageType = escapeHtml(meta.imageType || "image/jpeg");

  // وسوم الصورة تتطلع فقط لو فيه صورة — og:image فاضية تلغي الكارت كله
  const imageTags = meta.imageUrl ? `
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="${imageType}" />
  <meta property="og:image:width" content="${w}" />
  <meta property="og:image:height" content="${h}" />
  <meta property="og:image:alt" content="${title}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${imageUrl}" />` : `
  <meta name="twitter:card" content="summary" />`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${shareUrl}" />
  <meta property="og:locale" content="ar_EG" />${imageTags}

  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
</head>
<body>
  <p>جارٍ التحويل…</p>
  <!-- JS redirect فقط. ممنوع meta-refresh أو 301/302:
       الكراولر يتبعهم ويسيب صفحة الـ OG قبل ما يرسم الكارت. -->
  <script>window.location.replace(${JSON.stringify(meta.redirectUrl)});</script>
</body>
</html>`;
};
```

> **ترتيب المعالجة حرج:** الوصف يمر بـ `stripHtml` (يشيل الوسوم ويفك الـ entities) ثم
> `normalizeDescription` (يقص) ثم `escapeHtml` (يأمّنه للـ attribute). أي ترتيب خاطئ =
> إما وسوم تظهر للمستخدم أو ثغرة injection.

### (ب) الـ Service — استعلام خفيف

الـ endpoint بيتضرب من كراولرز، فمتجبش المنتج كامل بكل الـ relations:

```ts
export const getProductForShare = async (id: string | Types.ObjectId) => {
  return ProductModel.findOne({ _id: id, isDeleted: false })
    .select("name description defaultImage")  // الحقول المطلوبة فقط
    .lean();                                   // object عادي أخف من Document
};
```

### (ج) الـ Controller

```ts
export const getProductSharePreview = asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string };
  const redirectUrl = getStorefrontProductUrl(productId);          // صفحة المنتج
  const shareUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const product = mongoose.isValidObjectId(productId)
    ? await ProductService.getProductForShare(productId)
    : null;

  // مهم: متعملش throw لو المنتج مش موجود — اللينك اتشير بالفعل.
  // ارجع صفحة سليمة تودّي المستخدم للمتجر بدل error page.
  if (!product) {
    res.set("Cache-Control", "public, max-age=60");
    return res.status(200).type("html").send(renderProductShareHtml({
      title: "SN Lingerie", description: "تسوّقي أحدث التشكيلات",
      imageUrl: "", shareUrl, redirectUrl: STOREFRONT_URL,
    }));
  }

  res.set("Cache-Control", "public, max-age=300");  // المنصات تكاش البريفيو
  return res.status(200).type("html").send(renderProductShareHtml({
    title: product.name?.ar || product.name?.en || "SN Lingerie",
    description: product.description?.ar || product.description?.en || "",
    imageUrl: product.defaultImage?.mediaUrl || "",
    shareUrl, redirectUrl,
  }));
});
```

### (د) الـ Route

```ts
ProductPublicRouter.get(
  "/share/:productId",
  Validation(ProductValidation.getProductShareValidation),
  ProductController.getProductSharePreview
);
```

### (هـ) الـ Validation

```ts
// .unknown(true) عشان روابط الشير بتيجي معاها ?fbclid=... أو ?v=2 (كسر كاش)
// ولو رفضناهم هيرجع 400 والكراولر يشوف error بدل الكارت.
export const getProductShareValidation = joi.object({
  productId: joi.string().required(),
}).unknown(true).required();
```

### (و) الـ Config

```ts
export const STOREFRONT_URL = (process.env.STOREFRONT_URL || "https://sn-lingerie.com")
  .trim().replace(/\/+$/, "");

export const getStorefrontProductUrl = (id: string) =>
  `${STOREFRONT_URL}/products/${id}`;
```

---

## 4) المحاذير المهمة

| المحذور | الحل |
|---|---|
| **meta-refresh / 301 / 302 تلغي البريفيو** | الكراولر يتبع التحويل ويسيب صفحة الـ OG. استخدم **JS redirect فقط**. |
| **الـ middleware قد يحجب الكراولر** | تأكد أن مفيش auth/CORS/scraper-block على الـ GET. الحراسة تشتغل على الـ mutating methods فقط، والـ GET مفتوح. CORS لا يؤثر لأن الكراولر server-to-server (بدون Origin header). |
| **الوصف HTML خام** | لازم `stripHtml` + decode entities قبل ما يدخل الـ meta، وإلا الوسوم تظهر كنص. |
| **og:image فاضية** | تلغي الكارت — اجعل وسوم الصورة conditional. |
| **متطلبات الصورة** | HTTPS متاحة، نوعها صحيح، ويفضّل < ~600KB لواتساب. استخدم CDN وحط `og:image:type` صح. |
| **كاش المنصات** | واتساب يكاش per-URL على جهاز المُرسِل بدون زرار مسح. للاختبار استخدم **Facebook Debugger → Scrape Again**، ولكسر كاش واتساب أضف `?v=2` (لذلك سمحنا بالـ query params). |
| **أبعاد الصورة** | افتراضي 1080×1080. لو الصور مستطيلة، خزّن الأبعاد الحقيقية ومررها عبر `imageWidth/imageHeight`. |

---

## 5) استخدام الفرونت

الفرونت **لا يعمل fetch** للـ endpoint — فقط يضع رابطه كاللينك المُشار:

```js
const shareUrl = `${API_BASE}/public/product/share/${product._id}`;

// واتساب:
const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;
// فيسبوك/ماسنجر:
const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
// أو زر المشاركة الأصلي للموبايل:
if (navigator.share) navigator.share({ url: shareUrl, title: product.name.ar });
```

> **مهم:** شارك رابط الـ **share** وليس رابط صفحة المنتج المباشر (الـ SPA لا يحوي OG tags).

---

## 6) Checklist للتطبيق في مشروع جديد

1. أنشئ util يبني HTML بالـ OG tags (`renderProductShareHtml`) — انسخه كما هو وغيّر اسم
   الموقع والـ locale.
2. أنشئ دالة service خفيفة تجيب (الاسم/الوصف/الصورة) بـ `.lean()`.
3. أنشئ controller يرجّع `.type("html").send(...)` ويعالج الحالة المفقودة **بدون throw**.
4. سجّل route عام `GET /share/:id` + validation بـ `.unknown(true)`.
5. تأكد أن مفيش guard/CORS يحجب الـ GET.
6. ضع `STOREFRONT_URL` في الـ env.
7. اختبر بـ Facebook Debugger قبل التجربة على واتساب.

---

## 7) الاختبار

```bash
# 1) تأكد أن السيرفر يرجّع 200 + HTML + og tags
curl -s -A "WhatsApp/2.23" https://api.example.com/public/product/share/<ID> \
  | grep -iE 'og:title|og:image|og:description'

# 2) تأكد أن صورة الـ og:image متاحة ونوعها image/*
curl -sI <IMAGE_URL> | grep -i content-type
```

- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/ → ضع رابط
  الشير → **Scrape Again** (يستخدم نفس كراولر OG ويعرض الكارت ويمسح الكاش القديم).
- **واتساب:** اختبر برابط منتج لم تشاركه من قبل، أو أضف `?v=2` لكسر الكاش.

---

## 8) ملاحظة الـ Deploy (خاص بهذا المشروع)

- الـ production يعمل من `dist/` (`node dist/index.js`)، والـ CI يبني عبر `npm run build`.
- الـ **deploy يحدث من فرع `main` فقط**. التطوير على `dev` ثم merge إلى `main` للنشر.
- `dist/` متجاهَل في git (gitignored)، فالـ CI هو من يبنيه — لا تعمل commit للـ `dist`.
