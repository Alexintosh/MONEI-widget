import {Component} from 'preact';
import PaymentModal from '../PaymentModal';
import classNames from './PaymentButton.scss';
import {formatAmount} from 'lib/utils';

class PaymentButton extends Component {
  static defaultProps = {
    checkoutButtonText: 'Pay {amount}',
    primaryColor: '#00796b'
  };

  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };
  }

  handleOpen = () => this.setState({isModalOpen: true});
  handleClose = () => this.setState({isModalOpen: false});

  getButtonText() {
    const {amount, currency, checkoutButtonText} = this.props;
    if (!amount) return 'Pay now';
    const price = formatAmount(amount, currency);
    return checkoutButtonText.replace('{amount}', price);
  }

  render(props, {isModalOpen}, context) {
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
