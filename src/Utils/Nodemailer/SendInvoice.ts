type Product = {
  name: string;
  size: string;
  quantity: number;
  price: number;
};

type Options = {
  discount?: number;
  shipping?: number;
};

export const generateOrderEmail = (
  products: Product[],
  options?: Options
) => {
  const discount = options?.discount || 0;
  const shipping = options?.shipping || 0;

  const subtotal = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const total = subtotal - discount + shipping;

  const productsHTML = products
    .map(
      (product) => `
    <div class="product-item">
      <div class="product-icon">👗</div>
      <div class="product-details">
        <div class="product-name">${product.name}</div>
        <div class="product-meta">
          المقاس: ${product.size} &nbsp;|&nbsp; الكمية: ${product.quantity}
        </div>
      </div>
      <div class="product-price">
        ${(product.price * product.quantity).toLocaleString()} ج.م
      </div>
    </div>
  `
    )
    .join("");

  return `
  <!-- Products -->
  <div class="section">
    <div class="section-title"><span>🛍️</span> تفاصيل الطلب</div>
    ${productsHTML}
  </div>

  <!-- Summary -->
  <div class="section" style="padding-top: 0;">
    <div class="summary-box">
      <div class="summary-row">
        <span>المجموع الفرعي</span>
        <span>${subtotal.toLocaleString()} ج.م</span>
      </div>

      ${
        discount > 0
          ? `
      <div class="summary-row discount">
        <span>🎉 خصم العرض</span>
        <span>- ${discount.toLocaleString()} ج.م</span>
      </div>`
          : ""
      }

      <div class="summary-row">
        <span>الشحن</span>
        <span>${shipping.toLocaleString()} ج.م</span>
      </div>

      <div class="summary-row total">
        <span>الإجمالي</span>
        <span>${total.toLocaleString()} ج.م</span>
      </div>
    </div>
  </div>
  `;
};