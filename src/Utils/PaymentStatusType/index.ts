enum paymentStatusType {
    unpaid = 'unpaid',
    partially_paid = 'partially_paid',
    paid = 'paid',
    refund_pending = 'refund_pending',
    refunded = 'refunded'
}
const paymentStatusArray = Object.values(paymentStatusType);
export { paymentStatusArray, paymentStatusType };
