import Picker from '../picker.vue';
import TimePickerPanel from '../panel/Time/time.vue';
import RangeTimePickerPanel from '../panel/Time/time-range.vue';
import Options from '../time-mixins';

import { oneOf } from '../../../util/tools';

export default {
    mixins: [Picker, Options],
    components: { TimePickerPanel, RangeTimePickerPanel },
    props: {
      type: {
        validator (value) {
          return oneOf(value, ['time', 'timerange']);
        },
        default: 'time'
      },
      splitPanels: {
        type: Boolean,
        default: false
      },
    },
    computed: {
      panel(){
        const isRange =  this.type === 'timerange';
        return isRange ? 'RangeTimePickerPanel' : 'TimePickerPanel';
      },
      ownPickerProps(){
        return {
          disabledHours: this.disabledHours,
          disabledMinutes: this.disabledMinutes,
          disabledSeconds: this.disabledSeconds,
          hideDisabledOptions: this.hideDisabledOptions
        };
      },
      localePlaceholder () {
        if (this.placeholder === undefined) {
          return this.t('i.datepicker.selectTime');
        } else {
          return this.placeholder;
        }
      },
    },
};