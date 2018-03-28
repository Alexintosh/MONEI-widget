import {Component} from 'preact';
import Portal from 'preact-portal';
import PaymentForm from '../PaymentForm';
import classNames from './PaymentModal.scss';
import $ from 'cash-dom';
import cx from 'classnames';

class PaymentModal extends Component {
  handleClose = () => {
    $('body').removeClass(classNames.fixedBody);
    document.ontouchmove = () => true;
    setTimeout(() => {
      this.props.onClose();
      this.setState({is3DFrame: false});
    }, 400);
    this.setState({isActive: false, isVisible: false});
  };

  onError = error => {
    this.props.onError && this.props.onError(error);
    this.setState({isActive: true, isError: true});
  };

  onReady = () => {
    this.props.onReady && this.props.onReady();
    setTimeout(() => {
      $('body').addClass(classNames.fixedBody);
      document.ontouchmove = e => e.preventDefault();
      this.setState({isActive: true});
    }, 500);
    setTimeout(() => {
      this.setState({isVisible: true});
    }, 900);
  };

  onLoadThreeDIframe = () => {
    this.props.onLoadThreeDIframe && this.props.onLoadThreeDIframe();
    this.setState({is3DFrame: true});
  };

  onPaymentComplete = data => {
    this.props.onPaymentComplete && this.props.onPaymentComplete(data);
    this.handleClose();
  };

  render(props, {isActive, isVisible, is3DFrame, isError}, context) {
    if (!props.isOpen) return null;
    return (
      <Portal into="body">
        <div
          className={cx(classNames.portal, {
            [classNames.active]: isActive,
            [classNames.visible]: isVisible,
            [classNames.fullscreen]: is3DFrame && props.threeDIframeFullscreen
          })}>
          <div className={classNames.container}>
            <div
              className={cx(classNames.modal, {
                [classNames.frame]: is3DFrame,
                [classNames.frame]: is3DFrame,
                [classNames.error]: isError
              })}>
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
                  onReady={this.onReady}
                  onLoadThreeDIframe={this.onLoadThreeDIframe}
                  onPaymentComplete={this.onPaymentComplete}
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
