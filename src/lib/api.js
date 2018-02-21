const checkStatus = res =>
  res.status >= 200 && res.status < 300
    ? res
    : Promise.reject(res ? res.statusText : 'Internal server error');

const toJSON = res => res.json();
const formatError = err => ({error: err.message || err});

export default class APIHandler {
  constructor({
    token,
    amount,
    currency,
    paymentType,
    descriptor,
    planId = false,
    merchantTransactionId,
    merchantInvoiceId,
    transactionCategory,
    moneiApiBase = API_BASE,
    checkoutId,
    test
  }) {
    this.checkoutData = {
      token,
      amount,
      currency,
      paymentType,
      descriptor,
      planId,
      merchantTransactionId,
      merchantInvoiceId,
      transactionCategory
    };
    this.checkoutId = checkoutId;
    this.isTestMode = test;
    this.moneiApiBase = moneiApiBase;
  }

  prepareCheckout() {
    const {planId} = this.checkoutData;
    const url = planId ? `/plans/${planId}/subscriptions` : '/checkouts';
    return fetch(this.moneiApiBase + url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(this.checkoutData)
    })
      .then(checkStatus)
      .then(toJSON)
      .then(data => {
        if (data.error) return Promise.reject(data.error);
        if (data.test !== undefined) this.isTestMode = data.test;
        this.checkoutId = data.id;
        return data;
      })
      .catch(formatError);
  }

  get apiBase() {
    return `https://${this.isTestMode ? 'test.' : ''}oppwa.com/v1`;
  }

  getPaymentWidgetSrc() {
    return `${this.apiBase}/paymentWidgets.js?checkoutId=${this.checkoutId}`;
  }

  completePayment() {
    return fetch(`${this.apiBase}/checkouts/${this.checkoutId}/payment`, {method: 'POST'})
      .then(checkStatus)
      .catch(formatError);
  }

  getPaymentData() {
    const {planId, token} = this.checkoutData;
    const url = planId
      ? `/plans/${planId}/subscriptions/payment-status?token=${token}&checkoutId=${this.checkoutId}`
      : `/checkouts/${this.checkoutId}?token=${token}`;
    return fetch(this.moneiApiBase + url, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'}
    })
      .then(checkStatus)
      .then(toJSON)
      .catch(formatError);
  }

  completeCheckout = async () => {
    await this.completePayment();
    return await this.getPaymentData();
  };
}
