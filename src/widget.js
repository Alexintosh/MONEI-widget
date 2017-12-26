import {render} from 'preact';
import $ from 'cash-dom';
import PaymentButton from './PaymentButton';
import PaymentForm from './PaymentForm';
import checkout from 'lib/checkout';
import {normalizeDataSet} from './lib/utils';

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
  const props = Object.assign({}, normalizeDataSet(container.dataset), options);
  const Component = props.popup ? PaymentButton : PaymentForm;
  if (props.checkoutId) {
    render(<Component {...props} />, container);
  } else {
    checkout(props).then(({id, error}) => {
      render(<Component {...props} checkoutId={id} error={error} />, container);
    });
  }
}

function disableAutoSetup() {
  autoSetupEnabled = false;
}

$(document).ready(() => autoSetupEnabled && setupAll());

export default {setup, setupAll, disableAutoSetup};
