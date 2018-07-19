export const defaultParams = {
  brands: 'VISA MASTER',
  redirectUrl: location.href,
  showLabels: false,
  showPlaceholders: true,
  showCardHolder: false,
  showEmail: true,
  labels: {
    email: 'Email',
    otherPaymentMethods: 'or pay with',
    savePaymentDetails: 'Store payment details?'
  },
  errorMessages: {
    email: 'Invalid email'
  },
  style: false,
  spinner: {
    lines: 8,
    width: 3,
    radius: 8,
    length: 5,
    position: 'fixed'
  },
  submitText: 'Pay {amount}',
  redirect: true,
  popup: true,
  onPaymentComplete: () => {},
  onPaymentSuccess: () => {},
  onPaymentError: () => {},
  onError: () => {}
};
