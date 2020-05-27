<template>
  <div :class="[`${prefixCls}-wrapper`]"
       ref="calendarWrap">
    <slot name="header">
      <div :class="[`${prefixCls}-top-change`]">
        <div :class="[`${prefixCls}-top-icon h-prev-year`]"
             @click="monthViewNum === 12 ? handleToPrevYear() : jumpToPrevMonth()">
          <h-icon name="chevron-left"></h-icon>
        </div>
        <h1 :class="[`${prefixCls}-top-text ${prefixCls}-year`]">{{curYear}}年</h1>
        <h1 v-if="monthViewNum < 12 && monthViewNum > 1"
            :class="[`${prefixCls}-top-text`]">&nbsp;{{(curMonth + 1) + '月'}} - {{(curMonth + monthViewNum) + '月'}}</h1>
        <h1 v-if="monthViewNum === 1"
            :class="[`${prefixCls}-top-text`]">&nbsp;{{(curMonth + 1) + '月'}}</h1>
        <div :class="[`${prefixCls}-top-icon h-next-year`]"
             @click="monthViewNum === 12 ? handleToNextYear() : jumpToNextMonth()">
          <h-icon name="chevron-right"></h-icon>
        </div>
      </div>
    </slot>
    <month-view :prefixCls="prefixCls"
                :monthViewNum="monthViewNum"
                :currentDate="currentDate"
                :presetDates="dateData"
                :disabledDate="disableDate"
                :dateRender="dateCellRender"
                :badges="badges"></month-view>
    <transition name="slide-up">
      <div :class="[`${prefixCls}-context-menu`]"
           v-clickoutside="hideCtxMenu"
           :style="styles">
        <slot name="menu">
          <ul :class="[`${prefixCls}-handle`]">
            <li :class="[`${prefixCls}-handle-item ${prefixCls}-handle-setWorkDay`]"
                @click.stop.prevent="handleSetWorkDay(1)">
              <span>设为工作日</span>
            </li>
            <li :class="[`${prefixCls}-handle-item ${prefixCls}-handle-setRestDay`]"
                @click.stop.prevent="handleSetWorkDay(0)">
              <span>设为休息日</span>
            </li>
          </ul>
        </slot>
      </div>
    </transition>
  </div>
</template>
<script>
import clickoutside from '../../directives/clickoutside.js'
import locale from '../../mixins/locale'
import MonthView from './MonthView'
import dateUtil from '../../util/date'

const prefixCls = 'h-calendar'

export default {
  name: 'Calendar',
  mixins: [locale],
  components: { MonthView },
  data() {
    return {
      currentDate: new Date(),
      prefixCls: prefixCls,
      styles: {},
      selectedDate: [],
      /* 当前视图所有日期 */
      dateList: [],
      handledDate: [] //已处理数据
    }
  },
  props: {
    currentYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    /* 1-based */
    currentMonth: {
      type: Number,
      default: new Date().getMonth() + 1
    },
    dateData: {
      // 传入日期信息 {date, workFlag}
      type: Array,
      default: () => []
    },
    disableDate: {
      type: [Function, Array]
    },
    multiSelect: {
      type: Boolean,
      default: true
    },
    monthViewNum: {
      type: Number,
      default: 12,
      validator(val) {
        return [1, 2, 4, 12].indexOf(val) > -1
      }
    },
    dateCellRender: Function,
    enableCtxMenu: {
      type: Boolean,
      default: true
    },
    /**
     * 微标 Array<Object>
     * 最少有以下两个属性
     * {
     *   date: String,
     *   num: Number
     * }
     */
    badges: {
      type: Array,
      default: () => []
    }
  },
  directives: {
    clickoutside
  },
  computed: {
    curYear() {
      return this.currentDate.getFullYear()
    },
    /* 0-based */
    curMonth() {
      return this.currentDate.getMonth()
    }
  },
  watch: {
    currentYear: {
      immediate: true,
      handler(val) {
        const currentDate = this.currentDate
        this.currentDate = new Date(
          val,
          currentDate.getMonth(),
          currentDate.getDate()
        )
      }
    },
    currentMonth: {
      immediate: true,
      handler(val) {
        const currentDate = this.currentDate
        let lastDate = new Date(currentDate.getFullYear(), val, 0).getDate()
        this.currentDate = new Date(
          currentDate.getFullYear(),
          val - 1,
          Math.min(currentDate.getDate(), lastDate)
        )
      }
    },
    currentDate(newDate, oldDate) {
      let newYear = newDate.getFullYear();
      let newMonth = newDate.getMonth();
      let oldYear = oldDate.getFullYear();
      let oldMonth = oldDate.getMonth();

      if (newYear !== oldYear || newMonth !== oldMonth) {
        this.$emit("on-panel-change", new Date(newYear, newMonth, 1), new Date(oldYear, oldMonth, 1));
      }
    }
  },
  methods: {
    // 对外暴露方法一键取消已选中日期
    cancelAllSelected() {
      this.selectedDate = []
    },
    handleCellLeftClick(dateObj) {
      const date = dateObj.date
      this.$emit('on-click', date.getMonth() + 1, date.getDate())

      const selectedDate = this.selectedDate
      for (let i = selectedDate.length - 1; i >= 0; i--) {
        // 判断是否是同一天
        if (selectedDate[i].date.toDateString() === date.toDateString()) {
          // 取消选择
          selectedDate.splice(i, 1)
          return
        }
      }
      if (!this.multiSelect) {
        this.selectedDate = [dateObj]
      } else {
        selectedDate.push(dateObj)
      }
      this.$emit('on-select', date.getMonth() + 1, date.getDate())
      console.log(selectedDate)
    },
    handleCtxMenu(event) {
      if (this.enableCtxMenu) {
        //#141481 【TS:201905220071-经纪业委会（经纪）-田传洪-【需求类型】Calendar 组件用在tab组件中，如果Calendar 组件在第2个及后面的tab页上时，右键菜单无法显示，经排查是右键菜单样式定位错误导致
        let target = event.currentTarget
        let top = target.offsetTop + target.scrollTop + 20
        let left = target.offsetLeft + target.scrollLeft + 20
        this.styles = {
          display: 'block',
          top: `${top}px`,
          left: `${left}px`
        }
      }
    },
    handleCellMouseOver(dateObj) {
      const date = dateObj.date
      this.$emit('on-mouseover', date.getMonth() + 1, date.getDate())
    },
    handleCellMouseOut(dateObj) {
      const date = dateObj.date
      this.$emit('on-mouseout', date.getMonth() + 1, date.getDate())
    },
    handleCellDblClick(dateObj) {
      const date = dateObj.date
      this.$emit('on-dblclick', date.getMonth() + 1, date.getDate())
    },
    /**
     * @description 点击 [date cell].badge 事件处理函数
     */
    handleBadgeClick(badge) {
      this.$emit('on-badge-click', badge)
    },
    /**
     * 隐藏右键菜单（开放外部调用）
     */
    hideCtxMenu() {
      this.styles = {}
    },
    // 设为工作日 workFlag 1 || 休息日 workFlag 0
    handleSetWorkDay(workflag) {
      const selectedDate = this.selectedDate
      const dateList = this.dateList
      // 设置是否工作日
      selectedDate.forEach(date => {
        date.workFlag = workflag
        dateList.some(d => {
          if (d.date.toDateString() === date.date.toDateString()) {
            d.workFlag = workflag
            return true
          }
        })
      })
      // 隐藏右键菜单
      this.hideCtxMenu()
      // 保存当前已经处理数据,方便像服务端保存
      this.handledDate.push(this.selectedDate)
      this.selectedDate = []
      this.$emit('on-date-change', this.handledDate)
    },
    jumpToPrevMonth() {
      const currentDate = this.currentDate
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const date = currentDate.getDate()
      if (currentMonth === 0) {
        let prevMonthLastDate = new Date(
          currentYear - 1,
          12 - this.monthViewNum + 1,
          0
        ).getDate()
        this.currentDate = new Date(
          currentYear - 1,
          12 - this.monthViewNum,
          Math.min(prevMonthLastDate, date)
        )
      } else {
        let prevMonthLastDate = new Date(
          currentYear,
          currentMonth,
          date,
          0
        ).getDate()
        this.currentDate = new Date(
          currentYear,
          currentMonth - 1,
          Math.min(prevMonthLastDate, date)
        )
      }
      this.$emit('on-preBtn-click', this.currentDate.getMonth()+1);
    },
    jumpToNextMonth() {
      const currentDate = this.currentDate
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const date = currentDate.getDate()
      if (currentMonth >= 12 - this.monthViewNum) {
        this.currentDate = new Date(currentYear + 1, 0, date)
      } else {
        let nextMonthLastDate = new Date(
          currentYear,
          currentMonth + 2,
          0
        ).getDate()
        this.currentDate = new Date(currentYear, currentMonth + 1, date)
      }
      this.$emit('on-nextBtn-click', this.currentDate.getMonth()+1);
    },
    handleToPrevYear() {
      const currentDate = this.currentDate
      const currentYear = currentDate.getFullYear()
      if (currentYear > 1000) {
        this.currentDate = new Date(
          currentYear - 1,
          currentDate.getMonth(),
          currentDate.getDate()
        )
      }
      this.$emit('on-preBtn-click', this.currentDate.getFullYear());
    },
    handleToNextYear() {
      const currentDate = this.currentDate
      const currentYear = currentDate.getFullYear()
      if (currentYear < 10000) {
        this.currentDate = new Date(
          currentYear + 1,
          currentDate.getMonth(),
          currentDate.getDate()
        )
      }
      this.$emit('on-nextBtn-click', this.currentDate.getFullYear());
    },
    getSelectDate() {
      let select = this.selectedDate
      for (let i = 0; i < select.length; i++) {
        if (!select[i].formatDate) {
          select[i].formatDate = dateUtil.format(select[i].date, 'yyyy-MM-dd')
        }
      }
      return select
    }
  },
  created() {
    this.$on('on-cell-left-click', this.handleCellLeftClick)
    this.$on('on-context-menu', this.handleCtxMenu)
    this.$on('on-cell-mouseover', this.handleCellMouseOver)
    this.$on('on-cell-mouseout', this.handleCellMouseOut)
    this.$on('on-cell-dblclick', this.handleCellDblClick)
    this.$on('on-cell-badge-click', this.handleBadgeClick)
  }
}
</script>
