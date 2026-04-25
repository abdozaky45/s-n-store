interface AdminOrderProduct {
  name: string;
  size: string;
  quantity: number;
  totalPrice: number;
}

interface AdminOrderEmailData {
  orderNumber: string;
  orderDate: string;
  products: AdminOrderProduct[];
  subTotal: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  freeShipping?: boolean;
  appliedOffer?: boolean;
}

const infoCard = (label: string, value: string, valueColor = '#f0e6ec') => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation"
    style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:10px;">
    <tr><td style="padding:14px 16px;">
      <div style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(240,160,192,0.5); letter-spacing:1px; text-transform:uppercase; margin-bottom:4px;">${label}</div>
      <div style="font-family:'Cairo',Arial,sans-serif; font-size:14px; color:${valueColor}; font-weight:600;">${value}</div>
    </td></tr>
  </table>
`;

export const generateAdminOrderEmail = (data: AdminOrderEmailData): string => {
  const { orderNumber, orderDate, products, subTotal, discount, shippingCost, totalAmount, freeShipping, appliedOffer } = data;

  const productsRowsHTML = products.map((p) => `
    <tr>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#f0e6ec; font-weight:600; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04);">${p.name}</td>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#d0b0be; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); white-space:nowrap;">${p.size} × ${p.quantity}</td>
      <td class="products-col3" style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#d0b0be; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); white-space:nowrap;">${p.totalPrice.toLocaleString()} ج.م</td>
    </tr>
  `).join('');

  const discountRow = discount > 0 ? `
    <tr>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(240,160,192,0.7); padding:6px 0;">الخصم</td>
      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#e87aa0; padding:6px 0; text-align:left;">- ${discount.toLocaleString()} ج.م</td>
    </tr>
  ` : '';

  const offerValue = appliedOffer && discount > 0
    ? `🎉 خصم ${discount.toLocaleString()} ج.م`
    : 'لا يوجد';
  const offerColor = appliedOffer && discount > 0 ? '#e87aa0' : '#f0e6ec';

  const shippingLabel = freeShipping
    ? 'الشحن &nbsp;<span style="background:#c2547a;color:#fff;font-size:10px;padding:2px 7px;border-radius:20px;">مجاني</span>'
    : 'الشحن';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>طلب جديد - S&N Lingerie Admin</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet"/>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; background-color: #0f0a0d; }
    a { color: inherit; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper        { width: 100% !important; }
      .header-td      { padding: 28px 20px !important; }
      .header-title   { font-size: 20px !important; }
      .section-td     { padding: 22px 20px !important; }
      .cta-td         { padding: 24px 20px !important; }
      .footer-td      { padding: 16px 20px !important; }
      .info-row       { display: block !important; width: 100% !important; }
      .info-cell      { display: block !important; width: 100% !important; padding: 5px 0 !important; }
      .products-col3  { display: none !important; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#0f0a0d;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="background:#1a0d13; border-radius:20px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td class="header-td" style="background:linear-gradient(135deg,#8b3a5a 0%,#c2547a 50%,#e87aa0 100%); padding:36px 40px; text-align:center;">
              <div style="font-family:'Cairo',Arial,sans-serif; display:inline-block; background:rgba(255,255,255,0.2); padding:6px 18px; border-radius:20px; font-size:11px; color:#fff; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;">🔔 إشعار فوري</div>
              <div class="header-title" style="font-family:'Playfair Display',Georgia,serif; font-size:24px; color:#fff; font-weight:700;">طلب جديد وارد!</div>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.6); letter-spacing:3px; margin-top:6px; text-transform:uppercase;">S&amp;N LINGERIE — لوحة الإدارة</div>
            </td>
          </tr>

          <!-- Alert bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#5c2d42,#8b3a5a); padding:14px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:#f5c6d8;">📅 ${orderDate}</td>
                  <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; font-weight:700; color:#e87aa0; letter-spacing:1px; text-align:left;">${orderNumber}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info Cards -->
          <tr>
            <td class="section-td" style="padding:28px 40px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(240,160,192,0.7); letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">معلومات الطلب</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr class="info-row">
                  <td class="info-cell" style="width:50%; padding:0 6px 6px 0; vertical-align:top;">
                    ${infoCard('رقم الطلب', orderNumber)}
                  </td>
                  <td class="info-cell" style="width:50%; padding:0 0 6px 6px; vertical-align:top;">
                    ${infoCard('حالة الطلب', '⏳ قيد المراجعة', '#e87aa0')}
                  </td>
                </tr>
                <tr class="info-row">
                  <td class="info-cell" style="width:50%; padding:6px 6px 0 0; vertical-align:top;">
                    ${infoCard('طريقة الدفع', 'الدفع عند الاستلام')}
                  </td>
                  <td class="info-cell" style="width:50%; padding:6px 0 0 6px; vertical-align:top;">
                    ${infoCard('العرض المطبق', offerValue, offerColor)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td class="section-td" style="padding:28px 40px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(240,160,192,0.7); letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">المنتجات المطلوبة</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <th style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(240,160,192,0.5); letter-spacing:1px; text-transform:uppercase; text-align:right; padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.07); font-weight:400;">المنتج</th>
                  <th style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(240,160,192,0.5); letter-spacing:1px; text-transform:uppercase; text-align:right; padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.07); font-weight:400; white-space:nowrap;">المقاس / الكمية</th>
                  <th class="products-col3" style="font-family:'Cairo',Arial,sans-serif; font-size:10px; color:rgba(240,160,192,0.5); letter-spacing:1px; text-transform:uppercase; text-align:right; padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.07); font-weight:400; white-space:nowrap;">الإجمالي</th>
                </tr>
                ${productsRowsHTML}
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td class="section-td" style="padding:28px 40px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(240,160,192,0.7); letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">ملخص مالي</div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
                style="background:rgba(194,84,122,0.1); border:1px solid rgba(194,84,122,0.25); border-radius:12px;">
                <tr><td style="padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(240,160,192,0.7); padding:6px 0;">المجموع الفرعي</td>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(240,160,192,0.7); text-align:left; padding:6px 0;">${subTotal.toLocaleString()} ج.م</td>
                    </tr>
                    ${discountRow}
                    <tr>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(240,160,192,0.7); padding:6px 0;">${shippingLabel}</td>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:13px; color:rgba(240,160,192,0.7); text-align:left; padding:6px 0;">${freeShipping ? '0' : shippingCost.toLocaleString()} ج.م</td>
                    </tr>
                    <tr><td colspan="2"><div style="height:1px; background:rgba(194,84,122,0.3); margin:8px 0;"></div></td></tr>
                    <tr>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:18px; font-weight:700; color:#e87aa0; padding:6px 0;">الإجمالي النهائي</td>
                      <td style="font-family:'Cairo',Arial,sans-serif; font-size:18px; font-weight:700; color:#e87aa0; text-align:left; padding:6px 0;">${totalAmount.toLocaleString()} ج.م</td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="cta-td" style="padding:32px 40px; text-align:center; background:rgba(255,255,255,0.02);">
              <a href="#" style="display:inline-block; background:linear-gradient(135deg,#c2547a,#e87aa0); color:#ffffff; text-decoration:none; padding:14px 36px; border-radius:30px; font-family:'Cairo',Arial,sans-serif; font-size:14px; font-weight:700; letter-spacing:1px;">عرض الطلب في لوحة التحكم</a>
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:12px; color:rgba(240,160,192,0.4); margin-top:12px;">يرجى مراجعة الطلب والتأكيد في أقرب وقت ممكن</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-td" style="padding:20px 40px; text-align:center; border-top:1px solid rgba(255,255,255,0.05);">
              <div style="font-family:'Cairo',Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.2);">S&amp;N Lingerie Admin System © 2026 — هذا البريد آلي، لا ترد عليه مباشرة</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
