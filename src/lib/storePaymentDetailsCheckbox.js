import {render} from 'preact';
import $ from 'cash-dom';

export function storePaymentDetailsCheckbox({ labels, primaryColor }) {

  onchange = ({target}) => {
    if(primaryColor) {
      const fill = target.checked ? primaryColor : 'none';
      $('.label-cbx .checkbox svg path').css({fill: fill});
    }
  };

  return render(
    <div class="store-payment-details">
      <label htmlFor="createRegistration" class="label-cbx">
        <input name="createRegistration" id="createRegistration" type="checkbox" class="invisible" onChange={onchange} value="true" />
        <div class="checkbox">
          <svg width="20px" height="20px" viewBox="0 0 20 20">
            <path d="M3,1 L17,1 L17,1 C18.1045695,1 19,1.8954305 19,3 L19,17 L19,17 C19,18.1045695 18.1045695,19 17,19 L3,19 L3,19 C1.8954305,19 1,18.1045695 1,17 L1,3 L1,3 C1,1.8954305 1.8954305,1 3,1 Z"></path>
            <polyline points="4 11 8 15 16 6"></polyline>
          </svg>
        </div>
        <span>{labels.savePaymentDetails}</span>
      </label>
    </div>
  );
}