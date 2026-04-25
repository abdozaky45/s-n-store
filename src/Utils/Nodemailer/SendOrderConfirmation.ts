import { sendEmail } from './SendEmail';
import { generateOrderEmail } from './SendInvoice';
import { getCustomerInfoById } from '../../Service/User/CustomerInfoService';
import { IOrder } from '../../Model/Order/Iorder';

export const sendOrderConfirmationEmail = async (
  customerInfoId: string,
  order: IOrder & { orderNumber: string }
): Promise<void> => {
  try {
    const info = await getCustomerInfoById(customerInfoId);
    if (!info?.email) return;
    await sendEmail({
      to: info.email,
      subject: `تأكيد طلبك ${order.orderNumber} - S&N Lingerie`,
      html: generateOrderEmail({
        orderNumber: order.orderNumber,
        firstName: info.firstName,
        lastName: info.lastName,
        products: order.products.map((p) => ({
          name: p.name.ar,
          size: p.size,
          quantity: p.quantity,
          itemPrice: p.itemPrice,
          totalPrice: p.totalPrice,
        })),
        subTotal: order.subTotal,
        discount: order.discount,
        shippingCost: order.shippingCost,
        totalAmount: order.totalAmount,
        freeShipping: order.freeShipping,
      }),
    });
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
  }
};
