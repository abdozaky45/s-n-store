interface OrderProduct {
  name: string;
  size: string;
  quantity: number;
  itemPrice: number;
  totalPrice: number;
}

interface OrderEmailData {
  orderNumber: string;
  firstName: string;
  lastName: string;
  products: OrderProduct[];
  subTotal: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  freeShipping?: boolean;
}

export const generateOrderEmail = (data: OrderEmailData): string => {
  const { orderNumber, firstName, lastName, products, subTotal, discount, shippingCost, totalAmount, freeShipping } = data;

  const productsHTML = products.map((p) => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px dashed #f5c6d8;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
          <tr>
            <td style="width:48px; height:48px; background:linear-gradient(135deg,#fce4ef,#f5c6d8); border-radius:10px; text-align:center; vertical-align:middle; font-size:22px;">👗</td>
            <td style="width:12px;"></td>
            <td>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:14px; font-weight:600; color:#2d1a24; margin-bottom:4px;">${p.name}</div>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:12px; color:#9b7080;">المقاس: ${p.size} &nbsp;|&nbsp; الكمية: ${p.quantity}</div>
            </td>
            <td style="font-family:'Cairo',Arial,sans-serif; font-size:14px; font-weight:600; color:#8b3a5a; white-space:nowrap; text-align:left;">${p.totalPrice.toLocaleString()} ج.م</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const discountRow = discount > 0 ? `
    <tr>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#c2547a; padding:7px 0;">🎉 خصم العرض</td>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#c2547a; text-align:left; padding:7px 0;">- ${discount.toLocaleString()} ج.م</td>
    </tr>
  ` : '';

  const shippingLabel = freeShipping
    ? `الشحن <span style="background:#c2547a;color:#fff;font-size:10px;padding:2px 8px;border-radius:20px;margin-right:6px;">مجاني</span>`
    : 'الشحن';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>تأكيد طلبك - S&N Lingerie</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cairo:wght@300;400;600&display=swap" rel="stylesheet"/>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; background-color: #fdf6f9; }
    a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; }
      .header-td { padding: 36px 20px 32px !important; }
      .hero-td { padding: 32px 20px !important; }
      .body-td { padding: 24px 20px !important; }
      .cta-td { padding: 28px 20px !important; }
      .footer-td { padding: 24px 20px !important; }
      .brand-name { font-size: 22px !important; }
      .hero-title { font-size: 20px !important; }
      .cta-btn { padding: 12px 28px !important; font-size: 13px !important; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#fdf6f9;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(92,45,66,0.08);">

          <!-- Header -->
          <tr>
            <td class="header-td" style="background:linear-gradient(135deg,#2d1a24 0%,#5c2d42 50%,#8b3a5a 100%); padding:48px 40px 40px; text-align:center;">
              <div class="brand-name" style="font-family:'Playfair Display',Georgia,serif; font-size:28px; font-weight:700; color:#ffffff; letter-spacing:4px; text-transform:uppercase;">S&amp;N Lingerie</div>
              <div style="width:60px; height:1px; background:linear-gradient(90deg,transparent,#f0a0c0,transparent); margin:14px auto;"></div>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,182,213,0.7); letter-spacing:3px; text-transform:uppercase;">Elegance · Comfort · Confidence</div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td class="hero-td" style="background:linear-gradient(160deg,#fff0f5 0%,#fce4ef 100%); padding:44px 40px 36px; text-align:center; border-bottom:1px solid #f5c6d8;">
              <table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation">
                <tr>
                  <td style="width:64px; height:64px; background:linear-gradient(135deg,#c2547a,#8b3a5a); border-radius:50%; text-align:center; vertical-align:middle;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <div class="hero-title" style="font-family:'Playfair Display',Georgia,serif; font-size:26px; font-weight:600; color:#5c2d42; margin:20px 0 12px;">شكراً لك على طلبك! 🌸</div>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:14px; color:#8b6070; line-height:2; max-width:420px; margin:0 auto;">
                مرحباً ${firstName} ${lastName}،<br/>
                تم استلام طلبك بنجاح وسيتم مراجعته في أقرب وقت.<br/>
                ستصلك رسالة تأكيد عند شحن طلبك.
              </div>
              <div style="display:inline-block; background:#ffffff; border:1.5px solid #e8a0bc; border-radius:30px; padding:8px 24px; margin-top:20px; font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#8b3a5a; font-weight:600; letter-spacing:1px;">رقم الطلب: ${orderNumber}</div>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td class="body-td" style="padding:32px 40px;">
              <div style="font-family:'Playfair Display',Georgia,serif; font-size:16px; color:#5c2d42; margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid #f5c6d8;">🛍️ تفاصيل الطلب</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                ${productsHTML}
              </table>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:linear-gradient(160deg,#fff0f5,#fce4ef); border-radius:14px; border:1px solid #f5c6d8;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                      <tr>
                        <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#8b6070; padding:7px 0;">المجموع الفرعي</td>
                        <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#8b6070; text-align:left; padding:7px 0;">${subTotal.toLocaleString()} ج.م</td>
                      </tr>
                      ${discountRow}
                      <tr>
                        <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#8b6070; padding:7px 0;">${shippingLabel}</td>
                        <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#8b6070; text-align:left; padding:7px 0;">${freeShipping ? '0' : shippingCost.toLocaleString()} ج.م</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:0;"><div style="height:1.5px; background:#e8a0bc; margin:8px 0;"></div></td>
                      </tr>
                      <tr>
                        <td style="font-family:'Cairo',Arial,sans-serif; font-size:16px; font-weight:700; color:#5c2d42; padding:6px 0;">الإجمالي</td>
                        <td style="font-family:'Cairo',Arial,sans-serif; font-size:16px; font-weight:700; color:#5c2d42; text-align:left; padding:6px 0;">${totalAmount.toLocaleString()} ج.م</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="cta-td" style="background:linear-gradient(135deg,#2d1a24,#5c2d42); padding:36px 40px; text-align:center;">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,230,240,0.85); margin-bottom:20px; line-height:2;">
                يمكنك متابعة حالة طلبك في أي وقت<br/>من خلال الموقع الإلكتروني باستخدام رقم هاتفك.
              </div>
              <a href="#" class="cta-btn" style="display:inline-block; background:linear-gradient(135deg,#c2547a,#e87aa0); color:#ffffff; text-decoration:none; padding:14px 36px; border-radius:30px; font-family:'Cairo',Arial,sans-serif; font-size:14px; font-weight:600; letter-spacing:1px;">تابع طلبك الآن</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-td" style="background:#1a0d13; padding:28px 40px; text-align:center; border-radius:0 0 20px 20px;">
              <div style="font-family:'Playfair Display',Georgia,serif; font-size:16px; color:rgba(255,182,213,0.6); letter-spacing:3px; margin-bottom:8px;">S&amp;N LINGERIE</div>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.3); line-height:2;">
                © 2026 S&amp;N Lingerie. جميع الحقوق محفوظة.<br/>
                للتواصل والاستفسار، يسعدنا خدمتك.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
