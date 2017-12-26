import {Component} from 'preact';
import Portal from 'preact-portal';
import PaymentForm from '../PaymentForm';
import classNames from './PaymentModal.scss';
import cx from 'classnames';

class PaymentModal extends Component {
  setActive = (isActive = true) => this.setState({isActive});
  handleClose = () => {
    this.setActive(false);
    setTimeout(this.props.onClose.bind(this), 200);
  };

  render(props, state, context) {
    if (!props.isOpen) return null;
    return (
      <Portal into="body">
        <div className={cx(classNames.portal, {[classNames.active]: state.isActive})}>
          <div className={classNames.container}>
            <div className={classNames.modal}>
              {props.name ||
                (props.description && (
                  <div className={classNames.header}>
                    <div className={classNames.name}>{props.name}</div>
                    <div className={classNames.description}>{props.description}</div>
                  </div>
                ))}
              <div className={classNames.body}>
                <PaymentForm
                  {...props}
                  className={classNames.paymentForm}
                  onLoad={this.setActive}
                />
              </div>
              <div className={classNames.cancelButton} onClick={this.handleClose}>
                &times;
              </div>
            </div>
          </div>
        </div>
      </Portal>
    );
  }
}

export default PaymentModal;
