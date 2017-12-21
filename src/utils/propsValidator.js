const errorMsg = (prop) => `MONEI Widget. Failed to create a widget. Missing ${prop}.`;
const paymentTypes = ['PA', 'DB'];

export default ({token, amount, currency, paymentType}) => {
  if (!token) return errorMsg('token');
  if (paymentType && !paymentTypes.includes(paymentType)) {
    return `Unsupported paymentType, expected [${paymentTypes.join(', ')}]`
  }
  if (!amount) return errorMsg('amount');
  if (!currency) return errorMsg('currency');
}
