import {Component} from 'preact';
import PaymentModal from '../PaymentModal';
import classNames from './PaymentButton.scss';
import {formatAmount} from 'lib/utils';

class PaymentButton extends Component {
  static defaultProps = {
    labels: {
      checkout: 'Pay {amount}'
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };
    if (props.noEnhance) {
      props.container.onclick = this.handleOpen;
    }
  }

  handleOpen = e => {
    e.preventDefault();
    this.setState({isModalOpen: true});
  };

  handleClose = () => this.setState({isModalOpen: false});

  getButtonText() {
    const {amount, currency, labels} = this.props;
    if (!amount) return 'Pay now';
    const price = formatAmount(amount, currency);
    return labels.checkout.replace('{amount}', price);
  }

  render(props, {isModalOpen}, context) {
    if (props.noEnhance) {
      return <PaymentModal {...props} isOpen={isModalOpen} onClose={this.handleClose} />;
    }
    return (
      <span
        className={classNames.button}
        onClick={this.handleOpen}
        style={{backgroundColor: props.primaryColor}}>
        {this.getButtonText()}
        <PaymentModal {...props} isOpen={isModalOpen} onClose={this.handleClose} />
      </span>
    );
  }
}

export default PaymentButton;
