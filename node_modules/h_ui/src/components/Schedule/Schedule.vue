<template>
  <div :class="[`${prefixCls}`]">
    <calendar ref="calendar"
              :current-year="curYear"
              :current-month="curMonth"
              :monthViewNum="1"
              :multiSelect="false"
              :enableCtxMenu="false"
              @on-click="handleCellClick"
              @on-dblclick="handleCellDblClick"
              @on-select="handleCellSelect"
              @on-panel-change="handlePanelChange">
      <slot slot="header"
            name="header">
        <div :class="[`${prefixCls}-header`]">
          <h-button-group>
            <h-button type="primary"
                      icon="arrow-l"
                      title="上一年"
                      @click="prevYear"></h-button>
            <h-button type="primary"
                      icon="return"
                      title="上一个月"
                      @click="prevMonth"></h-button>
            <h-button type="primary"
                      icon="enter"
                      title="下一个月"
                      @click="nextMonth"></h-button>
            <h-button type="primary"
                      icon="arrow-r"
                      title="下一年"
                      @click="nextYear"></h-button>
          </h-button-group>
          <h-button type="primary"
                    :disabled="disableTodayBtn"
                    :class="[`${prefixCls}-today-btn`]"
                    @click="jumpToday"
                    :title="dateStr(new Date())">{{t('i.calendar.today')}}</h-button>
          <h1 :class="[`${prefixCls}-date-text`]">{{curYear}}年 {{curMonth}}月</h1>
        </div>
      </slot>
    </calendar>
    <div :class="[`${prefixCls}-events`]">
      <div :class="[`${prefixCls}-event-wrapper`]"
           v-for="(item, index) in dateEvents"
           :key="index">
        <div :class="eventCls(item, event)"
             v-for="(event, j) in (item != null ? item.events : [])"
             v-show="event.order <= showEvtNum"
             :key="j"
             @click="handleEvtClick(event)"
             @dblclick="handleEvtDblClick(event)">{{isEventPlaceBegin(item, event) ? event.title : ''}}</div>
        <div v-if="item !== null && item.events.length > showEvtNum"
             :class="[`${prefixCls}-event-more`]">
            <h-icon name="unfold"
                    @on-click="showMore(item, index)"></h-icon>
        </div>
      </div>
      <div :class="[`${prefixCls}-popover`]"
           :style="{left: viewCoord.x, top: viewCoord.y}"
           v-show="isShowMore"
           v-clickoutside="{trigger: 'mousedown', handler: closePopup}">
        <div :class="[`${prefixCls}-popover-header`]">
          <span>{{viewDate}}</span>
          <h-icon size="12"
                  name="close"
                  @on-click="closePopup"></h-icon>
        </div>
        <div :class="[`${prefixCls}-popover-body`]">
          <div :class="[`${prefixCls}-popover-body-item`]"
               :style="{display: evt.hidden ? 'none' : 'block'}"
               v-for="(evt, i) in moreEvents"
               :key="i"
               @click="handleEvtClick(evt)"
               @dblclick="handleEvtDblClick(evt)">
            {{evt.title}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Calendar from '../Calendar'
import locale from '../../mixins/locale'
import clickoutside from '../../directives/clickoutside.js'

const prefixCls = 'h-schedule'

export default {
  name: 'Schedule',
  components: { Calendar },
  mixins: [locale],
  directives: { clickoutside },
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      curYear: new Date().getFullYear(),
      curMonth: new Date().getMonth() + 1,
      prefixCls: prefixCls,
      /* 最多展示三个活动 */
      showEvtNum: 3,
      /* 展示更多活动的窗口 */
      isShowMore: false,
      /* 查看更多活动的日期 */
      viewDate: '',
      viewCoord: {
        x: 0,
        y: 0
      },
      /* 展示全部活动的日期的序号 */
      showMoreDateIndex: 0
    }
  },
  computed: {
    disableTodayBtn() {
      const today = new Date()
      return (
        this.curYear === today.getFullYear() &&
        this.curMonth - 1 === today.getMonth()
      )
    },
    dateEvents() {
      return this.makeDateEvents()
    },
    moreEvents() {
      const dateEvents = this.dateEvents
      return dateEvents[this.showMoreDateIndex]
        ? dateEvents[this.showMoreDateIndex].events
        : []
    }
  },
  methods: {
    /******************** 提供对外调用：开始 ********************/
    /**
     * 跳转到今日所在年月
     */
    jumpToday() {
      this.curYear = new Date().getFullYear()
      this.curMonth = new Date().getMonth() + 1
    },
    prevMonth() {
      if (this.curMonth === 1) {
        this.curYear--
        this.curMonth = 12
      } else {
        this.curMonth--
      }
    },
    nextMonth() {
      if (this.curMonth === 12) {
        this.curYear++
        this.curMonth = 1
      } else {
        this.curMonth++
      }
    },
    prevYear() {
      this.curYear--
    },
    nextYear() {
      this.curYear++
    },
    /******************** 提供对外调用：结束 ********************/
    dateStr(date) {
      return date
        ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
        : ''
    },
    makeDateEvents() {
      const events = this.events
      if (events.length === 0) {
        this.dateEvents = []
      } else {
        const curYear = this.curYear
        const curMonth = this.curMonth
        // 第一天
        const minDate = new Date(curYear, curMonth - 1, 1)
        // 最后一天
        const maxDate = new Date(curYear, curMonth, 0)

        // 清除events上面的order属性
        events.forEach(evt => delete evt.order)

        // 筛选出包含或部分包含在当前日期范围的活动
        let eventsInRange = events.filter(e => {
          let sd = new Date(e.startDate)
          sd = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate())
          let ed = e.endDate ? new Date(e.endDate) : sd
          ed = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate())
          return (
            (sd >= minDate && ed <= maxDate) ||
            (sd < minDate && ed >= minDate) ||
            (sd <= maxDate && ed > maxDate)
          )
        })

        // 生成固定长度为42的每日活动数组
        const dateEvents = new Array(42)
        let i = 0
        while (i < 42) {
          dateEvents[i++] = null
        }

        const firstDayIndex = minDate.getDay()
        const lastDayIndex = maxDate.getDate() + firstDayIndex - 1
        for (let i = firstDayIndex; i <= lastDayIndex; i++) {
          let d = dateEvents[i]
          let dt = new Date(curYear, curMonth - 1, i - firstDayIndex + 1)
          if (d === null) d = dateEvents[i] = { events: [], date: dt }
          let events = d.events
          eventsInRange.forEach(e => {
            let sd = new Date(e.startDate)
            sd = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate())
            let ed = e.endDate ? new Date(e.endDate) : sd
            ed = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate())
            if (dt >= sd && dt <= ed) {
              events.push(e)
            }
          })

          events.sort((a, b) => {
            if (!a.order) return 1
            if (!b.order) return -1
            return a.order - b.order
          })

          for (let j = 0; j < events.length; j++) {
            events[j].order = events[j].order || j + 1
            events[j].hidden = false
            if (events[j].order == j + 1 || j > 2) continue
            events.splice(j, 0, {
              order: j + 1,
              hidden: true
            })
          }
        }
        return dateEvents
      }
    },
    isStart(item, event) {
      let st = new Date(event.startDate)
      return st.toDateString() === item.date.toDateString()
    },
    isEnd(item, event) {
      let ed = event.endDate
        ? new Date(event.endDate)
        : new Date(event.startDate)
      return ed.toDateString() === item.date.toDateString()
    },
    isEventPlaceBegin(item, event) {
      return (
        this.isStart(item, event) ||
        item.date.getDay() === 0 ||
        item.date.getDate() === 1
      )
    },
    eventCls(item, event) {
      return {
        [`${prefixCls}-event-content`]: true,
        [`${prefixCls}-event-placeholder`]: event.hidden,
        [`event-place-start`]: this.isStart(item, event),
        [`event-place-end`]: this.isEnd(item, event)
      }
    },
    showMore(dateObj, index) {
      this.showMoreDateIndex = index
      this.viewDate = this.dateStr(dateObj.date)
      this.viewCoord.x = (index % 7) * 14.28 + '%'
      this.viewCoord.y = Math.floor(index / 7) * 100 + 'px'
      this.isShowMore = true
    },
    closePopup() {
      this.isShowMore = false
      this.viewDate = ''
    },
    handleEvtClick(evt) {
      this.$emit('on-event-click', evt)
    },
    handleEvtDblClick(evt) {
      this.$emit('on-event-dblclick', evt)
    },
    handleCellClick(month, date) {
      this.$emit('on-click', month, date)
    },
    handleCellDblClick(month, date) {
      this.$emit('on-dblclick', month, date)
    },
    handleCellSelect(month, date) {
      this.$emit('on-select', month, date)
    },
    handlePanelChange(newDate, oldDate) {
      this.$emit('on-panel-change', newDate, oldDate);
    },
    calcPopoverLength(events) {
      return  events.filter(e => !e.hidden).length
    }
  }
}
</script>

<style>
</style>
