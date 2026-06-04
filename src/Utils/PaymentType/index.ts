enum paymentMethodType {
    instapay = 'instapay',
    vodafone_cash = 'vodafone_cash',
    bank_transfer = 'bank_transfer',
    cash = 'cash',
    other = 'other'
}
enum paymentTransactionType {
    deposit = 'deposit',
    balance_on_delivery = 'balance_on_delivery',
    refund = 'refund'
}
const paymentMethodArray = Object.values(paymentMethodType);
const paymentTransactionArray = Object.values(paymentTransactionType);
export {
    paymentMethodType,
    paymentTransactionType,
    paymentMethodArray,
    paymentTransactionArray
};
