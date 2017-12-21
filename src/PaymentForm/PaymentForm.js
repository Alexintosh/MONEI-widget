import {Component} from 'preact';
import loadJS from 'load-js';
import $ from 'cash-dom';
import classNames from './PaymentForm.scss';
import render from 'preact-render-to-string';
import {isValidEmail} from 'lib/utils';

const EmailField = () => (
  <div className="wpwl-group wpwl-group-email wpwl-clearfix">
    <div className="wpwl-wrapper wpwl-wrapper-email">
      <input
        name="customer.email"
        className="wpwl-control wpwl-control-email"
        placeholder="Email"
        type="text"
      />
    </div>
  </div>
);

class PaymentForm extends Component {
  static defaultProps = {
    brands: 'VISA MASTER',
    redirectUrl: location.href,
    showLabels: false,
    showPlaceholders: true,
    showCardHolder: false,
    showEmail: true
  };

  constructor(props) {
    super(props);
    this.state = {
      is3DFrame: false
    };
    window.wpwlOptions = {
      showLabels: props.showLabels,
      requireCvv: props.requireCvv,
      showCVVHint: props.showCVVHint,
      showPlaceholders: props.showPlaceholders,
      style: 'plain',
      locale: props.locale,
      onLoadThreeDIframe: this.onLoadThreeDIframe,
      onReady: this.onReady,
      onError: this.onError
    };
  }

  onLoadThreeDIframe = () => {
    this.setState({is3DFrame: true});
  };

  onError = () => {
    this.setState({hasError: true});
  };

  onReady = () => {
    this.adjustForm();
  };

  appendEmail($form) {
    const $email = $(render(<EmailField />));
    const $emailInput = $email.find('input');
    $emailInput.on('blur', e => this.validateEmail($emailInput, $email));
    $form.prepend($email);
  }

  validateEmail($input, $email) {
    const value = $input.val();
    const isValid = isValidEmail(value);
    const $hint = $email.find('.wpwl-hint-emailError');
    $input.toggleClass('wpwl-has-error', !isValid);
    if (isValid && $hint.length) {
      $hint.remove();
    } else if (!isValid && !$hint.length) {
      $input.after('<div class="wpwl-hint wpwl-hint-emailError">Invalid email</div>');
    }
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
      url: `https://test.monei-api.net/v1/paymentWidgets.js?checkoutId=${this.props.checkoutId}`
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
