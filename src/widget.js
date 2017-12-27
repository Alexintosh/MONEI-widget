import {render} from 'preact';
import $ from 'cash-dom';
import PaymentButton from './PaymentButton';
import PaymentForm from './PaymentForm';
import {normalizeDataSet} from './lib/utils';
import assign from 'object-assign-deep';

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
  const defaultProps = {
    customer: {
      email: container.dataset['customerEmail'],
      givenName: container.dataset['customerGivenName'],
      middleName: container.dataset['customerMiddleName'],
      surname: container.dataset['customerSurname'],
      sex: container.dataset['customerSex'],
      birthDate: container.dataset['customerBirthDate'],
      phone: container.dataset['customerPhone'],
      mobile: container.dataset['customerMobile'],
      workPhone: container.dataset['customerWorkPhone'],
      companyName: container.dataset['customerCompanyName'],
      status: container.dataset['customerStatus']
    },
    billing: {
      street1: container.dataset['billingStreet1'],
      street2: container.dataset['billingStreet2'],
      country: container.dataset['billingCountry'],
      city: container.dataset['billingCity'],
      state: container.dataset['billingState'],
      postcode: container.dataset['billingPostcode']
    },
    customParameters: {},
    labels: {
      checkout: 'Pay {amount}',
      email: 'Email'
    },
    errorMessages: {
      email: 'Invalid email'
    }
  };
  const props = assign(defaultProps, normalizeDataSet(container.dataset), options);
  const Component = props.popup ? PaymentButton : PaymentForm;
  render(<Component {...props} />, container);
}

function disableAutoSetup() {
  autoSetupEnabled = false;
}

$(document).ready(() => autoSetupEnabled && setupAll());

export default {setup, setupAll, disableAutoSetup};
