export const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/;

export const isValidEmail = email => {
  if (!email) return false;
  return email.match(EMAIL_REGEX);
};

export const updateQuery = (uri, key, value) => {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return uri + separator + key + '=' + value;
  }
};

const parseBoolean = str => {
  if (str === 'true' || str === '') return true;
  if (str === 'false') return false;
  return str;
};

export const normalizeDataSet = data => {
  const result = {};
  Object.entries(data).forEach(([key, value]) => {
    result[key] = parseBoolean(value);
  });
  return result;
};

export const formatAmount = (amount, currency) => {
  const formattedAmount = String(amount).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
  if (!currency) return formattedAmount;
  switch (currency.toUpperCase()) {
    case 'EUR':
      return `€${formattedAmount}`;
    case 'USD':
      return `$${formattedAmount}`;
  }

  return `${formattedAmount} ${currency.toUpperCase()}`;
};

export const isEmpty = obj => {
  let isEmpty = true;
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      isEmpty = false;
    }
  });
  return isEmpty;
};
