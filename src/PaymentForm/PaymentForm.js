import {Component} from 'preact';
import $ from 'cash-dom';
import classNames from './PaymentForm.scss';
import render from 'preact-render-to-string';
import {formatAmount, isPaymentFailed, isValidEmail, updateQuery} from 'lib/utils';
import cx from 'classnames';
import APIHandler from 'lib/api';
import {Spinner} from 'spin.js';
import {defaultParams} from 'lib/constants';
import {filterWpwlOptions} from 'lib/propsValidator';
import renderCheckbox from './checkbox';
import {getLocalizedLabels} from 'lib/locales';

const getSubmitText = ({amount, currency, labels, submitText = labels.submitText}) => {
  if (!amount) return labels.payNow;
  const price = formatAmount(amount, currency);
  return submitText.replace('{amount}', price);
};

class PaymentForm extends Component {
  static defaultProps = defaultParams;

  constructor(props) {
    props.labels = Object.assign(getLocalizedLabels(props.locale), props.labels);
    const submit = getSubmitText(props);
    props.labels.submit = submit;
    props.labels.nextStep = submit;
    super(props);
    this.isMobileSafari =
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/);
    window.wpwlOptions = {
      ...filterWpwlOptions(props),
      brandDetection: true,
      onLoadThreeDIframe: this.onLoadThreeDIframe,
      onReady: this.onReady,
      onError: this.onError,
      onBeforeSubmitCard: this.onBeforeSubmitCard,
      onBeforeSubmitDirectDebit: this.onBeforeSubmitDirectDebit,
      useSummaryPage: !props.redirect,
      onSaveTransactionData: this.onSaveTransactionData
    };
    if (props.threeDIframeFullscreen) {
      window.wpwlOptions.threeDIframeSize = {
        width: '100%',
        height: '100%'
      };
    }
    this.hideInitialPaymentForm = false;
    this.state = {
      isTestMode: props.test
    };
  }

  injectPaymentScript(checkoutId, cb) {
    const script = document.createElement('script');
    script.src = this.api.getPaymentWidgetSrc();
    script.async = true;
    script.onload = () => {
      cb && cb();
      this.props.onLoad && this.props.onLoad();
    };
    document.body.appendChild(script);
    this.$script = $(script);
  }

  removePaymentScript() {
    if (this.$script) {
      this.$script.remove();
      this.$script = null;

      // remove script added by paymentWidgets.js
      window.wpwl && wpwl.unload && wpwl.unload();
      $('script[src*="oppwa.com"]').remove();
    }
  }

  onBeforeSubmitCard = e => {
    e.preventDefault();
    if (this.props.onBeforeSubmitCard) {
      return this.props.onBeforeSubmitCard(e) && this.validateEmail(true);
    }
    return this.validateEmail(true);
  };

  onBeforeSubmitDirectDebit = e => {
    if (this.props.onBeforeSubmitDirectDebit) {
      return this.props.onBeforeSubmitDirectDebit(e) && this.validateEmail(true);
    }
    if ($(e.target).hasClass('wpwl-form-directDebit') && !this.validateEmail(true)) {
      e.preventDefault();
    }
  };

  onLoadThreeDIframe = () => {
    this.props.onLoadThreeDIframe && this.props.onLoadThreeDIframe();
    if (this.props.threeDIframeFullscreen) {
      this.$formContainer.find('.wpwl-target').addClass(classNames.fullscreenFrame);
    }
    this.setState({is3DFrame: true});
  };

  onError = error => {
    this.props.onError(error);
    this.setState({isError: true});
  };

  onReady = () => {
    this.props.onReady && this.props.onReady();
    this.setState({isReady: true});
    this.adjustForm();
  };

  onSaveTransactionData = () => {
    const {onPaymentComplete, onPaymentSuccess, onPaymentError} = this.props;
    const spinner = new Spinner(this.props.spinner).spin(document.body);
    this.api.completeCheckout().then(
      data => {
        isPaymentFailed(data.result.code) ? onPaymentError(data) : onPaymentSuccess(data);
        onPaymentComplete(data);
        spinner.stop();
      },
      error => this.props.onError(error)
    );
  };

  checkPaymentError = () => {
    let count = 0;
    let interval = setInterval(() => {
      if (this.$formContainer.find('.wpwl-has-error').length) {
        this.onError();
        clearInterval(interval);
      }
      count++;
      if (count === 10) clearInterval(interval);
    }, 250);
  };

  appendEmail($form) {
    const {showLabels, showPlaceholders, labels} = this.props;
    this.$emailField = $(
      render(
        <div className="wpwl-group wpwl-group-email wpwl-clearfix">
          {showLabels && <div className="wpwl-label wpwl-label-email">{labels.email}</div>}
          <div className="wpwl-wrapper wpwl-wrapper-email">
            <input
              name="customer.email"
              className="wpwl-control wpwl-control-email"
              placeholder={showPlaceholders && labels.email}
              type="email"
            />
          </div>
        </div>
      )
    );
    const $emailInput = this.$emailField.find('input');
    $emailInput.on('blur', () => this.validateEmail());
    $form.prepend(this.$emailField);
  }

  validateEmail(errorOnEmpty = false) {
    if (!this.$emailField) return true;
    const $input = this.$emailField.find('input');
    const value = $input.val();
    if (!value && !errorOnEmpty) {
      return true;
    }
    const isValid = isValidEmail(value);
    const $hint = this.$emailField.find('.wpwl-hint-emailError');
    $input.toggleClass('wpwl-has-error', !isValid);
    if (isValid && $hint.length) {
      $hint.remove();
    } else if (!isValid && !$hint.length) {
      $input.after(
        render(
          <div className="wpwl-hint wpwl-hint-emailError">{this.props.errorMessages.email}</div>
        )
      );
    }

    return isValid;
  }

  adjustForm() {
    const {
      showCardHolder,
      showEmail,
      showBillingAddress,
      customer = {},
      customParameters = {},
      shipping = {},
      primaryColor,
      customSubmitSelector,
      labels,
      compact
    } = this.props;
    const $form = this.$formContainer.find('.wpwl-form-card, .wpwl-form-directDebit');
    const $container = $form.parent();
    const otherMethod = $container.next()[0];

    // add separator
    if (otherMethod && otherMethod.innerHTML.length > 0) {
      $container.after(
        render(<p className={classNames.separator}>{labels.otherPaymentMethods}</p>)
      );
    }

    // move brand icon to the card number field and hide by default
    const $brand = $form
      .find('.wpwl-brand-card')
      .removeClass('wpwl-brand-VISA')
      .addClass('wpwl-brand-GENERIC');

    const $cardNumner = $form.find('.wpwl-group-cardNumber');
    $brand.appendTo($cardNumner.find('.wpwl-wrapper-cardNumber'));

    // show cardholder firs or hide it
    const $cardHolder = $form.find('.wpwl-group-cardHolder');
    if ($cardHolder.length && showCardHolder) {
      compact ? $cardHolder.insertAfter($cardNumner) : $cardHolder.prependTo($form);
    } else {
      $cardHolder.remove();
    }

    if (!showBillingAddress) {
      $form.find('.wpwl-group-billing').css('display', 'none');
    }

    if (showEmail && !customer.email) {
      this.appendEmail($form);
    }

    if (this.isThereRegistrations(window.wpwl)) {
      this.createSwitchButton();
      this.hideInitialFormAndSeparator();
      this.$formContainer
        .find('.wpwl-button-pay[data-action="show-initial-forms"]')
        .on('click', () => this.showSeparator());
    }

    if (this.props.savePaymentDetails) {
      $('.wpwl-form:not(.wpwl-form-registrations)')
        .find('.wpwl-group-submit')
        .before(renderCheckbox(this.props));
    }

    // add custom fields
    Object.keys(customer).forEach(key => {
      const value = customer[key];
      if (value) $form.prepend(`<input type="hidden" name="customer.${key}" value="${value}">`);
    });
    Object.keys(shipping).forEach(key => {
      const value = shipping[key];
      if (value) $form.prepend(`<input type="hidden" name="shipping.${key}" value="${value}">`);
    });
    Object.keys(customParameters).forEach(key => {
      const value = customParameters[key];
      if (value) {
        $form.prepend(
          `<input type="hidden" name="customParameters[SHOPPER_${key}]" value="${value}">`
        );
      }
    });

    if (customSubmitSelector) {
      $form.find('.wpwl-group-submit').css('display', 'none');
    } else if (primaryColor) {
      this.applyCustomColor(primaryColor);
    }
  }

  createSwitchButton() {
    const label = this.getSwitchButtonLabel();
    const $switchPaymentForms = $(
      render(
        <button
          type="button"
          data-action="switch-payment-forms"
          className="wpwl-switch-forms-button">
          {label}
        </button>
      )
    );
    $switchPaymentForms.on('click', () => this.switchPaymentForms());
    $('.wpwl-container:not(.wpwl-container-registration)')
      .last()
      .after($switchPaymentForms);
  }

  getSwitchButtonLabel() {
    return $('.wpwl-button-pay[data-action=show-initial-forms]').text();
  }

  switchPaymentForms() {
    const $initialPaymentForm = $('.wpwl-container:not(.wpwl-container-registration)');
    const $registrationForm = $('.wpwl-container-registration');
    const $separator = this.$formContainer.find('.wpwl-PaymentForm-separator');
    if (this.hideInitialPaymentForm) {
      $initialPaymentForm.css('display', 'none');
      $separator.css('display', 'none');
      $registrationForm.css('display', 'block');
    } else {
      $initialPaymentForm.css('display', 'block');
      $separator.css('display', 'block');
      $registrationForm.css('display', 'none');
    }
    this.hideInitialPaymentForm = !this.hideInitialPaymentForm;
  }

  isThereRegistrations({checkout}) {
    return checkout && checkout.config && checkout.config.registrations.length;
  }

  hideInitialFormAndSeparator() {
    // jQuery is not hidden the initial paymento form by itself
    this.$formContainer
      .find('.wpwl-container:not(.wpwl-container-registration)')
      .css('display', 'none');

    // Hide the "or pay with" separator added by us
    this.$formContainer.find('.wpwl-PaymentForm-separator').css('display', 'none');
  }

  showSeparator() {
    this.$formContainer.find('.wpwl-PaymentForm-separator').css('display', 'block');
  }

  applyCustomColor(primaryColor) {
    this.$formContainer
      .find('.wpwl-button-pay:not([data-action="show-initial-forms"])')
      .css({backgroundColor: primaryColor});
    $('.wpwl-switch-forms-button').css({color: primaryColor});
    $('.wpwl-checkbox-box svg path').css({stroke: primaryColor});
  }

  submitForm = () => {
    const $button = this.$formContainer.find('.wpwl-button-pay');
    $button[0].click();
  };

  isTestMode(checkoutId) {
    const prodRegex = /\.prod/;
    return !prodRegex.test(checkoutId);
  }

  componentDidMount() {
    if (this.props.checkoutId) {
      const isTestMode = this.isTestMode(this.props.checkoutId);
      this.api = new APIHandler({...this.props, test: isTestMode});
      this.setState({isTestMode});
      this.injectPaymentScript(this.props.checkoutId);
    } else {
      const spinner = new Spinner(this.props.spinner).spin(document.body);
      this.api = new APIHandler(this.props);
      this.api.prepareCheckout().then(({id, test}) => {
        if (test !== undefined) this.setState({isTestMode: test});
        this.injectPaymentScript(id, () => spinner.stop());
      }, this.onError);
    }
    this.checkPaymentError();
    if (this.props.customSubmitSelector) {
      $(this.props.customSubmitSelector).on('click', this.submitForm);
    }
  }

  componentWillUnmount() {
    this.removePaymentScript();
    $(this.props.customSubmitSelector).off('click', this.submitForm);
  }

  render(
    {brands, redirectUrl, token, className, popup, compact, fluid, labels},
    {isTestMode, is3DFrame, isReady, isError},
    context
  ) {
    if (token) {
      redirectUrl = updateQuery(redirectUrl, 'token', token);
    }
    return (
      <div
        className={cx(classNames.formContainer, className, {
          [classNames.compact]: compact,
          [classNames.fluid]: fluid,
          [classNames.frame]: is3DFrame,
          [classNames.ready]: isReady,
          [classNames.error]: isError,
          [classNames.mobileSafari]: this.isMobileSafari
        })}
        ref={el => (this.$formContainer = $(el))}>
        {isTestMode && (
          <div className={classNames.testModeWarning}>
            <div>You will not be billed for this test charge.</div>
          </div>
        )}
        <div>
          <form action={redirectUrl} className="paymentWidgets" data-brands={brands} />
        </div>
        <div className={classNames.brand}>
          <span>Powered by</span>{' '}
          <a href="https://monei.net/" target="_blank" tabIndex={-1}>
            {' '}
            <img
              src="https://static.monei.net/monei-logo.svg"
              alt="MONEI"
              title={labels.moneiImageTitle}
            />{' '}
          </a>
        </div>
      </div>
    );
  }
}

export default PaymentForm;
