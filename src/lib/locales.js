export const locales = {
  en: {
    email: 'Email',
    paymentAmountText: 'payment amount',
    submitText: 'Pay {amount}',
    otherPaymentMethods: 'or pay with',
    savePaymentDetails: 'Store payment details?',
    payNow: 'Pay Now',
    payAmount: 'Pay {amount}',
    moneiImageTitle: 'Best payment gateway rates. The perfect solution to manage your digital payments. Get in now!'
  },
  es: {
    email: 'Email',
    paymentAmountText: 'monto del pago',
    submitText: 'Pagar {amount}',
    otherPaymentMethods: 'o pagar con',
    savePaymentDetails: '¿Almacenar detalles de pago?',
    payNow: 'Pagar Ahora',
    payAmount: 'Pagar {amount}',
    moneiImageTitle: 'Las mejores tarifas de pasarela de pago. La solución perfecta para administrar sus pagos digitales. ¡Entra ahora!'
  },
  pt: {
    email: 'Email',
    paymentAmountText: 'valor do pagamento',
    submitText: 'Pagar {amount}',
    otherPaymentMethods: 'ou pagar com',
    savePaymentDetails: 'Armazenas detalhes de pagamento?',
    payNow: 'Pagar Agora',
    payAmount: 'Pagar {amount}',
    moneiImageTitle: 'Melhores taxas de gateway de pagamento. A solução perfeita para gerenciar seus pagamentos digitais. Entre agora!'
  }
};

export function getLocalizedLabels(locale) {
  const localeNormalized = locale.match(/(\w+)-?/)[1];
  return locales[localeNormalized] || locales['en'];
}

export default locales;
