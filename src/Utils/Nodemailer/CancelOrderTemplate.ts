interface CancelOrderProduct {
  name: string;
  size: string;
  quantity: number;
  totalPrice: number;
}

interface CancelOrderEmailData {
  orderNumber: string;
  cancelDate: string;
  customerPhone: string;
  products: CancelOrderProduct[];
  subTotal: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  freeShipping?: boolean;
}

const statCard = (label: string, value: string, valueColor = '#f0e6ec') => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation"
    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,80,80,0.15); border-radius:10px;">
    <tr><td style="padding:14px 16px;">
      <div style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(255,160,160,0.5); letter-spacing:1px; text-transform:uppercase; margin-bottom:4px;">${label}</div>
      <div style="font-family:'Cairo',Arial,sans-serif; font-size:14px; color:${valueColor}; font-weight:600;">${value}</div>
    </td></tr>
  </table>
`;

export const generateCancelOrderEmail = (data: CancelOrderEmailData): string => {
  const { orderNumber, cancelDate, customerPhone, products, subTotal, discount, shippingCost, totalAmount, freeShipping } = data;

  const productsRowsHTML = products.map((p) => `
    <tr>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#f0dede; font-weight:600; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04);">${p.name}</td>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#c4a0a0; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); white-space:nowrap;">${p.size} × ${p.quantity}</td>
      <td class="products-col3" style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#c4a0a0; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); white-space:nowrap; text-decoration:line-through; opacity:0.7;">${p.totalPrice.toLocaleString()} ج.م</td>
    </tr>
  `).join('');

  const discountRow = discount > 0 ? `
    <tr>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,160,160,0.7); padding:5px 0;">الخصم</td>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#ff6b6b; padding:5px 0; text-align:left;">- ${discount.toLocaleString()} ج.م</td>
    </tr>
  ` : '';

  const shippingLabel = freeShipping
    ? 'الشحن &nbsp;<span style="background:rgba(255,80,80,0.3);color:#ffb3b3;font-size:10px;padding:2px 7px;border-radius:20px;">مجاني</span>'
    : 'الشحن';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>إلغاء طلب - S&N Lingerie Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet"/>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0f0a0d; }
    a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper       { width: 100% !important; }
      .header-td     { padding: 28px 20px !important; }
      .header-title  { font-size: 20px !important; }
      .section-td    { padding: 22px 20px !important; }
      .cta-td        { padding: 24px 20px !important; }
      .footer-td     { padding: 16px 20px !important; }
      .info-cell     { display: block !important; width: 100% !important; padding: 5px 0 !important; }
      .products-col3 { display: none !important; }
      .phone-cta-btn { padding: 16px 24px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#0f0a0d;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="background:#1a0d0d; border-radius:20px; overflow:hidden; box-shadow:0 0 40px rgba(255,60,60,0.08);">

          <!-- Header -->
          <tr>
            <td class="header-td" style="background:linear-gradient(135deg,#3d0f0f 0%,#7a1f1f 45%,#b03030 100%); padding:36px 40px; text-align:center; position:relative;">

              <!-- Top warning stripe -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:20px;">
                <tr>
                  <td style="height:3px; background:repeating-linear-gradient(90deg,#ff4444 0px,#ff4444 12px,transparent 12px,transparent 20px);"></td>
                </tr>
              </table>

              <div style="font-family:'Cairo',Arial,sans-serif; display:inline-block; background:rgba(255,255,255,0.12); padding:6px 20px; border-radius:20px; font-size:11px; color:#ffcccc; letter-spacing:2px; text-transform:uppercase; margin-bottom:14px; border:1px solid rgba(255,100,100,0.3);">⚠️ تنبيه عاجل</div>

              <!-- Cancel icon -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation" style="margin:0 auto 16px;">
                <tr>
                  <td style="width:68px; height:68px; background:rgba(255,60,60,0.2); border:2px solid rgba(255,80,80,0.4); border-radius:50%; text-align:center; vertical-align:middle; font-size:30px;">❌</td>
                </tr>
              </table>

              <div class="header-title" style="font-family:'Playfair Display',Georgia,serif; font-size:26px; color:#fff; font-weight:700; margin-bottom:6px;">تم إلغاء طلب!</div>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:12px; color:rgba(255,200,200,0.6); letter-spacing:3px; text-transform:uppercase;">S&amp;N LINGERIE — لوحة الإدارة</div>

            </td>
          </tr>

          <!-- Alert bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#4a1515,#7a1f1f); padding:14px 40px; border-bottom:1px solid rgba(255,60,60,0.15);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#ffb3b3;">🕐 ${cancelDate}</td>
                  <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; font-weight:700; color:#ff8080; letter-spacing:1px; text-align:left;">${orderNumber}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ⚡ Contact Customer CTA — prominent at top -->
          <tr>
            <td style="padding:28px 40px; background:rgba(255,40,40,0.06); border-bottom:2px solid rgba(255,60,60,0.12);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                style="background:linear-gradient(135deg,rgba(180,30,30,0.3),rgba(120,20,20,0.4)); border:1px solid rgba(255,80,80,0.25); border-radius:16px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                      <tr>
                        <td>
                          <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,160,160,0.6); letter-spacing:2px; text-transform:uppercase; margin-bottom:6px;">رقم العميل</div>
                          <div style="font-family:'Cairo',Arial,sans-serif; font-size:24px; font-weight:700; color:#ff8080; letter-spacing:2px; direction:ltr; text-align:right;">${customerPhone}</div>
                          <div style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,180,180,0.7); margin-top:8px; line-height:1.8;">
                            تواصل مع العميل في أقرب وقت لمعرفة سبب الإلغاء<br/>وحل المشكلة والمساعدة في إتمام الطلب مجدداً.
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:18px;">
                          <a href="tel:${customerPhone}" class="phone-cta-btn"
                            style="display:inline-block; background:linear-gradient(135deg,#c0392b,#e74c3c); color:#ffffff; text-decoration:none; padding:13px 32px; border-radius:30px; font-family:'Cairo',Arial,sans-serif; font-size:14px; font-weight:700; letter-spacing:1px;">
                            📞 اتصل بالعميل الآن
                          </a>
                          <a href="https://wa.me/${customerPhone}"
                            style="display:inline-block; background:linear-gradient(135deg,#1a6b35,#27ae60); color:#ffffff; text-decoration:none; padding:13px 28px; border-radius:30px; font-family:'Cairo',Arial,sans-serif; font-size:14px; font-weight:700; letter-spacing:1px; margin-right:10px;">
                            💬 واتساب
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Info Cards -->
          <tr>
            <td class="section-td" style="padding:28px 40px; border-bottom:1px solid rgba(255,255,255,0.04);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,160,160,0.7); letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">تفاصيل الطلب الملغي</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td class="info-cell" style="width:50%; padding:0 6px 6px 0; vertical-align:top;">
                    ${statCard('رقم الطلب', orderNumber)}
                  </td>
                  <td class="info-cell" style="width:50%; padding:0 0 6px 6px; vertical-align:top;">
                    ${statCard('حالة الطلب', '🚫 ملغي', '#ff6b6b')}
                  </td>
                </tr>
                <tr>
                  <td class="info-cell" style="width:50%; padding:6px 6px 0 0; vertical-align:top;">
                    ${statCard('تاريخ الإلغاء', cancelDate)}
                  </td>
                  <td class="info-cell" style="width:50%; padding:6px 0 0 6px; vertical-align:top;">
                    ${statCard('الإجمالي الضائع', `${totalAmount.toLocaleString()} ج.م`, '#ff8080')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td class="section-td" style="padding:28px 40px; border-bottom:1px solid rgba(255,255,255,0.04);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,160,160,0.7); letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">المنتجات المُلغاة</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <th style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(255,160,160,0.45); letter-spacing:1px; text-transform:uppercase; text-align:right; padding:8px 14px; border-bottom:1px solid rgba(255,80,80,0.1); font-weight:400;">المنتج</th>
                  <th style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(255,160,160,0.45); letter-spacing:1px; text-transform:uppercase; text-align:right; padding:8px 14px; border-bottom:1px solid rgba(255,80,80,0.1); font-weight:400; white-space:nowrap;">المقاس / الكمية</th>
                  <th class="products-col3" style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(255,160,160,0.45); letter-spacing:1px; text-transform:uppercase; text-align:right; padding:8px 14px; border-bottom:1px solid rgba(255,80,80,0.1); font-weight:400; white-space:nowrap;">القيمة</th>
                </tr>
                ${productsRowsHTML}
              </table>
            </td>
          </tr>

          <!-- Financial Summary -->
          <tr>
            <td class="section-td" style="padding:28px 40px; border-bottom:1px solid rgba(255,255,255,0.04);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,160,160,0.7); letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">الملخص المالي</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                style="background:rgba(180,30,30,0.1); border:1px solid rgba(255,60,60,0.2); border-radius:12px;">
                <tr><td style="padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,160,160,0.7); padding:5px 0;">المجموع الفرعي</td>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,160,160,0.7); text-align:left; padding:5px 0;">${subTotal.toLocaleString()} ج.م</td>
                    </tr>
                    ${discountRow}
                    <tr>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,160,160,0.7); padding:5px 0;">${shippingLabel}</td>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,160,160,0.7); text-align:left; padding:5px 0;">${freeShipping ? '0' : shippingCost.toLocaleString()} ج.م</td>
                    </tr>
                    <tr><td colspan="2"><div style="height:1px; background:rgba(255,60,60,0.25); margin:8px 0;"></div></td></tr>
                    <tr>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:17px; font-weight:700; color:#ff6b6b; padding:5px 0;">إجمالي الطلب الملغي</td>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:17px; font-weight:700; color:#ff6b6b; text-align:left; padding:5px 0; text-decoration:line-through; opacity:0.8;">${totalAmount.toLocaleString()} ج.م</td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Bottom reminder -->
          <tr>
            <td class="cta-td" style="padding:28px 40px; text-align:center; background:rgba(255,40,40,0.04);">
              <table cellpadding="0" cellspacing="0" border="0" align="center" role="presentation"
                style="background:rgba(255,60,60,0.08); border:1px solid rgba(255,60,60,0.15); border-radius:14px; max-width:460px;">
                <tr><td style="padding:20px 24px;">
                  <div style="font-size:22px; margin-bottom:10px;">💡</div>
                  <div style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(255,180,180,0.8); line-height:2;">
                    تم استعادة المخزون لجميع المنتجات الملغاة تلقائياً.<br/>
                    ننصح بالتواصل مع العميل لفهم سبب الإلغاء وتقديم المساعدة.
                  </div>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-td" style="padding:20px 40px; text-align:center; border-top:1px solid rgba(255,255,255,0.04);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.18);">S&amp;N Lingerie Admin System © 2026 — هذا البريد آلي، لا ترد عليه مباشرة</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
