export default function({
  token,
  amount,
  currency,
  paymentType,
  descriptor,
  planId,
  merchantTransactionId,
  merchantInvoiceId,
  transactionCategory,
  apiBase = API_BASE
}) {
  const url = planId ? `/plans/${planId}/subscriptions` : '/checkouts';
  return fetch(apiBase + url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      token,
      amount,
      currency,
      descriptor,
      planId,
      paymentType,
      merchantTransactionId,
      merchantInvoiceId,
      transactionCategory
    })
  })
    .then(
      res =>
        res.status >= 200 && res.status < 300
          ? res
          : Promise.reject(res ? res.statusText : 'Internal server error')
    )
    .then(res => res.json())
    .catch(err => ({error: err.message || err}));
}
