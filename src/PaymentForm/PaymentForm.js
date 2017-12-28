import {Component} from 'preact';
import $ from 'cash-dom';
import classNames from './PaymentForm.scss';
import render from 'preact-render-to-string';
import {formatAmount, isValidEmail, updateQuery} from 'lib/utils';
import cx from 'classnames';
import checkout from 'lib/checkout';
import Branding from './Branding';
import {Spinner} from 'spin.js';

class PaymentForm extends Component {
  static defaultProps = {
    brands: 'VISA MASTER',
    redirectUrl: location.href,
    showLabels: false,
    showPlaceholders: true,
    showCardHolder: false,
    showEmail: true,
    labels: {
      email: 'Email'
    },
    errorMessages: {
      email: 'Invalid email'
    },
    style: 'plain',
    spinner: {
      lines: 8,
      width: 3,
      radius: 8,
      length: 5,
      position: 'fixed'
    }
  };

  constructor(props) {
    super(props);
    this.apiBaseUrl = `https://${props.test ? 'test.' : ''}monei-api.net`;
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
      validateCard: this.validateCard
    };
  }

  injectPaymentScript(checkoutId, cb) {
    const script = document.createElement('script');
    script.src = `${this.apiBaseUrl}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
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
      window.wpwl && wpwl.unload();
      $('script[src*="oppwa.com"]').remove();
    }
  }

  validateCard = () => {
    if (this.props.validateCard) {
      return this.props.validateCard() && this.validateEmail(true);
    }
    return this.validateEmail(true);
  };

  onLoadThreeDIframe = () => {
    this.props.onLoadThreeDIframe && this.props.onLoadThreeDIframe();
    this.setState({is3DFrame: true});
  };

  onError = error => {
    this.props.onError && this.props.onError(error);
    this.setState({hasError: true});
  };

  onReady = () => {
    this.props.onReady && this.props.onReady();
    this.setState({isReady: true});
    this.adjustForm();
  };

  checkPaymentError = () => {
    if (this.$formContainer.find('.wpwl-message.wpwl-has-error').length) {
      this.onError();
    }
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
              type="text"
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
      customer,
      billing,
      customParameters,
      primaryColor
    } = this.props;
    const $form = this.$formContainer.find('.wpwl-form-card');

    // move brand icon to the card number field and hide by default
    const $brand = $form
      .find('.wpwl-brand-card')
      .removeClass('wpwl-brand-VISA')
      .addClass('wpwl-brand-GENERIC');
    $brand.appendTo($form.find('.wpwl-wrapper-cardNumber'));

    // show cardholder firs or hide it
    const $cardHolder = $form.find('.wpwl-group-cardHolder');
    if (showCardHolder) {
      $cardHolder.prependTo($form);
    } else {
      $cardHolder.remove();
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
    Object.keys(billing).forEach(key => {
      const value = billing[key];
      if (value) $form.prepend(`<input type="hidden" name="billing.${key}" value="${value}">`);
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
      checkout(this.props).then(({id, error}) => {
        if (error) {
          return this.onError(error);
        }
        this.injectPaymentScript(id, () => {
          spinner.stop();
        });
      });
    }
    setTimeout(() => {
      this.checkPaymentError();
    }, 1000);
  }

  componentWillUnmount() {
    this.removePaymentScript();
  }

  render({brands, redirectUrl, token, className, test, popup}, {is3DFrame, isReady}, context) {
    if (token) {
      redirectUrl = updateQuery(redirectUrl, 'token', token);
    }
    return (
      <div
        className={cx(classNames.formContainer, className, {
          [classNames.frame]: is3DFrame,
          [classNames.ready]: isReady
        })}
        ref={el => (this.$formContainer = $(el))}>
        {!is3DFrame &&
          test && (
            <div className={classNames.testModeWarning}>
              <div>You will not be billed for this test charge.</div>
            </div>
          )}
        <div>
          <form action={redirectUrl} className="paymentWidgets" data-brands={brands} />
        </div>
        {!popup && <Branding className={classNames.brand} />}
      </div>
    );
  }
}

export default PaymentForm;
