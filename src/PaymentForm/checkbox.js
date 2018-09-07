import {render} from 'preact';
import $ from 'cash-dom';

export default function({labels, primaryColor}) {
  onchange = ({target}) => {
    if (primaryColor) {
      const fill = target.checked ? primaryColor : 'none';
      $(target)
        .parent()
        .find('path')
        .css({fill: fill});
    }
  };

  return render(
    <div class="wpwl-group wpwl-checkbox">
      <label htmlFor="createRegistration" class="wpwl-checkbox-label">
        <input
          name="createRegistration"
          id="createRegistration"
          type="checkbox"
          onChange={onchange}
          value="true"
        />
        <div class="wpwl-checkbox-box">
          <svg width="20px" height="20px" viewBox="0 0 20 20">
            <path d="M3,1 L17,1 L17,1 C18.1045695,1 19,1.8954305 19,3 L19,17 L19,17 C19,18.1045695 18.1045695,19 17,19 L3,19 L3,19 C1.8954305,19 1,18.1045695 1,17 L1,3 L1,3 C1,1.8954305 1.8954305,1 3,1 Z" />
            <polyline points="4 11 8 15 16 6" />
          </svg>
        </div>
        <span>{labels.savePaymentDetails}</span>
      </label>
    </div>
  );
}
