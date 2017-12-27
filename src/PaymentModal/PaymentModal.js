import {Component} from 'preact';
import Portal from 'preact-portal';
import PaymentForm from '../PaymentForm';
import classNames from './PaymentModal.scss';
import cx from 'classnames';

class PaymentModal extends Component {
  handleClose = () => {
    this.setState({isActive: false, isReady: false});
    setTimeout(this.props.onClose.bind(this), 200);
  };

  onError = error => {
    this.props.onError && this.props.onError(error);
    this.setState({isActive: true});
  };

  onReadyIframeCommunication = () => {
    this.props.onReadyIframeCommunication && this.props.onReadyIframeCommunication();
    this.setState({isActive: true});
  };

  onLoadThreeDIframe = () => {
    this.props.onLoadThreeDIframe && this.props.onLoadThreeDIframe();
    this.setState({is3DFrame: true});
  };

  onMount = () => {
    this.props.onMount && this.props.onMount();
    this.setState({isReady: true});
  };

  render(props, state, context) {
    if (!props.isOpen) return null;
    return (
      <Portal into="body">
        <div
          className={cx(classNames.portal, {
            [classNames.active]: state.isActive,
            [classNames.ready]: state.isReady
          })}>
          <div className={classNames.container}>
            <div className={cx(classNames.modal, {[classNames.frame]: state.is3DFrame})}>
              {(props.name || props.description) && (
                <div className={classNames.header}>
                  {props.name && <div className={classNames.name}>{props.name}</div>}
                  {props.description && (
                    <div className={classNames.description}>{props.description}</div>
                  )}
                </div>
              )}
              <div className={classNames.body}>
                <PaymentForm
                  {...props}
                  className={classNames.paymentForm}
                  onMount={this.onMount}
                  onReadyIframeCommunication={this.onReadyIframeCommunication}
                  onLoadThreeDIframe={this.onLoadThreeDIframe}
                  onError={this.onError}
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
