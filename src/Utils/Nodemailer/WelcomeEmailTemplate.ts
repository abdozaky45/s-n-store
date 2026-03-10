export const SendWelcomeEmail = () => {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>أهلاً بك - S&N Langire</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #fff0f5;
      font-family: 'IBM Plex Sans Arabic', sans-serif;
      padding: 40px 20px;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    /* ===== HEADER ===== */
    .header {
      background: linear-gradient(135deg, #ff6fa8 0%, #ff3d7f 60%, #e0005e 100%);
      border-radius: 24px 24px 0 0;
      padding: 56px 40px 44px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -60px; left: -60px;
      width: 240px; height: 240px;
      background: rgba(255,255,255,0.07);
      border-radius: 50%;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -80px; right: -40px;
      width: 280px; height: 280px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
    }

    .header-circle {
      position: absolute;
      top: 30px; right: 30px;
      width: 80px; height: 80px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
    }

    .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      color: #ffffff;
      letter-spacing: 4px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }

    .brand span { color: #ffe0ef; }

    .brand-tagline {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      letter-spacing: 5px;
      text-transform: uppercase;
      margin-top: 6px;
      position: relative;
      z-index: 1;
    }

    .header-divider {
      width: 60px;
      height: 2px;
      background: rgba(255,255,255,0.4);
      margin: 20px auto;
      position: relative;
      z-index: 1;
    }

    .header-welcome {
      font-family: 'IBM Plex Sans Arabic', sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: rgba(255,255,255,0.95);
      position: relative;
      z-index: 1;
      font-style: normal;
      letter-spacing: 1px;
    }

    /* ===== HERO BANNER ===== */
    .hero {
      background: linear-gradient(160deg, #fff0f7 0%, #ffe4f0 50%, #ffd6e8 100%);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      border-left: 1px solid #ffe0ef;
      border-right: 1px solid #ffe0ef;
    }

    .hero-icon {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
    }

    .hero-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 38px; font-weight: 600; letter-spacing: 1px;
      color: #1a0010;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .hero-title span { color: #ff3d7f; }

    .hero-text {
      font-size: 17px;
      color: #666;
      line-height: 2.1;
      max-width: 420px;
      margin: 0 auto;
      font-weight: 400;
    }

    /* ===== BODY ===== */
    .body {
      background: #ffffff;
      padding: 48px 40px;
      border-left: 1px solid #ffe0ef;
      border-right: 1px solid #ffe0ef;
    }

    /* Features */
    .features {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin: 32px 0;
    }

    .feature-card {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #fff8fb;
      border: 1px solid #ffe0ef;
      border-radius: 16px;
      padding: 20px 24px;
    }

    .feature-icon {
      font-size: 38px; font-weight: 600; letter-spacing: 1px;
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #ff6fa8, #ff3d7f);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .feature-text h3 {
      font-size: 17px;
      color: #1a0010;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .feature-text p {
      font-size: 15px;
      color: #999;
      line-height: 1.7;
    }

    /* Divider */
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 32px 0;
    }
    .divider-line { flex: 1; height: 1px; background: #ffe0ef; }
    .divider-icon { color: #ff6fa8; font-size: 18px; }

    /* CTA Button */
    .cta-wrap { text-align: center; margin: 36px 0; }

    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #ff6fa8, #e0005e);
      color: #ffffff;
      text-decoration: none;
      font-size: 17px;
      font-weight: 700;
      padding: 18px 48px;
      border-radius: 50px;
      letter-spacing: 1px;
      box-shadow: 0 8px 24px rgba(255, 61, 127, 0.35);
    }

    .cta-sub {
      font-size: 13px;
      color: #bbb;
      margin-top: 12px;
    }

    /* Quote */
    .quote-box {
      background: linear-gradient(135deg, #ff3d7f, #e0005e);
      border-radius: 20px;
      padding: 32px 36px;
      text-align: center;
      margin: 32px 0;
    }

    .quote-text {
      font-family: 'IBM Plex Sans Arabic', sans-serif;
      font-size: 17px;
      font-weight: 500;
      color: #ffffff;
      font-style: normal;
      line-height: 2.1;
      letter-spacing: 0.3px;
    }

    .quote-author {
      font-size: 13px;
      color: rgba(255,255,255,0.65);
      margin-top: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    /* ===== FOOTER ===== */
    .footer {
      background: linear-gradient(135deg, #1a0010, #2d0020);
      border-radius: 0 0 24px 24px;
      padding: 40px 40px;
      text-align: center;
    }

    .footer-brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      color: #ff6fa8;
      letter-spacing: 3px;
      margin-bottom: 8px;
    }

    .footer-tagline {
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin: 16px 0;
    }

    .footer-links a {
      color: rgba(255,255,255,0.45);
      text-decoration: none;
      font-size: 13px;
    }

    .footer-separator {
      width: 40px;
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 20px auto;
    }

    .footer-text {
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      line-height: 1.9;
    }

    .heart { color: #ff6fa8; }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="header-circle"></div>
      <div class="brand">S<span>&</span>N Langire</div>
      <div class="brand-tagline">Elegance · Comfort · Style</div>
      <div class="header-divider"></div>
      <div class="header-welcome">يسعدنا وجودك معنا ✨</div>
    </div>

    <!-- Hero -->
    <div class="hero">
      <span class="hero-icon">🌸</span>
      <h2 class="hero-title">أهلاً وسهلاً بك في<br/><span>S&N Langire</span></h2>
      <p class="hero-text">
        انضممت إلى عالم من الأناقة والجمال.<br/>
        نحن هنا لنقدم لك أفضل تجربة تسوّق ممكنة،
        بأعلى معايير الجودة والذوق الرفيع.
      </p>
    </div>

    <!-- Body -->
    <div class="body">

      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">🚚</div>
          <div class="feature-text">
            <h3>شحن سريع وآمن</h3>
            <p>نوصل طلبك لباب بيتك بكل عناية واحترافية</p>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💎</div>
          <div class="feature-text">
            <h3>جودة لا تُضاهى</h3>
            <p>منتجات مختارة بعناية فائقة لتناسب ذوقك الراقي</p>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <div class="feature-text">
            <h3>سياسة إرجاع مرنة</h3>
            <p>نضمن لك حق الإرجاع خلال 14 يوم من استلام طلبك</p>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <div class="feature-text">
            <h3>دعم على مدار الساعة</h3>
            <p>فريقنا دائماً موجود للمساعدة في أي وقت</p>
          </div>
        </div>
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-icon">💗</div>
        <div class="divider-line"></div>
      </div>

      <div class="cta-wrap">
        <a href="#" class="cta-btn">🛍️ ابدأ التسوّق الآن</a>
        <p class="cta-sub">اكتشف أحدث التشكيلات المميزة</p>
      </div>

      <div class="quote-box">
        <div class="quote-text">
          "الأناقة ليست في ما ترتدين،<br/>بل في كيف تشعرين بنفسك."
        </div>
        <div class="quote-author">— S&N Langire</div>
      </div>

      <p style="font-size:15px; color:#888; text-align:center; line-height:2.2; font-family:'IBM Plex Sans Arabic', sans-serif;">
        سنكون دائماً بجانبك 💗<br/>
        هنوصلك بأحدث المنتجات والعروض الحصرية<br/>
        حتى تكوني دائماً في قمة الأناقة ✨
      </p>

    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">S&N Langire</div>
      <div class="footer-tagline">Elegance · Comfort · Style</div>
      <div class="footer-links">
        <a href="#">تواصل معنا</a>
        <a href="#">سياسة الخصوصية</a>
        <a href="#">إلغاء الاشتراك</a>
      </div>
      <div class="footer-separator"></div>
      <div class="footer-text">
        صُنع بـ <span class="heart">♥</span> لك أنت<br/>
        © 2026 S&N Langire. جميع الحقوق محفوظة.
      </div>
    </div>

  </div>
</body>
</html>`;
}