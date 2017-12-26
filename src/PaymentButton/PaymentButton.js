import {Component} from 'preact';
import PaymentModal from '../PaymentModal';
import classNames from './PaymentButton.scss';

class PaymentButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false
    };
  }

  handleOpen = () => this.setState({isModalOpen: true});
  handleClose = () => this.setState({isModalOpen: false});

  render(props, {isModalOpen}, context) {
    return (
      <span className={classNames.button} onClick={this.handleOpen}>
        Pay now
        <PaymentModal {...props} isOpen={isModalOpen} onClose={this.handleClose} />
      </span>
    );
  }
}

export default PaymentButton;
