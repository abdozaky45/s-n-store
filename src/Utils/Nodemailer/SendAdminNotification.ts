import { sendEmail } from './SendEmail';
import { generateAdminOrderEmail } from './AdminOrderTemplate';
import { IOrder } from '../../Model/Order/Iorder';
import moment from '../DateAndTime';

export const sendAdminOrderNotification = async (
  order: IOrder & { orderNumber: string }
): Promise<void> => {
  const adminEmails = [
    process.env.EMAIL,
    process.env.EMAIL1,
    process.env.EMAIL2,
  ].filter(Boolean) as string[];

  if (adminEmails.length === 0) return;

  const orderDate = new Date(moment().valueOf()).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    await sendEmail({
      to: adminEmails,
      subject: `🔔 طلب جديد ${order.orderNumber} - S&N Lingerie`,
      html: generateAdminOrderEmail({
        orderNumber: order.orderNumber,
        orderDate,
        products: order.products.map((p) => ({
          name: p.name.ar,
          size: p.size,
          quantity: p.quantity,
          totalPrice: p.totalPrice,
        })),
        subTotal: order.subTotal,
        discount: order.discount,
        shippingCost: order.shippingCost,
        totalAmount: order.totalAmount,
        freeShipping: order.freeShipping,
        appliedOffer: !!order.appliedOffer,
      }),
    });
  } catch (emailError) {
    console.error('Failed to send admin order notification:', emailError);
  }
};
