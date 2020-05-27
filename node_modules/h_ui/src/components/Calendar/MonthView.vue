<template>
  <div :class="[`${prefixCls}-month-view ${prefixCls}-month-wrapper clearfix`]"
       ref="month">
    <div v-for="(monthInfo, index) in curMonthList"
         :key="index"
         :class="[`${prefixCls}-month`]"
         :style="monthStyle">
      <div>
        <label :class="[`${prefixCls}-month-title`]"
               :style="labelStyle">{{t(`i.calendar.month.${'m' + (monthInfo.month + 1)}`)}}</label>
        <div :class="[`${prefixCls}-month-content ${prefixCls}-month-week`]">
          <div :class="[`${prefixCls}-month-content-item`]"
               :style="weekdayStyle"
               v-for="val in weekday"
               :key="val">{{t(`i.calendar.week.${'w' + val}`)}}</div>
        </div>
        <div :class="[`${prefixCls}-month-content ${prefixCls}-month-day`]">
          <date-cell v-for="(item, index) in monthInfo.list"
                     :key="index"
                     :style="cellStyle"
                     :prefixCls="prefixCls"
                     :data="item"
                     :dateRender="dateRender"
                     :badges="badges"></date-cell>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import locale from '../../mixins/locale'
import DateCell from './DateCell'

export default {
  name: 'MonthView',
  mixins: [locale],
  components: { DateCell },
  props: {
    prefixCls: String,
    monthViewNum: Number,
    currentDate: Date,
    disabledDate: [Function, Array],
    presetDates: Array,
    dateRender: Function,
    badges: Array
  },
  data() {
    return {
      weekday: [1, 2, 3, 4, 5, 6, 7]
    }
  },
  computed: {
    root() {
      return this.$parent
    },
    curMonthList() {
      const monthList = this.getMonthList()
      this.dataList = this.extractDate(monthList)
      return monthList
    },
    currentYear() {
      return this.currentDate.getFullYear()
    },
    dataList: {
      get() {
        return this.root.dateList
      },
      set(val) {
        this.root.dateList = val
      }
    },
    monthStyle() {
      const monthViewNum = this.monthViewNum
      return {
        width:
          monthViewNum === 4 || monthViewNum === 2
            ? '47%'
            : monthViewNum === 1
            ? '97%'
            : '22%'
      }
    },
    cellStyle() {
      const monthViewNum = this.monthViewNum
      return {
        height:
          monthViewNum === 4 || monthViewNum === 2
            ? '50px'
            : monthViewNum === 1
            ? '100px'
            : '36px'
      }
    },
    weekdayStyle() {
      const monthViewNum = this.monthViewNum
      return {
        height:
          monthViewNum === 4 || monthViewNum === 2
            ? '40px'
            : monthViewNum === 1
            ? '45px'
            : '36px'
      }
    },
    labelStyle() {
      const monthViewNum = this.monthViewNum
      let height =
        monthViewNum === 4 || monthViewNum === 2
          ? '40px'
          : monthViewNum === 1
          ? '55px'
          : '36px'
      return {
        height: height,
        lineHeight: height
      }
    }
  },
  methods: {
    getMonthList() {
      const monthViewNum = this.monthViewNum
      const currentDate = this.currentDate
      const currentYear = this.currentYear
      let firstMonth = 0
      let lastMonth = 11
      if (monthViewNum < 12) {
        firstMonth = currentDate.getMonth()
        firstMonth = firstMonth - Math.max(firstMonth + monthViewNum - 12, 0)
        lastMonth = firstMonth + monthViewNum - 1
      }
      const monthList = []
      for (let i = firstMonth; i <= lastMonth; i++) {
        monthList.push({
          month: i,
          list: this.getDateList(currentYear, i)
        })
      }
      return monthList
    },
    /**
     * 获取一个月中的日期列表。列表长度固定为42（无日期的为null）
     * @param year 年份数值
     * @param month 月份数值（0-based）
     */
    getDateList(year, month) {
      const dateList = new Array(42)
      let i = 0
      while (i < 42) {
        dateList[i++] = null
      }

      const now = new Date()
      const lastDate = new Date(year, month + 1, 0).getDate()
      // 该月第一天
      const sd = new Date(year, month, 1)
      // 该月最后一天
      const ed = new Date(year, month, lastDate)
      const presetDates = this.presetDates.filter(d => {
        return d.date >= sd && d.date <= ed
      })
      const dayOfWeek = sd.getDay()
      const disabledDate = this.disabledDate
      const shouldDisabled =
        typeof disabledDate === 'function' || Array.isArray(disabledDate)
      for (let i = 1; i <= lastDate; i++) {
        let date = new Date(year, month, i)
        // 处理日期是否禁用
        let disabled = false
        if (Array.isArray(disabledDate) && disabledDate.length > 0) {
          for (let i = 0; i < disabledDate.length; i++) {
            let disableStr = new Date(disabledDate[i]).toDateString()
            if (disableStr == date.toDateString()) {
              disabled = true
            }
          }
        } else if (typeof disabledDate === 'function') {
          disabled = disabledDate(date)
        }
        dateList[i + dayOfWeek - 1] = {
          date: date,
          /* 禁用日期 */
          disabled: shouldDisabled && disabled,
          /* 0休息日，1工作日 */
          workFlag: date.getDay() == 6 || date.getDay() == 0 ? 0 : 1,
          isToday: now.toDateString() === date.toDateString()
        }

        // 使用用户预设数据覆盖日期相关属性
        let presetDate = null
        presetDates.some(d => {
          if (d.date.toDateString() === date.toDateString()) {
            presetDate = d
            return true
          }
        })
        presetDate != null &&
          this.setDatePropByPresets(presetDate, dateList[i + dayOfWeek - 1])
      }
      return dateList
    },
    extractDate(monthList) {
      const dateList = []
      monthList.forEach(month => {
        dateList.push(...month.list.filter(d => d !== null))
      })
      return dateList
    },
    /**
     * 使用用户预设属性覆盖初始化日期对象
     */
    setDatePropByPresets(presetDate, date) {
      const workFlag = presetDate.workFlag
      if ([0, 1].indexOf(workFlag) > -1) {
        date.workFlag = workFlag
      }
    }
  }
}
</script>

<style>
</style>
