export default function(amount, currency) {
  const formattedAmount = String(amount).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
  switch (currency) {
    case 'eur':
      return `€${formattedAmount}`;
    case 'usd':
      return `$${formattedAmount}`;
  }

  return `${formattedAmount} ${currency.toUpperCase()}`;
};
