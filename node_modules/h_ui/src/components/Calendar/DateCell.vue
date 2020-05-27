<script>
import Emitter from '../../mixins/emitter'
import { dateFormat } from '../../util/tools'

export default {
  name: 'DateCell',
  mixins: [Emitter],
  props: {
    prefixCls: String,
    data: Object,
    dateRender: Function,
    badges: Array
  },
  computed: {
    root() {
      let parent = this.$parent
      while (parent && parent.$options.name !== 'Calendar') {
        parent = parent.$parent
      }
      return parent
    },
    isEmptyCell() {
      return this.data === null
    },
    cellClass() {
      const prefixCls = this.prefixCls
      const isEmptyCell = this.isEmptyCell
      const data = this.data
      return {
        [`${prefixCls}-month-content-item`]: true,
        [`${prefixCls}-month-restDay`]: !isEmptyCell && data.workFlag == 0,
        [`${prefixCls}-month-item-empty`]: isEmptyCell,
        [`${prefixCls}-month-item-disable`]: !isEmptyCell && data.disabled,
        [`${prefixCls}-month-day-active`]: this.selected,
        [`${prefixCls}-today`]: !isEmptyCell && data.isToday
      }
    },
    selected() {
      if (this.isEmptyCell) return false
      const selectedDate = this.root.selectedDate
      const date = this.data.date
      return selectedDate.some(
        d => d.date.toDateString() === date.toDateString()
      )
    },
    // yyyy-MM-dd 格式化后的日期
    badge() {
      let date = this.isEmptyCell ? '' : this.data.date
      let formatDate = dateFormat(date, 'yyyy-MM-dd')
      let tmp = this.badges.filter(item => item.date === formatDate)

      return tmp.length ? tmp[0] : null
    }
  },
  methods: {
    dblClick() {
      if (this.isEmptyCell || this.data.disabled) return
      this.dispatch('Calendar', 'on-cell-dblclick', this.data)
    },
    mouseOver() {
      if (this.isEmptyCell || this.data.disabled) return
      this.dispatch('Calendar', 'on-cell-mouseover', this.data)
    },
    mouseOut() {
      if (this.isEmptyCell || this.data.disabled) return
      this.dispatch('Calendar', 'on-cell-mouseout', this.data)
    },
    click(evt) {
      if (this.isEmptyCell || this.data.disabled) return
      // 鼠标左键被按下
      if (evt.button === 0) {
        this.leftClick()
      }
    },
    leftClick() {
      this.dispatch('Calendar', 'on-cell-left-click', this.data)
    },
    handleCtxMenu(evt) {
      evt.preventDefault()
      if (this.isEmptyCell || this.data.disabled) return
      this.dispatch('Calendar', 'on-context-menu', evt, this.data)
    },
    badgeClick(e) {
      e.stopPropagation()
      this.dispatch('Calendar', 'on-cell-badge-click', this.badge)
    }
  },
  render(h) {
    const dateRender = this.dateRender
    let dateContent
    if (typeof dateRender === 'function') {
      dateContent = dateRender(h, this.data)
    } else {
      if (this.badge) {
        dateContent = h('span', {}, [
          h('h-badge', {
            props: {
              count: this.badge.num,
              overflowCount: 99
            },
            nativeOn: {
              click: this.badgeClick
            }
          }, ''),
          h(
            'span',
            {
              class: {
                [`${this.prefixCls}-month-content-item-text`]: true
              }
            },
            [this.isEmptyCell ? '' : this.data.date.getDate()]
          )
        ])
      } else {
        dateContent = h(
          'span',
          {
            class: {
              [`${this.prefixCls}-month-content-item-text`]: true
            }
          },
          [this.isEmptyCell ? '' : this.data.date.getDate()]
        )
      }
    }
    return h(
      'div',
      {
        class: this.cellClass,
        on: {
          mouseover: this.mouseOver,
          mouseout: this.mouseOut,
          dblclick: this.dblClick,
          contextmenu: this.handleCtxMenu,
          click: this.click
        }
      },
      [dateContent]
    )
  }
}
</script>

<style>
</style>
