
import { clearHours } from '../util';
import { isBoolean } from 'util';

export default {
  props: {
    tableDate: {
      type: Date,
      required: true
    },
    disabledDate: {
      type: Function
    },
    selectionMode: {
      type: String,
      required: true
    },
    value: {
      type: Array,
      required: true
    },
    rangeState: {
      type: Object,
      default: () => ({
        from: null,
        to: null,
        selecting: false
      })
    },
    spliceDirec: String,
    maxDate: [Date, String],
    pickMode: String,
    pickMouseDown: Boolean,
    pickMouseMove: Boolean
  },
  computed: {
    dates() {
      const { selectionMode, value, rangeState } = this;
      const rangeSelecting = selectionMode === 'range' && rangeState.selecting;
      return rangeSelecting ? [rangeState.from] : value;
    },
  },
  methods: {
    handleClick(cell) {
      if (this.pickMode !== 'click') return
      if (cell.disabled || cell.type === 'weekLabel') return;
      const newDate = new Date(clearHours(cell.date));
      this.$emit('on-pick', newDate, this.spliceDirec);
      this.$emit('on-pick-click');
    },
    handleMouseMove(cell) {
      this.$emit('pickMouseMoveChange', false)
      if (this.pickMouseDown) {
        this.$emit('pickMouseMoveChange', true)
      }

      if (!this.rangeState.selecting) return;
      if (cell.disabled) return;
      const newDate = cell.date;
      this.$emit('on-change-range', newDate);
    },
    handleMouseDown(cell) {
      if (this.pickMode !== 'move') return
      this.$emit('pickMouseDownChange', true)

      // 避免 handleMouseMove 函数中对 pickMouseDown 的值误判，这里要设置足够长的延时
      setTimeout(() => {
        if (cell.disabled || cell.type === 'weekLabel') return;
        const newDate = new Date(clearHours(cell.date));
        this.$emit('on-pick', newDate, this.spliceDirec);
        this.$emit('on-pick-click');
      }, 120)
    },
    handleMouseUp(cell) {
      if (this.pickMode !== 'move') return
      this.$emit('pickMouseDownChange', false)
      if (!this.pickMouseMove) return
      if (cell.disabled || cell.type === 'weekLabel') return;
      const newDate = new Date(clearHours(cell.date));
      this.$emit('on-pick', newDate, this.spliceDirec);
      this.$emit('on-pick-click');
    }
  },
};
