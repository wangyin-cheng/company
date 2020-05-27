<template>
  <div :class="classes">
    <span :class="getCellCls(cell)"
          v-for="(cell, index) in cells"
          :key="index"
          @click="handleClick(cell)"
          @mouseenter="handleMouseMove(cell)"
          @mousedown="handleMouseDown(cell)"
          @mouseup="handleMouseUp(cell)">
      <em>{{ cell.text }}</em>
    </span>
  </div>
</template>
<script>
import { clearHours, isInRange } from '../util'
import { deepCopy } from '../../../util/tools'
import Locale from '../../../mixins/locale'
import mixin from './mixin'
import prefixCls from './prefixCls'

export default {
  mixins: [Locale, mixin],
  props: {
    /* in mixin */
  },
  computed: {
    classes() {
      let clz = [`${prefixCls}`, `${prefixCls}-month`]
      if (
        this.$parent.$options.name === 'RangeDatePickerPanel' &&
        this.$parent.pickerType === 'monthrange'
      ) {
        clz.push(`${prefixCls}-month-selection`)
      }
      return clz
    },
    cells() {
      let cells = []
      const cell_tmpl = {
        text: '',
        selected: false,
        disabled: false
      }

      const tableYear = this.tableDate.getFullYear()
      const selectedDays = this.dates
        .filter(Boolean)
        .map(date =>
          clearHours(new Date(date.getFullYear(), date.getMonth(), 1))
        )

      for (let i = 0; i < 12; i++) {
        const cell = deepCopy(cell_tmpl)
        cell.date = new Date(tableYear, i, 1)
        cell.text = this.tCell(i + 1)
        const time = clearHours(cell.date)
        cell.disabled =
          typeof this.disabledDate === 'function' &&
          this.disabledDate(cell.date) &&
          this.selectionMode === 'month'
        cell.selected = selectedDays.includes(time)
        if (
          this.$parent.$options.name === 'RangeDatePickerPanel' &&
          this.$parent.pickerType === 'monthrange'
        ) {
          let fromDate = this.rangeState.from
          let toDate = this.rangeState.to
          let rangeStart
          if (fromDate) {
            rangeStart = new Date(
              fromDate.getFullYear(),
              fromDate.getMonth(),
              1,
              0,
              0,
              0
            ).getTime()
          }
          let rangeEnd
          if (toDate) {
            rangeEnd = new Date(
              toDate.getFullYear(),
              toDate.getMonth(),
              1,
              0,
              0,
              0
            ).getTime()
          }
          cell.range = isInRange(time, rangeStart, rangeEnd)
        }
        cells.push(cell)
      }

      return cells
    }
  },
  methods: {
    getCellCls(cell) {
      return [
        `${prefixCls}-cell`,
        {
          [`${prefixCls}-cell-selected`]: cell.selected,
          [`${prefixCls}-cell-disabled`]: cell.disabled,
          [`${prefixCls}-cell-range`]: cell.range
        }
      ]
    },
    tCell(nr) {
      return this.t(`i.datepicker.months.m${nr}`)
    }
  }
}
</script>
