import { sendEmail } from './SendEmail';
import { generateOfferNotificationEmail } from './OfferNotificationTemplate';
import CustomerInfoModel from '../../Model/User/Customer/CustomerInfoModel';
import AuthModel from '../../Model/User/auth/AuthModel';
import { UserTypeEnum } from '../UserType';
import { IOffer } from '../../Model/Offers/IOffers';

const collectRecipientEmails = async (): Promise<string[]> => {
  const [customerInfoDocs, authDocs] = await Promise.all([
    CustomerInfoModel.find({ email: { $exists: true, $ne: '' } }).select('email').lean(),
    AuthModel.find({ role: UserTypeEnum.USER, email: { $exists: true, $ne: '' } }).select('email').lean(),
  ]);

  const emailSet = new Set<string>();
  customerInfoDocs.forEach((doc) => { if (doc.email) emailSet.add(doc.email.toLowerCase()); });
  authDocs.forEach((doc) => { if (doc.email) emailSet.add(doc.email.toLowerCase()); });

  return [...emailSet];
};

export const sendOfferNotificationToCustomers = async (
  activeOffers: (IOffer & { _id: any })[]
): Promise<void> => {
  if (activeOffers.length === 0) return;

  try {
    const emails = await collectRecipientEmails();
    if (emails.length === 0) return;

    const html = generateOfferNotificationEmail(
      activeOffers.map((o) => ({
        type: o.type,
        description: o.description,
        discountAmount: o.discountAmount,
        minOrderAmount: o.minOrderAmount,
      }))
    );

    const subject = activeOffers.length === 1
      ? `🎀 عرض حصري لك اليوم - S&N Langire`
      : `🎀 ${activeOffers.length} عروض حصرية لك اليوم - S&N Langire`;

    // send in batches of 50 to avoid exceeding nodemailer limits
    const BATCH = 50;
    for (let i = 0; i < emails.length; i += BATCH) {
      await sendEmail({ to: emails.slice(i, i + BATCH), subject, html });
    }
  } catch (error) {
    console.error('Failed to send offer notifications:', error);
  }
};
