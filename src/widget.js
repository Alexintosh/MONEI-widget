import {render} from 'preact';
import $ from 'cash-dom';
import PaymentForm from './PaymentForm';

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
  const props = Object.assign({}, container.dataset, options);
  render(<PaymentForm {...props} />, container);
}

function disableAutoSetup() {
  autoSetupEnabled = false;
}

$(document).ready(() => autoSetupEnabled && setupAll());

export default {setup, setupAll, disableAutoSetup};
