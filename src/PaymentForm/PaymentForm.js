import {Component} from 'preact';
import loadJS from 'load-js';
import $ from 'cash-dom';
import classNames from './PaymentForm.scss';

class PaymentForm extends Component {
  static defaultProps = {
    brands: 'VISA MASTER',
    redirectUrl: location.href
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      is3DFrame: false
    };
    window.wpwlOptions = {
      showLabels: false,
      requireCvv: true,
      showCVVHint: true,
      autofocus: true,
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
    this.setState({isLoading: false, hasError: true});
  };

  onReady = () => {
    this.adjustForm();

    // TODO PayOn has a bug causing ugly jQuery animation, we skip it here.
    setTimeout(() => this.setState({isLoading: false}), 800);
  };

  adjustForm() {
    // move brand icon to the card number field and hide by default
    const $form = this.$formContainer.find('.wpwl-form');
    const $brand = $form.find('.wpwl-brand-card').addClass('wpwl-brand-GENERIC');
    $brand.appendTo($form.find('.wpwl-wrapper-cardNumber'));

    // place cardHolder on top of the form
    $form.find('.wpwl-group-cardNumber').before($form.find('.wpwl-group-cardHolder'));
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

  render({brands, redirectUrl}, {isLoading, isFrame, hasError, error}, context) {
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
