enum orderStatusType {
    under_review = 'under_review',
    confirmed = 'confirmed',
    ordered = 'ordered',
    shipped = 'shipped',
    delivered = 'delivered',
    deleted = 'deleted',
    cancelled = 'cancelled'
}
const orderStatusArray = Object.values(orderStatusType);
export { orderStatusArray, orderStatusType };