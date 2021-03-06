export const defaultParams = {
  brands: 'VISA MASTER',
  redirectUrl: location.href,
  showLabels: false,
  showPlaceholders: true,
  showCardHolder: false,
  showEmail: true,
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
  redirect: true,
  popup: true,
  showCVVHint: true,
  labels: {},
  onPaymentComplete: () => {},
  onPaymentSuccess: () => {},
  onPaymentError: () => {},
  onError: () => {}
};
