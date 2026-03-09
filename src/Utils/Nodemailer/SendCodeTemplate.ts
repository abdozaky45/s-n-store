export const activeCodeTemplate = (activeCode: string) => {
    const [D1, D2, D3, D4, D5, D6] = activeCode.toString().split("");
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>تأكيد الحساب - S&N Langire</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #fff0f5; font-family: 'Tajawal', sans-serif; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #ff6fa8 0%, #ff3d7f 60%, #e0005e 100%);
      border-radius: 24px 24px 0 0;
      padding: 48px 40px 36px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -40px; left: -40px;
      width: 180px; height: 180px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: -60px; right: -30px;
      width: 220px; height: 220px;
      background: rgba(255,255,255,0.06);
      border-radius: 50%;
    }
    .brand {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #ffffff;
      letter-spacing: 3px;
      text-transform: uppercase;
      position: relative;
      z-index: 1;
    }
    .brand span { color: #ffe0ef; }
    .brand-tagline {
      font-size: 12px;
      color: rgba(255,255,255,0.75);
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 6px;
      position: relative;
      z-index: 1;
    }
    .dots { display: flex; justify-content: center; gap: 6px; margin-top: 20px; position: relative; z-index: 1; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5); }
    .dot.active { background: #fff; width: 18px; border-radius: 3px; }
    .body { background: #ffffff; padding: 48px 40px; border-left: 1px solid #ffe0ef; border-right: 1px solid #ffe0ef; }
    .welcome-icon { text-align: center; font-size: 48px; margin-bottom: 20px; }
    .welcome-title { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a0010; text-align: center; margin-bottom: 12px; }
    .welcome-subtitle { font-size: 16px; color: #888; text-align: center; line-height: 1.8; margin-bottom: 36px; }
    .welcome-subtitle strong { color: #ff3d7f; }
    .divider { display: flex; align-items: center; gap: 12px; margin: 28px 0; }
    .divider-line { flex: 1; height: 1px; background: #ffe0ef; }
    .divider-icon { color: #ff6fa8; font-size: 16px; }
    .code-section {
      background: linear-gradient(135deg, #fff0f7, #ffe4f0);
      border: 2px dashed #ffb3d1;
      border-radius: 20px;
      padding: 36px 24px;
      text-align: center;
      margin: 28px 0;
    }
    .code-label { font-size: 13px; color: #cc3366; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; font-weight: 700; }
    .code-digits { display: flex; justify-content: center; gap: 10px; margin-bottom: 16px; }
    .code-digit {
      width: 52px; height: 64px;
      background: #ffffff;
      border: 2px solid #ff6fa8;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 28px; font-weight: 700;
      color: #e0005e;
      box-shadow: 0 4px 12px rgba(255, 61, 127, 0.15);
    }
    .code-note { font-size: 13px; color: #999; margin-top: 8px; }
    .code-note strong { color: #ff3d7f; }
    .message-box {
      background: #fff8fb;
      border-right: 4px solid #ff3d7f;
      padding: 20px 24px;
      border-radius: 0 12px 12px 0;
      margin: 28px 0;
    }
    .message-box p { font-size: 15px; color: #444; line-height: 2; }
    .footer {
      background: linear-gradient(135deg, #1a0010, #2d0020);
      border-radius: 0 0 24px 24px;
      padding: 36px 40px;
      text-align: center;
    }
    .footer-brand { font-family: 'Playfair Display', serif; font-size: 20px; color: #ff6fa8; letter-spacing: 2px; margin-bottom: 12px; }
    .footer-links { display: flex; justify-content: center; gap: 24px; margin: 16px 0; }
    .footer-links a { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 13px; }
    .footer-text { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 16px; line-height: 1.8; }
    .heart { color: #ff6fa8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand">S<span>&</span>N Langire</div>
      <div class="brand-tagline">Elegance · Comfort · Style</div>
      <div class="dots">
        <div class="dot"></div>
        <div class="dot active"></div>
        <div class="dot"></div>
      </div>
    </div>

    <div class="body">
      <div class="welcome-icon">🌸</div>
      <h1 class="welcome-title">مرحباً بك في عالمنا!</h1>
      <p class="welcome-subtitle">
        يسعدنا انضمامك إلى عائلة <strong>S&N Langire</strong><br/>
        نتمنى لك تجربة تسوّق سعيدة ومميزة ✨
      </p>

      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-icon">💗</div>
        <div class="divider-line"></div>
      </div>

      <div class="message-box">
        <p>
          لتأكيد حسابك والبدء في التسوّق، يرجى إدخال الكود التالي في الصفحة المخصصة.
          هذا الكود صالح لمدة <strong style="color:#ff3d7f">10 دقائق</strong> فقط.
        </p>
      </div>

      <div class="code-section">
        <div class="code-label">🔐 كود التحقق الخاص بك</div>
        <div class="code-digits">
          <div class="code-digit">${D1}</div>
          <div class="code-digit">${D2}</div>
          <div class="code-digit">${D3}</div>
          <div class="code-digit">${D4}</div>
          <div class="code-digit">${D5}</div>
          <div class="code-digit">${D6}</div>
        </div>
        <div class="code-note">
          لا تشارك هذا الكود مع <strong>أي شخص</strong>
        </div>
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-icon">🌺</div>
        <div class="divider-line"></div>
      </div>

      <p style="font-size:14px; color:#aaa; text-align:center; line-height:2;">
        إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.
      </p>
    </div>

    <div class="footer">
      <div class="footer-brand">S&N Langire</div>
      <div class="footer-links">
        <a href="#">تواصل معنا</a>
        <a href="#">سياسة الخصوصية</a>
        <a href="#">إلغاء الاشتراك</a>
      </div>
      <div class="footer-text">
        صُنع بـ <span class="heart">♥</span> لك أنت<br/>
        © 2026 S&N Langire. جميع الحقوق محفوظة.
      </div>
    </div>
  </div>
</body>
</html>`;
};