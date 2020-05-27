import Picker from '../picker.vue';
import SpliceRange from '../panel/Date/splice-panel.vue';
// import RangeDatePickerPanel from '../panel/Date/date-range.vue';
import { oneOf } from '../../../util/tools';

export default {
  mixins: [Picker],
  props: {
    type: {
      validator(value) {
        return oneOf(value, ['daterange', 'datetimerange']);
      },
      default: 'daterange'
    },
    value: {},
    splitPanels: {
      type: Boolean,
      default: true
    },
    name:{
      type:String,
      default:'splicePanel'
    }
  },
  components: { SpliceRange },
  computed: {
    panel(){
        return 'SpliceRange' ;
    },
    ownPickerProps(){
        return this.options;
    },
    localePlaceholder () {
      if (this.placeholder === undefined) {
          return this.t('i.datepicker.selectDate');
      } else {
          return this.placeholder;
      }
    },
  }
};