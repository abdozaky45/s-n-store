import { OfferTypeEnum } from '../OfferType';

interface OfferItem {
  type: string;
  description: { ar: string };
  discountAmount: number;
  minOrderAmount: number;
}

export const generateOfferNotificationEmail = (offers: OfferItem[]): string => {

  const offerCardHTML = (offer: OfferItem, index: number): string => {
    const isFreeShipping = offer.type === OfferTypeEnum.FREE_SHIPPING;

    const badge = isFreeShipping
      ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px;">
          <tr>
            <td style="background:linear-gradient(135deg,#0a7d4b,#12a362); border-radius:50px; padding:10px 22px; text-align:center;">
              <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:13px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">🚚 شحن مجاني بالكامل</span>
            </td>
          </tr>
        </table>`
      : `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto 16px;">
          <tr>
            <td style="background:linear-gradient(135deg,#e0005e,#ff3d7f); border-radius:50px; padding:10px 22px; text-align:center;">
              <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:13px; font-weight:700; color:#ffffff; letter-spacing:0.5px;">💸 خصم ${offer.discountAmount.toLocaleString()} جنيه</span>
            </td>
          </tr>
        </table>`;

    const headline = isFreeShipping
      ? `اشتري بـ <strong style="color:#e0005e;">${offer.minOrderAmount.toLocaleString()} جنيه</strong> أو أكثر<br/>واحصلي على <strong style="color:#0a7d4b;">شحن مجاني 🚚</strong>`
      : `اشتري بـ <strong style="color:#e0005e;">${offer.minOrderAmount.toLocaleString()} جنيه</strong> أو أكثر<br/>واحصلي على <strong style="color:#e0005e;">خصم ${offer.discountAmount.toLocaleString()} جنيه 💸</strong>`;

    const borderColor = isFreeShipping ? '#b2dfdb' : '#ffe0ef';
    const bgColor = index % 2 === 0 ? '#fff8fb' : '#f0fff8';

    return `
      <tr><td style="padding:0 0 16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="background:${bgColor}; border:1.5px solid ${borderColor}; border-radius:18px; overflow:hidden;">
          <tr>
            <td style="padding:24px 20px; text-align:center;">

              <div style="font-size:36px; margin-bottom:14px;">🎀</div>

              ${badge}

              <div style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:16px; color:#1a0010; line-height:1.9; margin-bottom:12px;">
                ${headline}
              </div>

              <div style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:13px; color:#999; line-height:1.8; margin-bottom:14px;">
                ${offer.description.ar}
              </div>

              <div style="display:inline-block; background:rgba(224,0,94,0.07); border:1px dashed #ff3d7f; border-radius:30px; padding:5px 16px;">
                <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:11px; color:#e0005e; letter-spacing:1px;">✨ لفترة محدودة</span>
              </div>

            </td>
          </tr>
        </table>
      </td></tr>`;
  };

  const allOffersHTML = offers.map((o, i) => offerCardHTML(o, i)).join('');

  const titleText = offers.length === 1
    ? 'عرض حصري لك اليوم! 🌸'
    : `${offers.length} عروض حصرية لك اليوم! 🌸`;

  const subtitleText = offers.length === 1
    ? 'استغلي العرض دة قبل ما ينتهي وادّخري على مشترياتك'
    : 'استغلي العروض دي قبل ما تنتهي وادّخري أكتر على مشترياتك';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>عروض حصرية - S&N Langire</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; background-color: #fff0f5; }
    a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper     { width: 100% !important; }
      .header-td   { padding: 40px 20px 32px !important; border-radius: 16px 16px 0 0 !important; }
      .hero-td     { padding: 32px 20px !important; }
      .body-td     { padding: 28px 20px !important; }
      .footer-td   { padding: 24px 20px !important; border-radius: 0 0 16px 16px !important; }
      .brand       { font-size: 26px !important; }
      .hero-title  { font-size: 24px !important; }
      .cta-btn     { padding: 15px 32px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#fff0f5;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <table class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation">

          <!-- Header -->
          <tr>
            <td class="header-td" style="background:#e0005e; border-radius:24px 24px 0 0; padding:52px 40px 44px; text-align:center;">
              <span style="font-family:'Cormorant Garamond',Georgia,serif; font-size:34px; color:#ffffff; letter-spacing:4px; text-transform:uppercase; display:block;">S<span style="color:#ffe0ef;">&amp;</span>N Langire</span>
              <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.65); letter-spacing:5px; text-transform:uppercase; display:block; margin-top:6px;">Elegance · Comfort · Style</span>
              <div style="width:60px; height:2px; background:rgba(255,255,255,0.35); margin:18px auto;"></div>
              <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:17px; font-weight:500; color:rgba(255,255,255,0.95); display:block; letter-spacing:0.5px;">🎀 عروض وخصومات حصرية</span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td class="hero-td" style="background:#ffe4f0; padding:44px 40px 36px; text-align:center; border-left:1px solid #ffe0ef; border-right:1px solid #ffe0ef;">
              <span style="font-size:56px; display:block; margin-bottom:14px;">🛍️</span>
              <h2 class="hero-title" style="font-family:'Cormorant Garamond',Georgia,serif; font-size:34px; font-weight:600; color:#1a0010; margin:0 0 14px; line-height:1.4;">
                ${titleText}
              </h2>
              <p style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:16px; color:#666; line-height:2.1; margin:0 auto; max-width:420px;">
                ${subtitleText}
              </p>
            </td>
          </tr>

          <!-- Offers -->
          <tr>
            <td class="body-td" style="background:#ffffff; padding:36px 40px 28px; border-left:1px solid #ffe0ef; border-right:1px solid #ffe0ef;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                ${allOffersHTML}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff; padding:0 40px 44px; text-align:center; border-left:1px solid #ffe0ef; border-right:1px solid #ffe0ef;">
              <div style="height:1px; background:#ffe0ef; margin-bottom:32px;"></div>
              <a href="#" class="cta-btn" style="display:inline-block; background:#e0005e; color:#ffffff; text-decoration:none; font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:16px; font-weight:700; padding:17px 48px; border-radius:50px; letter-spacing:1px;">🛒 تسوّقي الآن</a>
              <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:12px; color:#bbb; margin-top:12px; display:block;">العروض لفترة محدودة — لا تفوتيها ✨</span>
            </td>
          </tr>

          <!-- Quote -->
          <tr>
            <td style="background:#ffffff; padding:0 40px 40px; border-left:1px solid #ffe0ef; border-right:1px solid #ffe0ef;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="background:#e0005e; border-radius:20px; padding:28px 32px; text-align:center;">
                    <p style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:16px; font-weight:500; color:#ffffff; line-height:2.1; margin:0;">
                      "الأناقة ليست في ما ترتدين،<br/>بل في كيف تشعرين بنفسك."
                    </p>
                    <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:12px; color:rgba(255,255,255,0.6); margin-top:10px; letter-spacing:2px; text-transform:uppercase; display:block;">— S&amp;N Langire</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-td" style="background:#1a0010; border-radius:0 0 24px 24px; padding:36px 40px; text-align:center;">
              <span style="font-family:'Cormorant Garamond',Georgia,serif; font-size:20px; color:#ff6fa8; letter-spacing:3px; display:block; margin-bottom:6px;">S&amp;N Langire</span>
              <span style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.25); letter-spacing:3px; text-transform:uppercase; display:block; margin-bottom:18px;">Elegance · Comfort · Style</span>
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center">
                <tr>
                  <td style="padding:0 10px;"><a href="#" style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; color:rgba(255,255,255,0.4); text-decoration:none; font-size:12px;">تواصلي معنا</a></td>
                  <td style="color:rgba(255,255,255,0.15); font-size:12px;">|</td>
                  <td style="padding:0 10px;"><a href="#" style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; color:rgba(255,255,255,0.4); text-decoration:none; font-size:12px;">إلغاء الاشتراك</a></td>
                </tr>
              </table>
              <div style="height:1px; background:rgba(255,255,255,0.08); width:40px; margin:16px auto;"></div>
              <p style="font-family:'IBM Plex Sans Arabic',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.2); line-height:1.9; margin:0;">
                صُنع بـ <span style="color:#ff6fa8;">♥</span> لك أنت<br/>
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
