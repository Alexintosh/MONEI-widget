import {render} from 'preact';
import $ from 'cash-dom';
import PaymentButton from './PaymentButton';
import PaymentForm from './PaymentForm';
import {normalizeDataSet} from './lib/utils';
import merge from 'deepmerge';
import validateProps from 'lib/propsValidator';

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

function setupWidget(container, options) {
  const ds = container.dataset;
  const defaultProps = {
    popup: true,
    customer: {
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
      status: ds.customerStatus
    },
    billing: {
      street1: ds.billingStreet1,
      street2: ds.billingStreet2,
      country: ds.billingCountry,
      city: ds.billingCity,
      state: ds.billingState,
      postcode: ds.billingPostcode
    },
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
      radius: 5,
      length: 5,
      position: 'fixed'
    }
  };
  const props = merge.all([defaultProps, normalizeDataSet(ds), options]);
  const error = validateProps(props);
  if (error) {
    console.error(error);
    return;
  }
  const Component = props.popup ? PaymentButton : PaymentForm;
  render(<Component {...props} container={container} />, container);
}

function disableAutoSetup() {
  autoSetupEnabled = false;
}

$(document).ready(() => autoSetupEnabled && setupAll());

export default {
  setup,
  setupAll,
  disableAutoSetup,
  PaymentForm,
  PaymentButton
};
