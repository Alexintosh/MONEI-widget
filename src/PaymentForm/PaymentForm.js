import {Component} from 'preact';
import loadJS from 'load-js';
import $ from 'cash-dom';
import classNames from './PaymentForm.scss';
import render from 'preact-render-to-string';
import {isValidEmail} from 'lib/utils';

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
    style: 'plain'
  };

  constructor(props) {
    super(props);
    this.state = {
      is3DFrame: false
    };
    window.wpwlOptions = {
      ...props,
      brandDetection: true,
      onLoadThreeDIframe: this.onLoadThreeDIframe,
      onReady: this.onReady,
      onError: this.onError,
      validateCard: this.validateCard
    };
  }

  validateCard = () => {
    this.props.validateCard && this.props.validateCard();
    this.validateEmail(true);
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
    this.adjustForm();
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
    const $form = this.$formContainer.find('.wpwl-form');

    // move brand icon to the card number field and hide by default
    const $brand = $form.find('.wpwl-brand-card').addClass('wpwl-brand-GENERIC');
    $brand.appendTo($form.find('.wpwl-wrapper-cardNumber'));

    // show cardholder firs or hide it
    const $cardHolder = $form.find('.wpwl-group-cardHolder');
    if (this.props.showCardHolder) {
      $cardHolder.prependTo($form);
    } else {
      $cardHolder.remove();
    }

    if (this.props.showEmail) {
      this.appendEmail($form);
    }
  }

  checkPaymentError = () => {
    if (this.$formContainer.find('.wpwl-message.wpwl-has-error').length) {
      this.onError();
    }
  };

  componentDidMount() {
    loadJS({
      async: true,
      url: `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${this.props.checkoutId}`
    }).then(() => {
      setTimeout(this.checkPaymentError, 1000);
    });
  }

  render({brands, redirectUrl}, {isFrame, hasError, error}, context) {
    const config = window.wpwl || {};
    const {amount, currency} = config.checkout || {};
    console.log(config);
    return (
      <div className={classNames.formContainer} ref={el => (this.$formContainer = $(el))}>
        <form action={redirectUrl} className="paymentWidgets" data-brands={brands} />
      </div>
    );
  }
}

export default PaymentForm;
