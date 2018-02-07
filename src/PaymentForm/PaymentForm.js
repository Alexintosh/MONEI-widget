import {Component} from 'preact';
import $ from 'cash-dom';
import classNames from './PaymentForm.scss';
import render from 'preact-render-to-string';
import {formatAmount, isValidEmail, updateQuery} from 'lib/utils';
import cx from 'classnames';
import checkout from 'lib/checkout';
import {Spinner} from 'spin.js';
import {defaultParams} from 'lib/constants';

class PaymentForm extends Component {
  static defaultProps = defaultParams;

  constructor(props) {
    super(props);
    this.isMobileSafari =
      navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/);
    if (props.submitText) {
      props.labels.submit = props.submitText.replace(
        '{amount}',
        formatAmount(props.amount, props.currency)
      );
    }
    window.wpwlOptions = {
      ...props,
      brandDetection: true,
      onLoadThreeDIframe: this.onLoadThreeDIframe,
      onReady: this.onReady,
      onError: this.onError,
      onBeforeSubmitCard: this.onBeforeSubmitCard,
      onBeforeSubmitDirectDebit: this.onBeforeSubmitDirectDebit
    };
    this.state = {
      isTestMode: props.test
    };
  }

  injectPaymentScript(checkoutId, cb) {
    const script = document.createElement('script');
    const apiBaseUrl = `https://${this.state.isTestMode ? 'test.' : ''}oppwa.com`;
    script.src = `${apiBaseUrl}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
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
    this.setState({is3DFrame: true});
  };

  onError = error => {
    this.props.onError && this.props.onError(error);
    this.setState({isError: true});
  };

  onReady = () => {
    this.props.onReady && this.props.onReady();
    this.setState({isReady: true});
    this.adjustForm();
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
      labels
    } = this.props;
    const $form = this.$formContainer.find('.wpwl-form-card, .wpwl-form-directDebit');
    const $container = $form.parent();

    // add separator
    if (!$container.is(':last-child')) {
      $container.after(
        render(<p className={classNames.separator}>{labels.otherPaymentMethods}</p>)
      );
    }

    // move brand icon to the card number field and hide by default
    const $brand = $form
      .find('.wpwl-brand-card')
      .removeClass('wpwl-brand-VISA')
      .addClass('wpwl-brand-GENERIC');
    $brand.appendTo($form.find('.wpwl-wrapper-cardNumber'));

    // show cardholder firs or hide it
    const $cardHolder = $form.find('.wpwl-group-cardHolder');
    if ($cardHolder.length && showCardHolder) {
      $cardHolder.prependTo($form);
    } else {
      $cardHolder.remove();
    }

    if (!showBillingAddress) {
      $form.find('.wpwl-group-billing').css('display', 'none');
    }

    if (showEmail && !customer.email) {
      this.appendEmail($form);
    }

    $form.find('.wpwl-button-pay').css({backgroundColor: primaryColor});

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
      if (value)
        $form.prepend(
          `<input type="hidden" name="customParameters[SHOPPER_${key}]" value="${value}">`
        );
    });
  }

  componentDidMount() {
    if (this.props.checkoutId) {
      this.injectPaymentScript(this.props.checkoutId);
    } else {
      const spinner = new Spinner(this.props.spinner).spin(document.body);
      checkout(this.props).then(({id, test, error}) => {
        if (error) {
          return this.onError(error);
        }
        if (test !== undefined) this.setState({isTestMode: test});
        this.injectPaymentScript(id, () => {
          spinner.stop();
        });
      });
    }
    this.checkPaymentError();
  }

  componentWillUnmount() {
    this.removePaymentScript();
  }

  render(
    {brands, redirectUrl, token, className, popup},
    {isTestMode, is3DFrame, isReady, isError},
    context
  ) {
    if (token) {
      redirectUrl = updateQuery(redirectUrl, 'token', token);
    }
    return (
      <div
        className={cx(classNames.formContainer, className, {
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
            <img
              src="https://static.monei.net/monei-logo.svg"
              alt="MONEI"
              title="Best payment gateway rates. The perfect solution to manage your digital payments. Get in now!"
            />
          </a>
        </div>
      </div>
    );
  }
}

export default PaymentForm;
