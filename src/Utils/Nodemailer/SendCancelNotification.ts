import { sendEmail } from './SendEmail';
import { generateCancelOrderEmail } from './CancelOrderTemplate';
import { IOrder } from '../../Model/Order/Iorder';
import CustomerModel from '../../Model/User/Customer/CustomerModel';
import moment from '../DateAndTime';

export const sendCancelOrderNotification = async (
  order: IOrder & { orderNumber: string; _id: any }
): Promise<void> => {
  const adminEmails = [
    process.env.EMAIL,
    process.env.EMAIL1,
    process.env.EMAIL2,
  ].filter(Boolean) as string[];

  if (adminEmails.length === 0) return;

  try {
    const customer = await CustomerModel.findById(order.customer).select('phone').lean();
    const customerPhone = customer?.phone ?? 'غير متاح';

    const cancelDate = new Date(moment().valueOf()).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await sendEmail({
      to: adminEmails,
      subject: `🚫 إلغاء طلب ${order.orderNumber} - S&N Lingerie`,
      html: generateCancelOrderEmail({
        orderNumber: order.orderNumber,
        cancelDate,
        customerPhone,
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
      }),
    });
  } catch (emailError) {
    console.error('Failed to send cancel order notification:', emailError);
  }
};
