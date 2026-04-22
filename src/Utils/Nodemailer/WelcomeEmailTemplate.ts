export const SendWelcomeEmail = () => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>أهلاً بك - S&N Langire</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #fff0f5; }
    a { color: inherit; }

    .wrapper-table { width: 100%; background-color: #fff0f5; }
    .inner-table { width: 600px; }

    .header-td {
      background: #e0005e;
      border-radius: 24px 24px 0 0;
      padding: 56px 40px 44px;
      text-align: center;
    }

    .brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 36px;
      color: #ffffff;
      letter-spacing: 4px;
      text-transform: uppercase;
      display: block;
    }
    .brand span { color: #ffe0ef; }

    .brand-tagline {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      letter-spacing: 5px;
      text-transform: uppercase;
      margin-top: 6px;
      display: block;
    }

    .header-divider {
      width: 60px;
      height: 2px;
      background: rgba(255,255,255,0.4);
      margin: 20px auto;
      display: block;
    }

    .header-welcome {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: rgba(255,255,255,0.95);
      letter-spacing: 1px;
      display: block;
    }

    .hero-td {
      background: #ffe4f0;
      padding: 48px 40px;
      text-align: center;
      border-left: 1px solid #ffe0ef;
      border-right: 1px solid #ffe0ef;
    }

    .hero-icon { font-size: 64px; display: block; margin-bottom: 16px; }

    .hero-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 38px;
      font-weight: 600;
      color: #1a0010;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }
    .hero-title span { color: #ff3d7f; }

    .hero-text {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 17px;
      color: #666;
      line-height: 2.1;
      margin: 0 auto;
      max-width: 420px;
    }

    .body-td {
      background: #ffffff;
      padding: 48px 40px;
      border-left: 1px solid #ffe0ef;
      border-right: 1px solid #ffe0ef;
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
    }

    .feature-row { margin-bottom: 16px; }

    .feature-td {
      background: #fff8fb;
      border: 1px solid #ffe0ef;
      border-radius: 16px;
      padding: 20px 24px;
      vertical-align: middle;
    }

    .feature-icon-td {
      width: 56px;
      height: 56px;
      background: #ff3d7f;
      border-radius: 14px;
      text-align: center;
      vertical-align: middle;
      font-size: 26px;
      padding: 0;
    }

    .feature-gap { width: 16px; }

    .feature-title {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 17px;
      color: #1a0010;
      font-weight: 700;
      margin: 0 0 5px 0;
    }

    .feature-desc {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 15px;
      color: #999;
      line-height: 1.7;
      margin: 0;
    }

    .divider-line { height: 1px; background-color: #ffe0ef; border: none; margin: 32px 0; }

    .cta-btn {
      display: inline-block;
      background: #e0005e;
      color: #ffffff !important;
      text-decoration: none;
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 17px;
      font-weight: 700;
      padding: 18px 48px;
      border-radius: 50px;
      letter-spacing: 1px;
    }

    .cta-sub {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 13px;
      color: #bbb;
      margin-top: 12px;
      display: block;
    }

    .quote-td {
      background: #e0005e;
      border-radius: 20px;
      padding: 32px 36px;
      text-align: center;
    }

    .quote-text {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 17px;
      font-weight: 500;
      color: #ffffff;
      line-height: 2.1;
      letter-spacing: 0.3px;
      margin: 0;
    }

    .quote-author {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.65);
      margin-top: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      display: block;
    }

    .footer-td {
      background: #1a0010;
      border-radius: 0 0 24px 24px;
      padding: 40px;
      text-align: center;
    }

    .footer-brand {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 22px;
      color: #ff6fa8;
      letter-spacing: 3px;
      display: block;
      margin-bottom: 8px;
    }

    .footer-tagline {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      letter-spacing: 3px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 20px;
    }

    .footer-link {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      color: rgba(255,255,255,0.45) !important;
      text-decoration: none;
      font-size: 13px;
    }

    .footer-separator { height: 1px; background-color: rgba(255,255,255,0.1); border: none; margin: 20px auto; width: 40px; display: block; }

    .footer-text {
      font-family: 'IBM Plex Sans Arabic', Arial, sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      line-height: 1.9;
      margin: 0;
    }

    .heart { color: #ff6fa8; }
    .pink { color: #ff3d7f; }

    @media only screen and (max-width: 620px) {
      .inner-table { width: 100% !important; }
      .header-td { padding: 40px 20px 32px !important; border-radius: 16px 16px 0 0 !important; }
      .hero-td { padding: 36px 20px !important; }
      .body-td { padding: 32px 20px !important; }
      .footer-td { padding: 28px 20px !important; border-radius: 0 0 16px 16px !important; }
      .brand { font-size: 28px !important; }
      .hero-title { font-size: 28px !important; }
      .hero-text { font-size: 15px !important; }
      .cta-btn { padding: 16px 32px !important; font-size: 15px !important; }
      .quote-td { padding: 24px 20px !important; }
      .quote-text { font-size: 15px !important; }
    }

    @media only screen and (max-width: 400px) {
      .brand { font-size: 24px !important; letter-spacing: 2px !important; }
      .hero-title { font-size: 24px !important; }
      .feature-title { font-size: 15px !important; }
      .feature-desc { font-size: 13px !important; }
    }
  </style>
</head>
<body>
  <table class="wrapper-table" cellpadding="0" cellspacing="0" border="0" role="presentation">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <table class="inner-table" cellpadding="0" cellspacing="0" border="0" role="presentation">

          <!-- Header -->
          <tr>
            <td class="header-td">
              <span class="brand">S<span>&amp;</span>N Langire</span>
              <span class="brand-tagline">Elegance · Comfort · Style</span>
              <span class="header-divider"></span>
              <span class="header-welcome">يسعدنا وجودك معنا ✨</span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td class="hero-td">
              <span class="hero-icon">🌸</span>
              <h2 class="hero-title">أهلاً وسهلاً بك في<br/><span>S&amp;N Langire</span></h2>
              <p class="hero-text">
                انضممت إلى عالم من الأناقة والجمال.<br/>
                نحن هنا لنقدم لك أفضل تجربة تسوّق ممكنة،
                بأعلى معايير الجودة والذوق الرفيع.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="body-td">

              <!-- Feature Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">

                <tr class="feature-row">
                  <td class="feature-td">
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">
                      <tr>
                        <td class="feature-icon-td">🚚</td>
                        <td class="feature-gap"></td>
                        <td>
                          <p class="feature-title">شحن سريع وآمن</p>
                          <p class="feature-desc">نوصل طلبك لباب بيتك بكل عناية واحترافية</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height:16px;"></td></tr>

                <tr class="feature-row">
                  <td class="feature-td">
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">
                      <tr>
                        <td class="feature-icon-td">💎</td>
                        <td class="feature-gap"></td>
                        <td>
                          <p class="feature-title">جودة لا تُضاهى</p>
                          <p class="feature-desc">منتجات مختارة بعناية فائقة لتناسب ذوقك الراقي</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height:16px;"></td></tr>

                <tr class="feature-row">
                  <td class="feature-td">
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">
                      <tr>
                        <td class="feature-icon-td">🔄</td>
                        <td class="feature-gap"></td>
                        <td>
                        <p class="feature-title">منتجات صحية وآمنة</p>
                        <p class="feature-desc">حرصًا على سلامتكم، لا يمكن إرجاع أو استبدال الملابس الداخلية بعد فتح العبوة</p>  
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="height:16px;"></td></tr>

                <tr class="feature-row">
                  <td class="feature-td">
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">
                      <tr>
                        <td class="feature-icon-td">💬</td>
                        <td class="feature-gap"></td>
                        <td>
                          <p class="feature-title">دعم على مدار الساعة</p>
                          <p class="feature-desc">فريقنا دائماً موجود للمساعدة في أي وقت</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

              <!-- Divider -->
              <hr class="divider-line"/>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td align="center" style="padding: 4px 0 36px;">
                    <a href="#" class="cta-btn">🛍️ ابدأ التسوّق الآن</a>
                    <span class="cta-sub">اكتشف أحدث التشكيلات المميزة</span>
                  </td>
                </tr>
              </table>

              <!-- Quote -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td class="quote-td">
                    <p class="quote-text">
                      "الأناقة ليست في ما ترتدين،<br/>بل في كيف تشعرين بنفسك."
                    </p>
                    <span class="quote-author">— S&amp;N Langire</span>
                  </td>
                </tr>
              </table>

              <p style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:15px; color:#888; text-align:center; line-height:2.2; margin:32px 0 0;">
                سنكون دائماً بجانبك 💗<br/>
                هنوصلك بأحدث المنتجات والعروض الحصرية<br/>
                حتى تكوني دائماً في قمة الأناقة ✨
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-td">
              <span class="footer-brand">S&amp;N Langire</span>
              <span class="footer-tagline">Elegance · Comfort · Style</span>

              <table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center">
                <tr>
                  <td style="padding: 0 12px;"><a href="#" class="footer-link">تواصل معنا</a></td>
                  <td style="color:rgba(255,255,255,0.2); font-size:12px;">|</td>
                  <td style="padding: 0 12px;"><a href="#" class="footer-link">سياسة الخصوصية</a></td>
                  <td style="color:rgba(255,255,255,0.2); font-size:12px;">|</td>
                  <td style="padding: 0 12px;"><a href="#" class="footer-link">إلغاء الاشتراك</a></td>
                </tr>
              </table>

              <hr class="footer-separator"/>

              <p class="footer-text">
                صُنع بـ <span class="heart">♥</span> لك أنت<br/>
                © 2026 S&amp;N Langire. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
