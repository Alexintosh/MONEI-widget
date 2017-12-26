import {Component} from 'preact';
import Portal from 'preact-portal';
import PaymentForm from '../PaymentForm';
import classNames from './PaymentModal.scss';

class PaymentModal extends Component {
  render(props, state, context) {
    if (!props.isOpen) return null;
    return (
      <Portal into="body">
        <div className={classNames.portal}>
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
                <PaymentForm {...props} className={classNames.paymentForm} />
              </div>
              <div className={classNames.cancelButton} onClick={() => props.onClose()}>
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
