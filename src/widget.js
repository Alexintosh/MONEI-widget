import {render} from 'preact';
import $ from 'cash-dom';
import PaymentButton from './PaymentButton';
import PaymentForm from './PaymentForm';
import {normalizeDataSet} from './lib/utils';
import merge from 'deepmerge';
import validateProps from 'lib/propsValidator';
import {isEmpty} from 'lib/utils';

export const WIDGET_CONTAINER_CLASS_NAME = 'monei-widget';

let autoSetupEnabled = true;

function setupAll() {
  $(`.${WIDGET_CONTAINER_CLASS_NAME}`).each(container => setup(container));
}

function setup(element, options) {
  let container;
  if (typeof element === 'string') {
    container = document.getElementById(element);
  } else if (element instanceof Element) {
    container = element;
  }

  return setupWidget(container, options);
}

function setupWidget(container, options = {}) {
  const ds = container.dataset;
  const defaultProps = {
    popup: true,
    customer: {
      merchantCustomerId: ds.merchantCustomerId,
      email: ds.customerEmail,
      givenName: ds.customerGivenName,
      middleName: ds.customerMiddleName,
      surname: ds.customerSurname,
      sex: ds.customerSex,
      birthDate: ds.customerBirthDate,
      phone: ds.customerPhone,
      mobile: ds.customerMobile,
      workPhone: ds.customerWorkPhone,
      companyName: ds.customerCompanyName,
      identificationDocType: ds.customerIdentificationDocType,
      identificationDocId: ds.customerIdentificationDocId,
      status: ds.customerStatus
    },
    billingAddress: {
      country: ds.billingCountry,
      state: ds.billingState,
      city: ds.billingCity,
      postcode: ds.billingPostalcode,
      street1: ds.billingStreet1,
      street2: ds.billingStreet2
    },
    shipping: {
      country: ds.shippingCountry,
      state: ds.shippingState,
      city: ds.shippingCity,
      postcode: ds.shippingPostalcode,
      street1: ds.shippingStreet1,
      street2: ds.shippingStreet2,
      method: ds.shippingMethod,
      comment: ds.shippingComment
    },
    showBillingAddress: false,
    customParameters: {},
    labels: {
      email: 'Email'
    },
    errorMessages: {
      email: 'Invalid email'
    },
    spinner: {
      lines: 8,
      width: 3,
      radius: 8,
      length: 5,
      position: 'fixed'
    },
    locale: window.navigator.userLanguage || window.navigator.language
  };
  const props = merge.all([defaultProps, normalizeDataSet(ds), options]);
  const error = validateProps(props);
  if (error) {
    console.error(error);
    return;
  }
  if (typeof props.billingAddress !== 'boolean' && isEmpty(props.billingAddress)) {
    props.billingAddress = props.showBillingAddress;
  }
  const Component = props.popup ? PaymentButton : PaymentForm;
  container.moneiWidget = render(
    <Component {...props} container={container} />,
    container,
    container.moneiWidget
  );
}

function disableAutoSetup() {
  autoSetupEnabled = false;
}

$(document).ready(() => autoSetupEnabled && setupAll());

export default {
  setup,
  setupAll,
  disableAutoSetup
};
