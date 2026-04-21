export const activeCodeTemplate = (activeCode: string) => {
  const [D1, D2, D3, D4, D5, D6] = activeCode.toString().split("");
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>تأكيد الحساب - S&N Langire</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet"/>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #fff0f5; }
    a { color: inherit; }

    .wrapper-table { width: 100%; background-color: #fff0f5; }
    .inner-table { width: 600px; margin: 0 auto; }

    .header-td {
      background: #e0005e;
      border-radius: 24px 24px 0 0;
      padding: 48px 40px 36px;
      text-align: center;
    }

    .brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      color: #ffffff;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .brand span { color: #ffe0ef; }

    .brand-tagline {
      font-family: 'Tajawal', Arial, sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.75);
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 6px;
      display: block;
    }

    .body-td {
      background: #ffffff;
      padding: 48px 40px;
      border-left: 1px solid #ffe0ef;
      border-right: 1px solid #ffe0ef;
      font-family: 'Tajawal', Arial, sans-serif;
    }

    .welcome-icon { text-align: center; font-size: 48px; padding-bottom: 20px; display: block; }

    .welcome-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      color: #1a0010;
      text-align: center;
      margin: 0 0 12px 0;
    }

    .welcome-subtitle {
      font-family: 'Tajawal', Arial, sans-serif;
      font-size: 16px;
      color: #888;
      text-align: center;
      line-height: 1.8;
      margin: 0 0 36px 0;
    }

    .message-box {
      background: #fff8fb;
      border-right: 4px solid #ff3d7f;
      padding: 20px 24px;
      border-radius: 0 12px 12px 0;
      margin: 0 0 28px 0;
    }
    .message-box p {
      font-family: 'Tajawal', Arial, sans-serif;
      font-size: 15px;
      color: #444;
      line-height: 2;
      margin: 0;
    }

    .code-section {
      background: #fff0f7;
      border: 2px dashed #ffb3d1;
      border-radius: 20px;
      padding: 36px 24px;
      text-align: center;
      margin: 0 0 28px 0;
    }

    .code-label {
      font-family: 'Tajawal', Arial, sans-serif;
      font-size: 13px;
      color: #cc3366;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 20px;
      font-weight: 700;
      display: block;
    }

    .digit-td {
      width: 52px;
      height: 64px;
      background: #ffffff;
      border: 2px solid #ff6fa8;
      border-radius: 12px;
      text-align: center;
      vertical-align: middle;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      color: #e0005e;
      padding: 0 4px;
    }

    .digit-gap { width: 10px; }

    .code-note {
      font-family: 'Tajawal', Arial, sans-serif;
      font-size: 13px;
      color: #999;
      margin-top: 16px;
      display: block;
    }

    .footer-td {
      background: #1a0010;
      border-radius: 0 0 24px 24px;
      padding: 36px 40px;
      text-align: center;
    }

    .footer-brand {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      color: #ff6fa8;
      letter-spacing: 2px;
      display: block;
      margin-bottom: 12px;
    }

    .footer-link {
      font-family: 'Tajawal', Arial, sans-serif;
      color: rgba(255,255,255,0.5) !important;
      text-decoration: none;
      font-size: 13px;
    }

    .footer-text {
      font-family: 'Tajawal', Arial, sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      margin-top: 16px;
      line-height: 1.8;
    }

    .heart { color: #ff6fa8; }
    .pink { color: #ff3d7f; }

    .divider-line { height: 1px; background-color: #ffe0ef; border: none; margin: 28px 0; }

    @media only screen and (max-width: 620px) {
      .inner-table { width: 100% !important; }
      .header-td { padding: 36px 20px 28px !important; border-radius: 16px 16px 0 0 !important; }
      .body-td { padding: 32px 20px !important; }
      .footer-td { padding: 28px 20px !important; border-radius: 0 0 16px 16px !important; }
      .brand { font-size: 26px !important; }
      .welcome-title { font-size: 22px !important; }
      .code-section { padding: 28px 16px !important; }
      .digit-td { width: 40px !important; height: 52px !important; font-size: 22px !important; border-radius: 8px !important; }
      .digit-gap { width: 6px !important; }
    }

    @media only screen and (max-width: 400px) {
      .digit-td { width: 34px !important; height: 46px !important; font-size: 18px !important; }
      .digit-gap { width: 4px !important; }
      .welcome-title { font-size: 20px !important; }
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
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="body-td">

              <span class="welcome-icon">🌸</span>
              <h1 class="welcome-title">مرحباً بك في عالمنا!</h1>
              <p class="welcome-subtitle">
                يسعدنا انضمامك إلى عائلة <strong class="pink">S&amp;N Langire</strong><br/>
                نتمنى لك تجربة تسوّق سعيدة ومميزة ✨
              </p>

              <!-- Divider -->
              <hr class="divider-line"/>

              <!-- Message Box -->
              <div class="message-box">
                <p>
                  لتأكيد حسابك والبدء في التسوّق، يرجى إدخال الكود التالي في الصفحة المخصصة.
                  هذا الكود صالح لمدة <strong class="pink">10 دقائق</strong> فقط.
                </p>
              </div>

              <!-- Code Section -->
              <div class="code-section">
                <span class="code-label">🔐 كود التحقق الخاص بك</span>

                <table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center">
                  <tr>
                    <td class="digit-td">${D1}</td>
                    <td class="digit-gap"></td>
                    <td class="digit-td">${D2}</td>
                    <td class="digit-gap"></td>
                    <td class="digit-td">${D3}</td>
                    <td class="digit-gap"></td>
                    <td class="digit-td">${D4}</td>
                    <td class="digit-gap"></td>
                    <td class="digit-td">${D5}</td>
                    <td class="digit-gap"></td>
                    <td class="digit-td">${D6}</td>
                  </tr>
                </table>

                <span class="code-note">لا تشارك هذا الكود مع <strong>أي شخص</strong></span>
              </div>

              <!-- Divider -->
              <hr class="divider-line"/>

              <p style="font-family:'Tajawal',Arial,sans-serif; font-size:14px; color:#aaa; text-align:center; line-height:2; margin:0;">
                إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-td">
              <span class="footer-brand">S&amp;N Langire</span>

              <table cellpadding="0" cellspacing="0" border="0" role="presentation" align="center">
                <tr>
                  <td style="padding: 0 12px;"><a href="#" class="footer-link">تواصل معنا</a></td>
                  <td style="color:rgba(255,255,255,0.2); font-size:12px;">|</td>
                  <td style="padding: 0 12px;"><a href="#" class="footer-link">سياسة الخصوصية</a></td>
                  <td style="color:rgba(255,255,255,0.2); font-size:12px;">|</td>
                  <td style="padding: 0 12px;"><a href="#" class="footer-link">إلغاء الاشتراك</a></td>
                </tr>
              </table>

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
