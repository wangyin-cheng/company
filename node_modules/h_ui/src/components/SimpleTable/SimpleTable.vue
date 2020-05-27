<template>
  <div :class="wrapClasses"
       :style="styles"
       ref="tableWrap"
       tabindex="1">
    <div :class="classes">
      <div :class="[prefixCls + '-header']"
           v-if="showHeader"
           ref="header"
           @mousewheel="handleMouseWheel">
        <table cellspacing="0"
               cellpadding="0"
               border="0"
               :style="headStyles"
               ref="thead">
          <colgroup>
            <col v-for="(column, index) in cloneColumns"
                 :width="setCellWidth(column, index, true)"
                 :key="index">
          </colgroup>
          <thead>
            <tr v-if="multiLevel"
                v-for="(colItem,inx) in multiData"
                :key="inx">
              <th v-for="(multi, index) in colItem"
                  :colspan="multi.cols||1"
                  :rowspan="multi.rows||1"
                  :key="index"
                  :class="aliCls(multi)">
                <div :class="[prefixCls+'-cell']">
                  <span>{{multi.title}}</span>
                </div>
              </th>
            </tr>
            <tr class="cur-th">
              <th v-for="(column, index) in cloneColumns"
                  :key="index"
                  v-on:mousedown="mousedown($event,column,index)"
                  v-on:mouseout="mouseout($event,column,index)"
                  v-on:mousemove="mousemove($event,column,index)"
                  v-on:mouseup="mouseup($event,column,index)"
                  :class="alignCls(column)"   :style="{position: newSort ? 'relative' : 'static'}">
                <table-cell :column="column"
                            :index="column._index"
                            :checked="isSelectAll"
                            :prefixCls="prefixCls"
                            :isFilter = "isFilter"
                            :titleEllipsis="titleEllipsis">
                </table-cell>
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div ref="body"
           :class="[prefixCls + '-body'] "
           class="h-simple-view"
           :style="bodyStyle"
           @scroll="handleBodyScroll"
           v-show="!((!!localeNoDataText && (!data || data.length === 0)) || (!!localeNoFilteredDataText && (!rebuildData || rebuildData.length === 0)))">
        <div :class="[prefixCls + '-phantom']"
             :style="{height: contentHeight + 'px'}">
        </div>
        <div class="h-simple-content"
             ref="content">
          <table cellspacing="0"
                 cellpadding="0"
                 border="0"
                 :style="tableStyle"
                 ref="tbody">
            <colgroup>
              <col v-for="(column, index) in cloneColumns"
                   :width="setCellWidth(column, index, false)"
                   :key="index">
            </colgroup>
            <tbody :class="[prefixCls + '-tbody']">
              <template v-for="(row, index) in visibleData">
                <table-tr :row="row"
                          :key="row._rowKey"
                          :hoverIndex="hoverIndex"
                          :prefix-cls="prefixCls"
                          @mouseenter.native.stop="handleMouseIn(row._index)"
                          @mouseleave.native.stop="handleMouseOut(row._index)"
                          @click.right.native.prevent.stop="handleRightClick($event,row._index,index)"
                          @click.left.native="clickCurrentRowTr($event,row._index,index)"
                          @dblclick.native.stop="dblclickCurrentRowTr(row._index,index)">
                  <td v-for="column in cloneColumns"
                      :class="alignCls(column, row)"
                      :data-index="row._index+1"
                      :key="column._index">
                    <div :class="classesTd(column)" :title="column.showTitle?row[column.key]:null">
                      <!-- &&!this.splitIndex -->
                      <template v-if="column.type === 'index'&&!splitIndex">{{row._index + 1}}</template>
                      <template v-if="column.type === 'selection'">
                        <Checkbox :size="calcCheckboxSize(column.checkboxSize)"
                                  :value="rowChecked(row._index)"
                                  @click.native.stop="handleClickTr($event,row._index,rowChecked(row._index),index)"
                                  @on-change="toggleSelect(row._index,index+start)"
                                  :disabled="rowDisabled(row._index)"></Checkbox>
                      </template>
                      <template v-if="!column.type&&!column.render"><span v-text="row[column.key]"></span></template>
                      <template v-if="column.render">
                        <Cell :row="row"
                              :key="column._columnKey"
                              :column="column"
                              :index="row._index">
                        </Cell>
                      </template>
                    </div>
                  </td>
                </table-tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
      <div :class="[prefixCls + '-tip'] "
           v-if="((!!localeNoDataText && (!data || data.length === 0)) || (!!localeNoFilteredDataText && (!rebuildData || rebuildData.length === 0)))"
           @scroll="handleBodyScroll"
           :style="bodyStyle">
        <div :class="[prefixCls+'-tiptext']"
             :style="textStyle">
          <span v-text="localeNoDataText"
                v-if="!data || data.length === 0"></span>
          <span v-text="localeNoFilteredDataText"
                v-else></span>
        </div>
        <table cellspacing="0"
               cellpadding="0"
               border="0"
               :style="tableStyle">
          <tbody>
            <tr>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="isLeftFixed||isRightFixed"
           :class="fixedCls"
           :style="fixedTableStyle"
           ref="leftF">
        <div :class="fixedHeaderClasses">
          <table cellspacing="0"
                 cellpadding="0"
                 border="0"
                 :style="fixedHeadStyles"
                 ref="leftF">
            <colgroup>
              <col v-for="(column, index) in leftFixedColumns"
                   :width="setCellWidth(column, index, true)"
                   :key="index">
            </colgroup>
            <thead>
              <tr>
                <th v-for="(column, index) in leftFixedColumns"
                    :key="index"
                    v-on:mousedown="mousedown($event,column,index,'left')"
                    v-on:mouseout="mouseout($event,column,index,'left')"
                    v-on:mousemove="mousemove($event,column,index,'left')"
                    :class="alignCls(column,{},'left')"
                    :style="{height: column.fixedTheadHeight + 'px'}" >
                  <table-cell :column="column"
                              :index="column._index"
                              :fixed="column.fixed || true"
                              :checked="isSelectAll"
                              :prefixCls="prefixCls"
                              :isFilter = "isFilter"
                              :titleEllipsis="titleEllipsis">
                  </table-cell>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div :class="fixedBodyClass"
             class="h-simple-view"
             :style="fixedBodyStyle"
             ref="fixedBody"
             @mousewheel="handleFixedMousewheel"
             @DOMMouseScroll="handleFixedMousewheel">
          <div :class="[prefixCls + '-phantom']"
               :style="{height: contentHeight + 'px'}">
          </div>
          <div class="h-simple-content"
               ref="leftContent">
            <table cellspacing="0"
                   cellpadding="0"
                   border="0"
                   :style="tableStyle">
              <colgroup>
                <col v-for="(column, index) in leftFixedColumns"
                     :width="setCellWidth(column, index, false)"
                     :key="index">
              </colgroup>
              <tbody :class="[prefixCls + '-tbody']">
                <template v-for="(row, index) in visibleData">
                  <table-tr :row="row"
                            :key="row._rowKey"
                            :hoverIndex="hoverIndex"
                            :prefix-cls="prefixCls"
                            @mouseenter.native.stop="handleMouseIn(row._index)"
                            @mouseleave.native.stop="handleMouseOut(row._index)"
                            @click.right.native.prevent.stop="handleRightClick($event,row._index,index)"
                            @click.left.native="clickCurrentRowTr($event,row._index,index)"
                            @dblclick.native.stop="dblclickCurrentRowTr(row._index,index)">
                    <td v-for="column in leftFixedColumns"
                        :class="alignCls(column, row,'left')"
                        :data-index="row._index+1"
                        :key="column._index">
                      <div :class="classesTd(column)" :title="column.showTitle?row[column.key]:null">
                        <template v-if="column.type === 'index'&&!splitIndex">{{row._index+1}}</template>
                        <template v-if="column.type === 'selection'">
                          <Checkbox :size="calcCheckboxSize(column.checkboxSize)"
                                    :value="rowChecked(row._index)"
                                    @click.native.stop="handleClickTr($event,row._index,rowChecked(row._index),index)"
                                    @on-change="toggleSelect(row._index,index+start)"
                                    :disabled="rowDisabled(row._index)"></Checkbox>
                        </template>
                        <template v-if="!column.type&&!column.render"><span v-text="row[column.key]"></span></template>
                        <template v-if="column.render">
                          <Cell :row="row"
                                :key="column._columnKey"
                                :column="column"
                                :index="row._index"></Cell>
                        </template>
                      </div>
                      <!-- <Cell
                        fixed="left"
                        :prefix-cls="prefixCls"
                        :row="row"
                        :key="column._columnKey"
                        :column="column"
                        :index="row._index"
                        :checked="rowChecked(row._index)"
                        :disabled="rowDisabled(row._index)"
                      ></Cell> -->
                    </td>
                  </table-tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div :class="[prefixCls + '-summation']"
           :style="summationStyle"
           v-if="isSummation"
           ref="summation">
        <table cellspacing="0"
               cellpadding="0"
               border="0"
               :style="tableStyle">
          <colgroup>
            <col v-for="(column, index) in cloneColumns"
                 :width="setCellWidth(column, index, false)"
                 :key="index">
          </colgroup>
          <tbody :class="[prefixCls + '-tbody']">
            <template v-for="row in summationData">
              <table-tr :row="row"
                        :key="row._rowKey"
                        :prefix-cls="prefixCls">
                <td v-for="column in cloneColumns"
                     :class="alignCls(column, row,'',true)"
                    :key="column._index">
                  <div :class="classesTd(column)">
                    <span v-if="(column.type==='index'||column.type==='selection')&&column._index==0">汇总</span>
                    <Cell v-else-if="column.render&&summationRender"
                          :row="row"
                          :key="column._columnKey"
                          :column="column"
                          :sum="summationRender"
                          :index="row._index"></Cell>
                    <span v-else
                          v-text="row[column.key]"></span>
                  </div>
                </td>
              </table-tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="h-table__column-resize-proxy"
           ref="resizeProxy"
           v-show="resizeProxyVisible"> </div>
      <div class="h-table__column-move-proxy h-table-cell"
           ref="moveProxy"
           v-show="moveProxyVisible"> </div>
           <div :class="[prefixCls + '-fixed-right-patch']" :style="fixedRightPatchStyle" v-if="isRightFixed&&showScroll" ref="rightPatch"></div>
    </div>
    <Spin fix
          size="large"
          v-if="loading">
      <slot name="loading">
        <h-icon name="load-c"
                size=18
                class='h-load-loop'>
        </h-icon>
        <div v-text="loadingText"></div>
      </slot>
    </Spin>
  </div>
</template>
<script>
import renderHeader from './header'
import Spin from '../Spin/Spin.vue'
import { oneOf, getStyle, deepCopy, getScrollBarSize, findInx, getBarBottomS, addClass, removeClass, typeOf, getScrollBarSizeHeight, debounceWithImmediate} from '../../util/tools'
import { on, off } from '../../util/dom'
import Locale from '../../mixins/locale'
import Mixin from './mixin'
import Csv from '../../util/csv'
import ExportCsv from '../Table/export-csv.js'
import TableTr from './Table-tr.vue'
import TableCell from './Table-cell.vue'
import Cell from './Cell.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
const prefixCls = 'h-table'
let rowKey = 1
let columnKey = 1

export default {
  name: 'Table',
  mixins: [Locale, Mixin],
  components: { Cell, Checkbox, renderHeader, TableTr, TableCell },
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    },
    columns: {
      type: Array,
      default() {
        return []
      }
    },
    size: {
      validator(value) {
        return oneOf(value, ['small', 'large', 'default'])
      }
    },
    width: {
      type: [Number, String]
    },
    height: {
      type: [Number, String],
      default: 400
    },
    stripe: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    highlightRow: {
      type: Boolean,
      default: false
    },
    rowClassName: {
      type: Function,
      default() {
        return ''
      }
    },
    context: {
      type: Object
    },
    noDataText: {
      type: String
    },
    noFilteredDataText: {
      type: String
    },
    disabledHover: {
      type: Boolean
    },
    canDrag: {
      type: Boolean,
      default: true
    },
    canMove: {
      type: Boolean,
      default: false
    },
    rowSelect: {
      type: Boolean, //多选时是否支持点击行选中
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    headAlgin: {
      validator(value) {
        return oneOf(value, ['left', 'center', 'right'])
      },
      default: null
    },
    bodyAlgin: {
      validator(value) {
        return oneOf(value, ['left', 'center', 'right'])
      },
      default: null
    },
    selectOption: {
      type: Boolean,
      default: false
    },
    itemHeight: {
      type: Number,
      default: 40
    },
    notSort: {
      type: Boolean,
      default: false
    },
    multiLevel: {
      type: Array,
      default: null
    },
    notAdaptive: {
      type: Boolean,
      default: false
    },
    defaultFocusIndex: Number,
    scrollTopSet: {
      type: Number,
      default: 0
    },
    toScrollTop: {
      type: Boolean,
      default: false
    },
    splitIndex: {
      type: Boolean,
      default: false
    },
    addData: Array, // 追加数据
    lastColWidth: {
      type: [Number, String],
      default: 80
    },
    summationData: {
      type: Array,
      default() {
        return []
      }
    },
    switchEmpty: {  //上下键盘切换选项时清空选项
      type: Boolean,
      default: false
    },
    dataCheckedProp: {
      type: Boolean,
      default: false
    },
    scrollbarToZero: {  // 数据更新时滚动条置为 0
      type: Boolean,
      default: false
    },
    newSort: {
      type:Boolean,
      default:false
    },
    summationRender: {
      type:Boolean,
      default:true
    },
    rowSelectOnly: { //多选时是否支持点击行只选中，再次点击不进行反选
      type:Boolean,
      default:false
    },
    isMulitSort: {  //多列排序
      type:Boolean,
      default:false,
    },
    titleEllipsis: {
      type: Boolean,
      default:true
    },
    // 会在冻结列的表格中渲染所有的列（隐藏），影响性能，当每列设置宽度并...显示时，设置该属性可以提升性能，不能保证每列不换行时，不设置该属性
    noNeedOtherCol: {
      type: Boolean,
      default: false
    },
    // 是否进行过滤，无限滚动加载数据的场景不适用， 仅支持通过simpleTable显式分页的场景
    isFilter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ready: false,
      tableWidth: 0,
      dragWidth: 0,
      initWidth: 0,
      columnsWidth: {},
      prefixCls: prefixCls,
      compiledUids: [],
      objData: this.makeObjData(), // checkbox or highlight-row
      rebuildData: [], // for sort or filter
      cloneColumns: this.makeColumns(),
      showSlotHeader: true,
      showSlotFooter: true,
      bodyHeight: 0,
      bodyRealHeight: 0,
      scrollBarWidth: getScrollBarSize(),
      scrollBarHeight: getScrollBarSizeHeight(), //横向高度
      currentContext: this.context,
      cloneData: deepCopy(this.data), // when Cell has a button to delete row data, clickCurrentRow will throw an error, so clone a data
      resizeProxyVisible: false,
      moveProxyVisible: false,
      showScroll: false,
      headerRealHeight: 0,
      visibleCount: 50,
      start: 0,
      end: 50,
      visibleData: [],
      allclick: false,
      buttomNum: null,
      topNum: null,
      shiftSelect: [],
      ctrlSelect: [],
      dragging: false,
      draggingColumn: false,
      moving: false,
      movingColumn: null,
      isScrollX: false, //是否有横向滚动
      isScrollY: false,
      focusIndex: -1,
      curPageFirstIndex: 0,
      isFocusSelect: true,
      isCurrent: true,
      privateToScrollTop: false,
      selectType: false,
      cloumnsLeft: [],
      curShiftIndex: null,
      sumMarginLeft: 0,
      baseInx: null,
      offsetInx: null,
      hoverIndex:-1,
      scheduledAnimationFrame: false, // 是否进行动画帧更新visibledata,
      isHorizontal:false,
      lastScrollTop: 0,
      beginLocation: {},
      isCtrlDown: false,
      curShowFiltersIdx: null,// 当前展示filter的列，防止拖拽滚动条时不隐藏filter poptip
    }
  },
  computed: {
    fixedCls(){
      return {
        [prefixCls + '-fixed']:this.isLeftFixed,
        [prefixCls + '-fixed-right']:this.isRightFixed,
      }
    },
    summationStyle() {
      return {
        marginLeft: `${0 - this.sumMarginLeft}px`
      }
    },
    isSummation() {
      return this.summationData.length > 0
    },
    multiData() {
      if (!this.multiLevel || this.multiLevel.length == 0) return []
      let data = []
      data[0] = []
      this.multiLevel.forEach((cols, i) => {
        if (typeOf(cols) != 'array') {
          if (!cols.hiddenCol && cols.hiddenCol != 'false') {
            data[0].push(cols)
          }
        } else {
          let data2 = []
          cols.forEach((item, inx) => {
            if (!item.hiddenCol && item.hiddenCol != 'false') {
              data2.push(item)
            }
          })
          data.push(data2)
        }
      })
      return data.length > 0 ? data : []
    },
    isSelectAll() {
      let isSelectAll = true
      if (!this.visibleData.length || !this.objData[0]) return false
      for (let i = 0; i < this.visibleData.length; i++) {
        if (!this.objData[this.visibleData[i]._index]._isChecked &&
            !this.objData[this.visibleData[i]._index]._isDisabled) {
          isSelectAll = false
          break
        }
      }
      if (isSelectAll && !this.allclick) {
        this.allclick = false
        let count = 0
        //o45那边会在render里使用$set方法改变disabled让其不可选，这时全选状态应该不勾选
        for(let ind = 0; ind < this.rebuildData.length; ind ++) {
          if(this.objData[this.rebuildData[ind]._index]._isDisabled) {
            count ++
          }
        }
        if(count === this.rebuildData.length) {
          isSelectAll = false
        }else {
          for (let i = 0; i < this.rebuildData.length; i++) {
            if (!this.objData[this.rebuildData[i]._index]._isChecked &&
              !this.objData[this.rebuildData[i]._index]._isDisabled) {
              isSelectAll = false
              break
            }
          }
        }
      } else {
        // 再次判断是否有外部强行删除数据导致全选框仍勾选
        let count = 0
        for(let ind = 0; ind < this.rebuildData.length; ind ++) {
          if(this.objData[this.rebuildData[ind]._index]._isDisabled) {
            count ++
          }
        }
        if(count === this.rebuildData.length) {
          isSelectAll = false
        }
      }
      return isSelectAll
    },
    loadingText() {
      return this.t('i.table.loadingText')
    },
    localeNoDataText() {
      if (this.noDataText === undefined) {
        return this.t('i.table.noDataText')
      } else {
        return this.noDataText
      }
    },
    localeNoFilteredDataText() {
      if (this.noFilteredDataText === undefined && this.t) {
        return this.t('i.table.noFilteredDataText')
      } else {
        return this.noFilteredDataText
      }
    },
    wrapClasses() {
      return [
        `${prefixCls}-wrapper`,
        {
          [`${prefixCls}-hide`]: !this.ready,
          [`${prefixCls}-with-header`]: this.showSlotHeader,
          [`${prefixCls}-with-footer`]: this.showSlotFooter
        }
      ]
    },
    classes() {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-${this.size}`]: !!this.size,
          [`${prefixCls}-border`]: this.border,
          [`${prefixCls}-stripe`]: this.stripe,
          [`${prefixCls}-with-fixed-top`]: !!this.height
        }
      ]
    },
    fixedHeaderClasses() {
      return [
        `${prefixCls}-fixed-header`,
        {
          [`${prefixCls}-fixed-header-with-empty`]: !this.rebuildData.length
        }
      ]
    },
    fixedBodyClass() {
      return [
        `${prefixCls}-fixed-body`,
        {
          [`${prefixCls}-fixed-body-shadow`]: this.data.length != 0
        }
      ]
    },
    styles() {
      let style = {}
      // if (this.height) {
      //   let height = Number(this.height)+2
      //   style.height = `${height}px`;
      // }
      if (this.width) style.width = `${this.width}px`
      return style
    },
    tableStyle() {
      let style = {}
      if (this.tableWidth !== 0) {
        let width = ''
        if (this.bodyHeight === 0) {
          width = this.tableWidth
        } else {
          if (this.data.length == 0) {
            width = this.tableWidth
          } else {
            width = this.tableWidth - this.scrollBarWidth
          }
        }
        style.width = `${width}px`
      }
      return style
    },
    headStyles() {
      //深拷贝
      const style = Object.assign({}, this.tableStyle)
      const width = this.data.length == 0 ? parseInt(this.tableStyle.width)
        : parseInt(this.tableStyle.width) + this.scrollBarWidth
      style.width = `${width}px`
      return style
    },
    fixedHeadStyles() {
      const style = this.headStyles
      if(this.noNeedOtherCol) {
        style.width = this.fixedTableStyle.width
      }
      return style
    },
    fixedTableStyle() {// 拖拽切换屏幕大小重新计算宽度时冻结列未触发重新计算
      if(this.isLeftFixed){
        let style = {}
        let width = 0
        this.leftFixedColumns.forEach(col => {
          if (col.fixed && col.fixed === 'left') width += col._width
        })
        style.width = `${width}px`
        return style
      }
      if(this.isRightFixed){
        let style = {}
        let width = 0
        this.leftFixedColumns.forEach(col => {
          if (col.fixed && col.fixed === 'right') width += col._width
        })
        if (!!this.height && this.height < this.data.length*this.itemHeight+this.headerRealHeight) {
          style.marginRight = `${this.scrollBarWidth}px`
          this.showScroll = true
        } else {
          width = width==0?0:width
        }
        style.width = `${width}px`
        return style
      }
    },
    fixedRightPatchStyle() {
      let style = {}
      let width = this.scrollBarWidth
      let height = this.headerRealHeight
      let top = parseInt(getStyle(this.$refs.title, 'height')) || 0
      style.width = `${width}px`
      style.height = `${height}px`
      style.top = `${top}px`
      return style
    },
    bodyStyle() {
      let style = {}
      if (this.bodyHeight !== 0) {
        style.height = `${this.bodyHeight}px`
      }
      return style
    },
    fixedBodyStyle() {
      let style = {}
      if (this.bodyHeight !== 0) {
        let height = this.bodyHeight - 1
        // if (this.tableWidth > this.initWidth) {
        //   height = this.bodyHeight - this.scrollBarHeight
        // }
        if (this.isHorizontal) {
          height = this.bodyHeight - this.scrollBarHeight
        }
        style.height = `${height}px`
      }
      return style
    },
    textStyle() {
      let style = {}
      // style.width = this.initWidth != 0 ? this.initWidth + 'px' : '100%'
      style.width ='100%'
      const height = this.bodyHeight
      style.height = this.height
        ? Number(height - this.scrollBarHeight) + 'px'
        : null
      style.lineHeight = this.height
        ? Number(height - this.scrollBarHeight) + 'px'
        : null
      return style
    },
    leftFixedColumns() {
      if(this.isLeftFixed){
        let left = []
        let other = []
        this.cloneColumns.forEach(col => {
          if (col.fixed && col.fixed === 'left') {
            left.push(col)
          } else {
            // 会在冻结列的表格中渲染所有的列（隐藏），影响性能，当每列设置宽度并...显示时，设置该属性可以提升性能
            if (!this.noNeedOtherCol) {
              other.push(col)
            }
          }
        })
        return left.concat(other)
      }
      if(this.isRightFixed){
        let right = []
        let other = []
        this.cloneColumns.forEach((col) => {
          if (col.fixed && col.fixed === 'right') {
            right.push(col)
          } else {
            // 会在冻结列的表格中渲染所有的列（隐藏），影响性能，当每列设置宽度并...显示时，设置该属性可以提升性能，不能保证每列不换行时，不设置该属性
            if (!this.noNeedOtherCol) {
              other.push(col)
            }
          }
        })
        return right.concat(other)
      }
    },
    isLeftFixed() {
      return this.columns.some(col => col.fixed && col.fixed === 'left')
    },
    isRightFixed() {
      return this.columns.some(col => col.fixed && col.fixed === 'right')&&!this.isLeftFixed
    },
    contentHeight() {
      return this.rebuildData.length * this.itemHeight
    }
  },
  methods: {
    /**
      * @func
      * @desc 行右键点击
      * @param {object} event - 点击事件
      * @param {string} rowIndex -objdata中索引
      * @param {number} curIndex - 行索引
      */
    handleRightClick(event, _index, curIndex) {
      // this.$emit('on-right-click')
      if (this.objData[_index]._isDisabled) return
      if (this.cloneData[_index]) {
        this.$emit('on-right-click', JSON.parse(JSON.stringify(this.cloneData[_index])), _index)
      } else {
        this.$emit('on-right-click', null, null)
      }

    },
    calcCheckboxSize(size) {
      return size || 'large'
    },
    makeSumData() {
      // 汇总数据只有一条，否则只获取第一条
      let data =
        this.summationData && this.summationData.length > 0
          ? [deepCopy(this.summationData[0])]
          : []
      data.forEach((row, index) => {
        row._index = index
        row._rowKey = rowKey++
      })
      return data
    },
    toggleIsCurrent(val) {
      this.isCurrent = val
    },
    cellClasses(column) {
      return [`${this.prefixCls}-cell`]
    },
    aliCls(item) {
      return [
        {
          [`${item.className}`]: item.className,
          [`${this.prefixCls}-column-${item.align}`]: item.align
        }
      ]
    },
    rowClsName(index) {
      return this.rowClassName(this.data[index], index)
    },
    classesTd(column) {
      return [
        `${this.prefixCls}-cell`,
        {
          [`${this.prefixCls}-cell-ellipsis`]:
            column.ellipsis && column.ellipsis != 'false'
        }
      ]
    },
    rowChecked(_index) {
      if (!this.objData[_index]) {
        return false
      } else {
        return this.objData[_index]._isChecked
      }
    },
    rowDisabled(_index) {
      if (!this.objData[_index]) {
        return false
      } else {
        return this.objData[_index]._isDisabled
      }
    },
    changeWidth(width, dragWidth, index, key, lastWidth) {
      let that = this
      let lastInx = this.cloneColumns.length - 1
      let totalWidth = 0
      this.cloneColumns.forEach((col, i) => {
        if (col.key == key) {
          that.$set(col, 'width', width)
          that.$set(col, '_width', width)
        }
        // 缩短当前列增宽最后一列
        if(index != lastInx ) {
          if (i == lastInx && !that.notAdaptive) {
            let sum
            // 当最后一列宽度不够缩小时
            if(lastWidth >= that.lastColWidth) {
              if(dragWidth < 0) {
                sum = col._width + Math.abs(dragWidth)
              }else {
                sum = col._width - Math.abs(dragWidth)
              }
              that.$set(col, 'width', sum)
              that.$set(col, '_width', sum)
            }
          }
        }
        var colWidth = col._width
        totalWidth = totalWidth + colWidth
      })
      if (this.rebuildData.length != 0 && !that.notAdaptive) {
        totalWidth = totalWidth + this.scrollBarWidth
      }
      this.tableWidth = totalWidth
      if (this.tableWidth < this.initWidth && !that.notAdaptive) {
        this.tableWidth = this.initWidth - 1
      }
      this.$nextTick(() => {
        this.$emit('on-drag', width, key)
        if(this.$refs.content){
          this.isHorizontal = this.$refs.content.scrollWidth > this.$refs.content.clientWidth?true:false
        }
        // 触发改变整体宽度
        this.tableWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b)
      })
    },
    getLeftWidth() {
      this.$nextTick(() => {
        const columns = this.cloneColumns
        for (let i = 0; i < columns.length; i++) {
          let leftWidth = 0
          for (let j = 0; j < i; j++) {
            leftWidth = leftWidth + columns[j]._width
          }
          this.cloumnsLeft[i] = leftWidth
        }
      })
    },
    mousedown(event, column, index, isLeft) {
      this.beginLocation.clientX = event.clientX
      this.beginLocation.clientY = event.clientY
      if (this.$isServer||(isLeft&&this.isRightFixed)) return
      if (!column) return
      if (!this.canDrag && !this.canMove) return
      let _this = this
      if (this.draggingColumn) {
        this.dragging = true
        this.resizeProxyVisible = true
        const table = this
        const tableEl = table.$el
        const tableLeft = tableEl.getBoundingClientRect().left
        const columnEl = this.$el.querySelector(`th.h-ui-${column.key}`)
        const columnRect = columnEl.getBoundingClientRect()
        const minLeft = columnRect.left - tableLeft + 30
        let lastWidth = this.findObj(event, 'TR').lastChild.offsetWidth
        let tableWidth = this.$el.offsetWidth
        let headWidth = this.tableWidth
        addClass(columnEl, 'noclick')
        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        }
        const resizeProxy = this.$refs.resizeProxy
        resizeProxy.style.left = this.dragState.startLeft + 'px'
        document.onselectstart = function() {
          return false
        }
        document.ondragstart = function() {
          return false
        }
        const handleMouseMove = event => {
          document.body.style.cursor = 'col-resize'
          const deltaLeft = event.clientX - this.dragState.startMouseLeft
          const proxyLeft = this.dragState.startLeft + deltaLeft
          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px'
        }
        const handleMouseUp = () => {
          if (_this.dragging) {
            const { startColumnLeft, startLeft } = _this.dragState
            const finalLeft = parseInt(resizeProxy.style.left, 10)
            let columnWidth = finalLeft - startColumnLeft
            //拖拽的宽度 >0为增大，<0为减小
            let dragWidth = finalLeft - startLeft
            if (dragWidth >= 0) {
              lastWidth = lastWidth - dragWidth >= this.lastColWidth
                ? lastWidth - dragWidth : this.lastColWidth
            } else {
              if (headWidth >= tableWidth) {
                //此时有滚动条
                if (headWidth + dragWidth <= tableWidth) {
                  lastWidth = lastWidth + tableWidth - headWidth - dragWidth - 1
                }
              } else {
                lastWidth = lastWidth - dragWidth
              }
            }
            if (table.bodyHeight !== 0&&!this.isRightFixed) {
              lastWidth = lastWidth - getScrollBarSize()
            }
            // 设置表头最小宽度 (o45： padding 8、 一个文字... 24、 排序 16+4)
            if(window.isO45) {
              columnWidth = columnWidth <= 60 ? 60 : columnWidth
            }else {
              columnWidth = columnWidth <= 74 ? 74 : columnWidth
            }
            _this.changeWidth(columnWidth, dragWidth, index, column.key, lastWidth)
            document.body.style.cursor = ''
            _this.dragging = false
            _this.draggingColumn = false
            _this.dragState = {}
            table.resizeProxyVisible = false
          }
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.onselectstart = null
          document.ondragstart = null
          setTimeout(function() {
            removeClass(columnEl, 'noclick')
          }, 0)
        }
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }

      if (this.movingColumn) {
        this.moving = true
        addClass(document.body, 'useSelect')
        this.moveProxyVisible = true
        let dom = this.findObj(event, 'TH').cloneNode(true)
        dom.width = column._width
        addClass(dom, 'move-proxy-th')
        const tableEl = this.$el
        const tableLeft = tableEl.getBoundingClientRect().left
        const tableTop = tableEl.getBoundingClientRect().top
        const columnEl = this.$el.querySelector(`th.h-ui-${column.key}`)
        const columnRect = columnEl.getBoundingClientRect()
        addClass(columnEl, 'noclick')
        this.moveState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.left - tableLeft - 1,
          tableLeft
        }
        const moveProxy = this.$refs.moveProxy
        const resizeProxy = this.$refs.resizeProxy
        moveProxy.style.left = this.moveState.startLeft + 'px'
        moveProxy.style.top = event.clientY - tableTop - 20 + 'px'
        moveProxy.appendChild(dom)
        let resizeIndex = Number(index)
        let resizeLeft
        const handleMouseMove = event => {
          document.body.style.cursor = 'pointer'
          this.resizeProxyVisible = true
          const deltaLeft = event.clientX - _this.moveState.startMouseLeft
          const moveLeft = _this.moveState.startLeft + deltaLeft
          if (deltaLeft > 0) {
            let changeRight = _this.cloumnsLeft[index] + deltaLeft
            changeRight = changeRight + column._width
            for (let i in _this.cloumnsLeft) {
              if (changeRight > _this.cloumnsLeft[i] + 30)
                resizeIndex = Number(i)
            }
            resizeLeft =
              _this.$el
                .querySelectorAll('th')
                [resizeIndex].getBoundingClientRect().right -
              tableLeft -
              1
          }
          if (deltaLeft < 0) {
            let changeLeft = _this.cloumnsLeft[index] + deltaLeft
            for (let i in _this.cloumnsLeft) {
              if (changeLeft > _this.cloumnsLeft[i] - 50)
                resizeIndex = Number(i)
            }
            resizeLeft =
              _this.$el
                .querySelectorAll('th')
                [resizeIndex].getBoundingClientRect().left -
              tableLeft -
              1
          }
          moveProxy.style.left = moveLeft + 'px'
          moveProxy.style.top = event.clientY - tableTop - 20 + 'px'
          resizeProxy.style.left = resizeLeft + 'px'
        }

        const handleMouseUp = () => {
          if (_this.moving) {
            _this.sortCloumn(index, resizeIndex, column._index)
            document.body.style.cursor = ''
            removeClass(document.body, 'useSelect')
            _this.moving = false
            _this.movingColumn = null
            _this.moveState = {}
            moveProxy.removeChild(dom)
            _this.resizeProxyVisible = false
            _this.moveProxyVisible = false
          }

          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)

          setTimeout(function() {
            removeClass(columnEl, 'noclick')
          }, 0)
        }
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
    },
    mousemove(event, column, index,isLeft) {
      if (!this.canDrag || !column||(isLeft&&this.isRightFixed)) return
      if (this.splitIndex && column.type == 'index') return
      if (column.children && column.children.length > 0) return
      let target = this.findObj(event, 'TH')
      if (this.canDrag) {
        // moveDrag需传入event win7下FF60版本不可拖拽
        this.moveDrag(event, target, column)
      }
      if (this.canMove) {
        this.moveMove(event, target, column)
      }
    },
    moveDrag(event, target, column, isLeft) {
      if (!this.dragging||(isLeft&&this.isRightFixed)) {
        let rect = target.getBoundingClientRect()
        const bodyStyle = document.body.style
        if (rect.width > 12 && rect.right - event.pageX < 8) {
          bodyStyle.cursor = 'col-resize'
          this.draggingColumn = true
        } else if (!this.dragging) {
          bodyStyle.cursor = ''
          this.draggingColumn = false
        }
      }
    },
    moveMove(event, target, column) {
      if (!this.moving && !this.dragging) {
        let rect = target.getBoundingClientRect()
        const bodyStyle = document.body.style
        if (
          rect.right - event.pageX > 8 &&
          rect.right - event.pageX < rect.width &&
          !column.fixed
        ) {
          bodyStyle.cursor = 'pointer'
          // bodyStyle.userSelect = 'none';
          this.movingColumn = column
        } else if (!this.moving) {
          if (!this.canDrag) bodyStyle.cursor = ''
          // bodyStyle.userSelect = 'text';
          this.movingColumn = null
        }
      }
    },
    mouseup(event, column, index) {
      //拖拽表头排序不触发
      // 仅045使用
      if (!window.isO45) return
      if(this.isDrag(this.beginLocation.clientX, this.beginLocation.clientY, event.clientX, event.clientY)) {
        return
      }
      if(column.sortable) {
        const type = column._sortType
        // 【TS:201907290145-资管业委会（资管）_孔磊-【需求类型】需求【需求描述】表格2、点击列头时就可以进行排序】 按ctrl+鼠标点击可重置排序
        if(window.isO45 && this.isCtrlDown) {
          this.handleSort(index, 'normal')
          return
        }
        if(column.type === 'selection') {
          if(type === 'normal') {
            this.handleSort(index, 'asc')
          }else {
            this.handleSort(index, 'normal')
          }
        }else {
          if (type === 'normal') {
            this.handleSort(index, 'asc')
          } else if (type === 'asc') {
            this.handleSort(index, 'desc')
          } else {
            this.handleSort(index, 'normal')
          }
        }
      }
    },
    isDrag(x1, y1, x2, y2) {
      if(Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) <= 1) {
        return false
      }
      return true
    },
    mouseout() {
      if (this.$isServer) return
      document.body.style.cursor = ''
    },
    sortCloumn(curIndex, insertIndex, _index) {
      if (this.cloneColumns[insertIndex].fixed) return
      const item = this.cloneColumns[curIndex]
      this.cloneColumns.splice(curIndex, 1)
      this.cloneColumns.splice(insertIndex, 0, item)
      this.$emit('on-move', _index, insertIndex)
    },
    findObj(e, name) {
      var obj = e.target
      while (obj && obj.tagName != name) {
        obj = obj.parentElement
      }
      return obj
    },
    handleResize() {
      this.$nextTick(() => {
        let transformTop = Math.floor(this.$refs.body.scrollTop / this.itemHeight) * this.itemHeight
        if(this.$refs.fixedBody){
          this.$refs.fixedBody.scrollTop =this.$refs.body.scrollTop
        }
        if (this.scrollbarToZero) {
          transformTop = 0
          this.$refs.body.scrollTop = 0
        }
        // 解决数据变动导致滚动条跳动问题
        this.$refs.content.style.transform = `translateY(${transformTop}px)`
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translateY(${transformTop}px))`
        }
        let width = this.$refs.body.getBoundingClientRect().width
        let conentWidth = this.$refs.body.scrollWidth
        let height = this.$refs.body.getBoundingClientRect().height
        let conentHeight = this.$refs.body.scrollHeight
        this.isScrollX = conentWidth + this.scrollBarWidth > width ? true : false
        this.isScrollY = conentHeight > height ? true : false
        if (this.cloneColumns.length == 0) return
        const allWidth = !this.columns.some(cell => !cell.width && cell.width !== 0) // each column set a width
        if (allWidth) {
          this.tableWidth = this.columns.map(cell => cell.width).reduce((a, b) => a + b)
        } else {
          this.tableWidth = parseInt(getStyle(this.$el, 'width')) - 1
        }
//        console.log('开始设置总宽:::'+this.tableWidth)
        this.columnsWidth = {}
        this.$nextTick(() => {
          let columnsWidth = {}
          let autoWidthIndex = -1
          let totalWidth = 0
          // if (allWidth) autoWidthIndex = this.cloneColumns.findIndex(cell => !cell.width);//todo 这行可能有问题
//          if (allWidth) // 这边写的不理解每列都设置了width为何还找需要自动设宽的项
            autoWidthIndex = findInx(this.cloneColumns, cell => !cell.width)
          if (this.data.length) {
            const $td = this.$refs.tbody.querySelectorAll('tbody tr')[0].querySelectorAll('td')
            let errorNum = 0
            for (let i = 0; i < $td.length; i++) {
              // can not use forEach in Firefox
              const column = this.cloneColumns[i]
              let curWidth = parseFloat(getStyle($td[i], 'width'))
              let width = parseInt(curWidth)
              errorNum = errorNum + curWidth - width
              if (errorNum > 1) {
                width = width + 1
                errorNum = errorNum - 1
              }
              if (i === autoWidthIndex) {
                width = width - 1
              }
              if (column.width) {
                width = column.width || ''
              } else {  // 自适应列设置最小宽度100（拖拽后除外）
                let min = column.minWidth?column.minWidth:100
                if (width < min) width = min
              }
              this.cloneColumns[i]._width = width || ''

//              this.tableWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b)
              totalWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b)

              if(totalWidth < this.tableWidth) {
                if(i === autoWidthIndex) {
                  let lastW = this.tableWidth - totalWidth + width
//                  console.log('设置最后一列宽度:::'+ lastW)
                  this.$set(this.cloneColumns[autoWidthIndex], 'width', this.tableWidth - totalWidth + width)
                  this.$set(this.cloneColumns[autoWidthIndex], '_width', this.tableWidth - totalWidth + width)
                }
              }
//              console.log('加载数据,totalW:::'+ totalWidth)
              columnsWidth[column._index] = {
                width: width
              }
            }
            this.columnsWidth = columnsWidth
            this.tableWidth = totalWidth
            // 判断是否有滚动条
            if(!this.isScrollY) {
              this.tableWidth = this.tableWidth - this.scrollBarWidth
            }
          } else {
            // o45出现问题可先把上面注释掉只走下面的逻辑
            const $th = this.$refs.thead.querySelectorAll('thead .cur-th')[0].querySelectorAll('th')
            for (let i = 0; i < $th.length; i++) {
              // can not use forEach in Firefox
              const column = this.cloneColumns[i]
              let curWidth = parseInt(getStyle($th[i], 'width'))
              let width = parseInt(curWidth)
              if (i === autoWidthIndex) {
                width = width - 1
              }
              // 自适应列在表格宽度较小时显示异常，为自适应列设置最小宽度100（拖拽后除外）
              if (column.width) {
                width = column.width || ''
              } else {
                let min = column.minWidth?column.minWidth:100
                if (width < min) width = min
              }
              this.cloneColumns[i]._width = width || ''
              totalWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b)
              columnsWidth[column._index] = {
                width: width
              }
            }

            this.columnsWidth = columnsWidth
            this.tableWidth = totalWidth
//            console.log('无数据时总宽:::'+this.tableWidth)
          }
//          console.log('实际设置总宽:::'+this.tableWidth)
          // get table real height,for fixed when set height prop,but height < table's height,show scrollBarWidth
          this.bodyRealHeight =
            parseInt(getStyle(this.$refs.tbody, 'height')) || 0
          this.headerRealHeight =
            parseInt(getStyle(this.$refs.header, 'height')) || 0
          this.initWidth = parseInt(getStyle(this.$refs.tableWrap, 'width')) || 0
          if(this.$refs.content){
            this.$nextTick(()=>{
              this.isHorizontal = this.$refs.content.scrollWidth > this.$refs.content.clientWidth?true:false
            })
          }
        })
      })
    },
    getshiftSelect(_index) {
      this.curShiftIndex = _index
      switch (this.shiftSelect.length) {
        case 0:
          this.shiftSelect[0] = _index
          break
        case 1:
          let min = Math.min(this.shiftSelect[0], _index)
          let max = Math.max(this.shiftSelect[0], _index)
          this.$set(this.shiftSelect, 0, min)
          this.$set(this.shiftSelect, 1, max)
          break
        case 2:
          if (_index < this.shiftSelect[0])
            this.$set(this.shiftSelect, 0, _index)
          if (_index > this.shiftSelect[1])
            this.$set(this.shiftSelect, 1, _index)
          break
        default:
          this.shiftSelect = []
      }
    },
    getctrlSelect(_index) {
      let itemIndex = this.ctrlSelect.indexOf(_index)
      if (itemIndex == -1) {
        this.ctrlSelect.push(_index)
        this.objData[_index]._isChecked = true
      } else {
        this.ctrlSelect.splice(itemIndex, 1)
        this.objData[_index]._isHighlight = false
        this.objData[_index]._isChecked = false
      }
      this.$nextTick(() => {
        this.$emit(
          'on-selection-change',
          this.getSelection(),
          this.getSelection(true),
          _index
        )
      })
    },
    handleClick() {},
    handleClickTr(event, rowIndex, status, curIndex) {
      curIndex = curIndex + this.start
      if (event.shiftKey && rowIndex) {
        this.getshiftSelect(curIndex)
      } else if (!status) {
        this.shiftSelect = []
        this.shiftSelect[0] = curIndex
      } else {
        this.shiftSelect = []
      }
    },
    handleMouseIn(_index) {
      if (this.disabledHover) return
      if (this.objData[_index]._isHover) return
      this.hoverIndex = _index
      // this.objData[_index]._isHover = true
    },
    handleMouseOut(_index) {
      if (this.disabledHover) return
      this.hoverIndex = -1
      // this.objData[_index]._isHover = false
    },
    highlightCurrentRow(_index) {
      if (!this.highlightRow) return
      const curStatus =
        this.objData[_index] &&
        this.objData[_index].hasOwnProperty('_isHighlight')
          ? this.objData[_index]._isHighlight
          : false
      let oldIndex = -1
      // 选择多项，点击其中一项选中，其他反选
      if(this.objData[_index]._isChecked&&this.rowSelectOnly){
        for(let i in this.objData) {
          if(this.objData[i]._isChecked) {
            this.objData[i]._isChecked = false
          }
          this.objData[_index]._isChecked = true
        }
        this.$nextTick(() => {
          this.$emit('on-selection-change',
            this.getSelection(),
            this.getSelection(true),
            _index)
        })
        return
      }
      for (let i in this.objData) {
        this.objData[i]._isChecked = false //单选时取消多选项，估值6.0专用
        if (
          this.objData[i]._isHighlight &&
          this.objData[_index].hasOwnProperty('_isHighlight')
        ) {
          oldIndex = parseInt(i)
          this.objData[i]._isHighlight = false //单选是上一项取消选中
        }
      }
      const oldData = oldIndex < 0 ? null : JSON.parse(JSON.stringify(this.cloneData[oldIndex]))
      if (curStatus && !this.selectOption) {
        this.objData[_index]._isHighlight = false
        this.objData[_index]._isChecked = false
        this.$emit('on-current-change-cancel',
          JSON.parse(JSON.stringify(this.cloneData[_index])),
          oldData,
          _index)
        this.$nextTick(() => {
          this.$emit('on-current-change', null, null)
        })
      } else {
        if (
          this.objData[_index] &&
          this.objData[_index].hasOwnProperty('_isHighlight')
        )
          this.objData[_index]._isHighlight = true
        if (
          this.objData[_index] &&
          this.objData[_index].hasOwnProperty('_isChecked')
        )
          this.objData[_index]._isChecked = true
        // this.$emit('on-current-change', JSON.parse(JSON.stringify(this.cloneData[_index])), oldData);
        this.$nextTick(() => {
          if (this.cloneData[_index]) {
            this.$emit(
              'on-current-change',
              JSON.parse(JSON.stringify(this.cloneData[_index])),
              _index
            )
          } else {
            this.$emit('on-current-change', null, null)
          }
        })
      }
      this.$nextTick(() => {
        this.$emit(
          'on-selection-change',
          this.getSelection(),
          this.getSelection(true),
          _index
        )
      })
    },
    clickCurrentRowTr(event, _index, curIndex) {
      curIndex = curIndex + this.start
      if (!event.shiftKey && !event.ctrlKey) {
        // (this.highlightRow && !this.selectType)//单选配置时支持shift贺ctrl多选
        if (this.rowSelect) {
          // this.objData[_index]._isChecked=!this.objData[_index]._isChecked;
          this.toggleSelect(_index, curIndex)
        } else {
          this.clickCurrentRow(_index,curIndex)
        }
        if (this.objData[_index]._isHighlight) {
          this.shiftSelect = []
          this.ctrlSelect = []
          this.shiftSelect[0] = curIndex
          this.ctrlSelect.push(_index)
        } else {
          this.shiftSelect = []
          this.ctrlSelect = []
        }
      } else if (event.shiftKey) {
        window.getSelection()
          ? window.getSelection().removeAllRanges()
          : document.selection.empty()
        this.getshiftSelect(curIndex)
      } else {
        this.getctrlSelect(_index)
      }
    },
    dblclickCurrentRowTr(_index,curIndex) {
      curIndex = curIndex + this.start
      if (!this.rowSelect) {
        this.dblclickCurrentRow(_index,curIndex)
      }
    },
    clickCurrentRow(_index,curIndex) {
      if(this.objData[_index]._disabled) {
        return
      }
      this.baseInx = curIndex
      this.offsetInx = curIndex
      if (!this.rowSelect) {
        this.focusIndex = curIndex
        this.highlightCurrentRow(_index)
      }
      this.$nextTick(() => {
        if (this.cloneData[_index]) {
          this.$emit('on-row-click', [
            JSON.parse(JSON.stringify(this.cloneData[_index])),
            _index
          ])
        } else {
          this.$emit('on-current-change', null, null)
        }
      })
    },
    dblclickCurrentRow(_index,curIndex) {
      if (!this.rowSelect) {
        this.focusIndex = curIndex
        this.highlightCurrentRow(_index)
      }
      this.$nextTick(() => {
        this.$emit(
          'on-row-dblclick',
          JSON.parse(JSON.stringify(this.cloneData[_index])),
          JSON.parse(JSON.stringify({
            index:_index,
            status:this.objData[_index]._isChecked||this.objData[_index]._isHighlight
          })),
        )
      })
    },
    getSelection(status = false) {
      let selectionIndexes = []
      for (let i in this.objData) {
        if (this.objData[i]._isChecked) selectionIndexes.push(parseInt(i))
      }
      if (this.dataCheckedProp) {
        for (var i = 0; i < this.data.length; i++) {
          if (selectionIndexes.indexOf(i) > -1) {
            this.data[i]._checked = true
          } else {
            this.data[i]._checked = false
          }
        }
      }
      // return status?selectionIndexes:JSON.parse(JSON.stringify(this.data.filter((data, index) => selectionIndexes.indexOf(index) > -1)));
      // 考虑addData模式
      return status
        ? selectionIndexes
        : JSON.parse(
          JSON.stringify(
            this.cloneData.filter(
              (data, index) => selectionIndexes.indexOf(index) > -1
            )
          )
        )
    },
    toggleSelect(_index, curIndex) {
      if(this.objData[_index]._disabled) {
        return
      }
      if(this.highlightRow){
        this.focusIndex = curIndex
      }
      this.allclick = false
      let data = {}
      for (let i in this.objData) {
        if (parseInt(i) === _index) {
          data = this.objData[i]
        }
      }
      const status = !data._isChecked
      this.objData[_index]._isChecked = status
      if (!status) {
        this.objData[_index]._isHighlight = false
      }
      this.baseInx = curIndex
      this.offsetInx = curIndex
      this.$nextTick(() => {
        const selection = this.getSelection()
        // this.$emit(status ? 'on-select' : 'on-select-cancel', selection, JSON.parse(JSON.stringify(this.data[_index])));
        // 考虑addData模式
        this.$emit(
          status ? 'on-select' : 'on-select-cancel',
          selection,
          JSON.parse(JSON.stringify(this.cloneData[_index]))
        )
        this.$emit(
          'on-selection-change',
          selection,
          this.getSelection(true),
          _index
        )
      })
    },
    clearAllRow() {
      for (let i in this.objData) {
        if (this.objData[i]._isHighlight) {
          this.objData[i]._isHighlight = false
        }
      }
    },
    toggleMached(arr) {
      for (let i in this.objData) {
        this.objData[i]._isMatched = false //取消所有匹配项，估值6.0专用
      }
      if (arr.length == 0) return false
      arr.map(inx => {
        this.objData[inx]._isMatched = true
      })
    },
    itemSelect(i, status) {
      if (!this.rebuildData[i]) return
      let index = this.rebuildData[i]._index
      this.objData[index]._isHighlight = false
      if (!this.objData[index]._isDisabled) {
        this.objData[index]._isChecked = status
      }
    },
    selectAll(status) {
      this.allclick = true
      for (const data of this.visibleData) {
        this.objData[data._index]._isHighlight = false
        if (this.objData[data._index]._isDisabled) {
          continue
        } else {
          this.objData[data._index]._isChecked = status
        }
      }
      setTimeout(() => {
        for (const data of this.rebuildData) {
          this.objData[data._index]._isHighlight = false
          if (this.objData[data._index]._isDisabled) {
            continue
          } else {
            this.objData[data._index]._isChecked = status
          }
        }
        this.$nextTick(() => {
          const selection = this.getSelection()
          this.$emit('on-select-all', selection)
          this.$emit(
            'on-selection-change',
            selection,
            this.getSelection(true),
            null
          )
        })
      }, 0)
    },
    /**
     * 获取所有列选中的排序件
     */
    getSorts() {
      const cloneColumns = this.cloneColumns
      const filters = {}
      cloneColumns.forEach(col => {
        if (col.sortable&&col._sortType!='normal') {
          filters[col.key] = col._sortType
        }
      })
      return filters
    },
    handleSort(index, type) {
      if (this.cloneColumns[index]._sortType === type) {
        type = 'normal'
      }
      if (this.cloneColumns[index].remote) {
        this.$emit('on-sort-change', {
          column: JSON.parse(
            JSON.stringify(this.columns[this.cloneColumns[index]._index])
          ),
          key: this.cloneColumns[index].key,
          order: type
        })
        this.cloneColumns[index]._sortType = type
        return
      }
      let _index = this.cloneColumns[index]._index
      //【TS:201907290144-资管业委会（资管）_孔磊-【需求类型】需求【需求描述】表格1、勾选框列可以排序，选中的在上面】
      const columnType = this.cloneColumns[index].type
      const key = this.cloneColumns[index].key
      if(columnType === 'selection') {
        this.rebuildData = this.sortDataBySelect(this.getSelection(true), this.rebuildData, type)
        this.cloneColumns[index]._sortType = type
        this.$nextTick(() => {
          this.$emit('on-sort-change', {
            column: JSON.parse(JSON.stringify(this.columns[this.cloneColumns[index]._index])),
            key: key,
            order: type
          })
          this.updateVisibleData()
        })
        return
      }
      this.handleSortT(_index, type)
    },
    sortDataBySelect(checkData, data, type) {
      //勾选排上面
      let d = []
      if(type === 'asc') {
        for(let i of checkData) {
          for(let j in data) {
            if(data[j]._index === i) {
              d.push(data[j])
              data.splice(j, 1)
            }
          }
        }
        data = d.concat(data)
      }else {
        data.sort((a, b) => {
          if(a._index > b._index) {
            return 1
          } else {
            return -1
          }
        })
      }
      return data
    },
    handleSortByHead(index) {
      const column = this.cloneColumns[index]
      if (column.sortable) {
        const type = column._sortType
        if (type === 'normal') {
          this.handleSort(index, 'asc')
        } else if (type === 'asc') {
          this.handleSort(index, 'desc')
        } else {
          this.handleSort(index, 'normal')
        }
      }
    },
    sortData(data, type, index) {
      const key = this.cloneColumns[index].key
      data.sort((a, b) => {
        if (this.cloneColumns[index].sortMethod) {
          return this.cloneColumns[index].sortMethod(a[key], b[key], type)
        } else {
          if (type === 'asc') {
            return a[key] > b[key] ? 1 : -1
          } else if (type === 'desc') {
            return a[key] < b[key] ? 1 : -1
          }
        }
      })
      return data
    },
    handleSortT(_index, type) {
      let index
      this.cloneColumns.forEach((col, i) => {
        if(!this.isMulitSort) {
          col._sortType = 'normal'
        }
        if (col._index == _index) {
          index = i
        }
      })
      //rightFixed index error
      this.cloneColumns[index]._sortType = type
      if(this.isMulitSort){
        this.$emit('on-sort-change',JSON.parse(JSON.stringify(this.getSorts())))
        return
      }
      const key = this.cloneColumns[index].key
      if (this.cloneColumns[index].sortable !== 'custom') {
        let selectInx = -1
        if(this.focusIndex!=-1){
          selectInx = this.rebuildData[this.focusIndex]._index
        }
        // custom is for remote sort
        if (type === 'normal') {
          this.rebuildData = this.makeDataWithFilter()
        } else {
          this.rebuildData = this.sortData(this.rebuildData, type, index)
        }
        if(this.focusIndex!=-1&&selectInx!=-1){
          this.rebuildData.forEach((col,i)=>{
            if (col._index == selectInx) {
              this.focusIndex = i
            }
          })
        }
      }
      this.$nextTick(() => {
        this.$emit('on-sort-change', {
          column: JSON.parse(
            JSON.stringify(this.columns[this.cloneColumns[index]._index])
          ),
          key: key,
          order: type
        })
        this.updateVisibleData()
      })
    },
    /*
     * Function: 过滤数据
     */
    filterData(data, column) {
      return data.filter(row => {
        //如果定义了远程过滤方法则忽略此方法
        if (typeof column.filterRemote === 'function') return true

        let status = !column._filterChecked.length
        for (let i = 0; i < column._filterChecked.length; i++) {
          status = column.filterMethod(column._filterChecked[i], row)
          if (status) break
        }
        return status
      })
    },
    filterOtherData(data, index) {
      let column = this.cloneColumns[index]
      if (typeof column.filterRemote === 'function') {
        column.filterRemote.call(
          this.$parent,
          column._filterChecked,
          column.key,
          column
        )
      }

      this.cloneColumns.forEach((col, colIndex) => {
        if (colIndex !== index) {
          data = this.filterData(data, col)
        }
      })
      return data
    },
    handleFilter(_index, isIndex) {
      let index
      if (isIndex) {
        index = _index
      } else {
        index = this.getIndex(_index)
      }
      const column = this.cloneColumns[index]
      let filterData = this.makeDataWithSort()

      // filter others first, after filter this column
      filterData = this.filterOtherData(filterData, index)
      this.rebuildData = this.filterData(filterData, column)
      this.focusIndex = -1
      this.updateVisibleData(0)
      this.cloneColumns[index]._isFiltered = true
      this.cloneColumns[index]._filterVisible = false
      // 筛选后返回数据-汇总使用
      this.$emit('on-filter', this.rebuildData)
    },
    // 隐藏过滤
    handleFilterHide(_index) {
      // clear checked that not filter now
      let index = this.getIndex(_index)
      if (!this.cloneColumns[index]._isFiltered) this.cloneColumns[index]._filterChecked = []
      this.focusIndex = -1
      this.updateVisibleData(0)
    },
    // 过滤项选中
    handleFilterSelect(_index, value) {
      let index = this.getIndex(_index)
      this.cloneColumns[index]._filterChecked = [value]
      this.handleFilter(index, true)
    },
    // filter 重置
    handleFilterReset(_index) {
      let index = this.getIndex(_index)
      this.cloneColumns[index]._isFiltered = false
      this.cloneColumns[index]._filterVisible = false
      this.cloneColumns[index]._filterChecked = []

      let filterData = this.makeDataWithSort()
      filterData = this.filterOtherData(filterData, index)
      this.rebuildData = filterData
      this.focusIndex = -1
      this.updateVisibleData(0)
      // 筛选后返回数据-汇总使用
      this.$emit('on-filter', this.rebuildData)
    },
    /*
     * 获取过滤数据， 仅在配置isFilter后生效
     */
    makeDataWithFilter() {
      let data = this.makeData()
      if (this.isFilter) this.cloneColumns.forEach(col => data = this.filterData(data, col));
      return data
    },
    /**
     * 获取所有列选中的过滤条件
     */
    getFilters() {
      const cloneColumns = this.cloneColumns
      const filters = {}
      cloneColumns.forEach(col => {
        if (col.filters && (col.filterMethod || col.filterRemote) && col.key) {
          filters[col.key] = col._filterChecked
        }
      })
      return filters
    },
    selectRange() {
      // this.$nextTick(()=>{
      setTimeout(() => {
        for (var i = this.shiftSelect[0]; i <= this.shiftSelect[1]; i++) {
          let index = this.rebuildData[i]._index
          this.objData[index]._isHighlight = false
          if (!this.objData[index]._isDisabled) {
            this.objData[index]._isChecked = true
          }
        }
        this.$emit(
          'on-selection-change',
          this.getSelection(),
          this.getSelection(true),
          this.curShiftIndex
        )
      }, 0)
      // })
    },
    fixedHeader() {
      if (this.height) {
        this.$nextTick(() => {
          const titleHeight =
            parseInt(getStyle(this.$refs.title, 'height')) || 0
          if (titleHeight > 0) {
            if (this.$refs.leftF)
              this.$refs.leftF.style.marginTop = titleHeight + 'px'
            if (this.$refs.rightF)
              this.$refs.rightF.style.marginTop = titleHeight + 'px'
          }

          // 兼容 columns 异步生成
          const headerHeight =
            this.headerRealHeight ||
            parseInt(getStyle(this.$refs.header, 'height')) ||
            0
          const footerHeight =
            parseInt(getStyle(this.$refs.footer, 'height')) || 0
          this.bodyHeight =
            this.height - titleHeight - headerHeight - footerHeight
        })
      } else {
        this.bodyHeight = 0
      }
    },
    handleBodyScroll(event) {
      // 修复：拖动滚动条时，无法隐藏显示过滤项
      if (this.curShowFiltersIdx !== null) this.cloneColumns[this.curShowFiltersIdx]._filterVisible = false
      if (window.requestAnimationFrame) { // 该特性有浏览器限制
        this.updateVisibleAnimate(event)
      } else {
        this.privateToScrollTop = false
        let scrolltop = event.target.scrollTop
        this.curPageFirstIndex = Math.floor(scrolltop / this.itemHeight)
        this.$refs.header.scrollLeft = event.target.scrollLeft
        if (this.isSummation) this.sumMarginLeft = event.target.scrollLeft
        if (this.$refs.fixedBody) this.$refs.fixedBody.scrollTop = scrolltop
        let oldBottomNum = this.buttomNum
        this.buttomNum = getBarBottomS(
          event.target,
          this.bodyHeight,
          this.contentHeight,
          this.scrollBarHeight,
          this.isScrollX
        )
        if (oldBottomNum !== null && this.buttomNum !== null) {
          this.$emit('on-scroll', this.buttomNum, scrolltop !== this.lastScrollTop ? 'y' : 'x')
        }
        this.lastScrollTop = scrolltop
        let curtop = Math.floor(scrolltop / this.itemHeight) * this.itemHeight

        this.updateVisibleDataDebounce(false)(scrolltop)
        this.$refs.content.style.transform = `translateY(${curtop}px)`
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translateY(${curtop}px)`
        }
      }
      // setTimeout(() => {
      // this.updateVisibleDataDebounce(false)(scrolltop)
      // }, 0)
    },
    /**
    * @description 使用requestAnimationFrame根据动画帧更新visibleData，原理同setTimeout，更贴近浏览器重绘原理
    */
    updateVisibleAnimate(event) {
      if (this.scheduledAnimationFrame) { return }
      this.scheduledAnimationFrame = true
      window.requestAnimationFrame((num) => {
        this.scheduledAnimationFrame = false
        this.privateToScrollTop = false
        let scrolltop = event.target.scrollTop
        this.curPageFirstIndex = Math.floor(scrolltop / this.itemHeight)
        this.$refs.header.scrollLeft = event.target.scrollLeft
        if (this.isSummation) this.sumMarginLeft = event.target.scrollLeft
        if (this.$refs.fixedBody) this.$refs.fixedBody.scrollTop = scrolltop
        let oldBottomNum = this.buttomNum
        this.buttomNum = getBarBottomS(
          event.target,
          this.bodyHeight,
          this.contentHeight,
          this.scrollBarHeight,
          this.isScrollX
        )
        if (oldBottomNum !== null && this.buttomNum !== null) {
          this.$emit('on-scroll', this.buttomNum, scrolltop !== this.lastScrollTop ? 'y' : 'x')
        }
        this.lastScrollTop = scrolltop
        let curtop = Math.floor(scrolltop / this.itemHeight) * this.itemHeight
        this.updateVisibleData(scrolltop)
        this.$refs.content.style.transform = `translateY(${curtop}px)`
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translateY(${curtop}px)`
        }
      })
    },
    handleFixedMousewheel(event) {
      let deltaY = event.deltaY
      if (!deltaY && event.detail) {
        deltaY = event.detail * this.itemHeight
      }
      if (!deltaY && event.wheelDeltaY) {
        deltaY = -event.wheelDeltaY
      }
      if (!deltaY && event.wheelDelta) {
        deltaY = -event.wheelDelta
      }
      if (!deltaY) return
      const body = this.$refs.body
      const currentScrollTop = body.scrollTop
      if (deltaY < 0 && currentScrollTop !== 0) {
        event.preventDefault()
      }
      if (
        deltaY > 0 &&
        body.scrollHeight - body.clientHeight > currentScrollTop
      ) {
        event.preventDefault()
      }
      //body.scrollTop += deltaY;
      let step = 0
      let timeId = setInterval(() => {
        step += this.itemHeight
        if (deltaY > 0) {
          body.scrollTop += this.itemHeight
        } else {
          body.scrollTop -= this.itemHeight
        }
        if (step >= Math.abs(deltaY)) {
          clearInterval(timeId)
        }
      }, 1)
    },
    updateVisibleData(scrollTop) {
      scrollTop = scrollTop || this.$refs.body.scrollTop
      this.start = Math.floor(scrollTop / this.itemHeight)
      this.end = this.start + this.visibleCount
      this.visibleData = this.rebuildData.slice(this.start, this.end)
      // let curtop =  this.start*this.itemHeight;
      // this.$refs.content.style.transform = `translate3d(0, ${curtop}px, 0)`;
      // if(this.$refs.leftContent){
      //   this.$refs.leftContent.style.transform = `translate3d(0, ${curtop}px, 0)`;
      // }
    },
    /**
     * @description 防抖更新，滚动时调用，防止滚动卡顿
     */
    updateVisibleDataDebounce(immediate = true) {
      if (!this.updateVisibleDataDebounce.body) this.updateVisibleDataDebounce.body = debounceWithImmediate(this.updateVisibleData, 30, immediate)
      return this.updateVisibleDataDebounce.body
    },
    handleMouseWheel(event) {
      const deltaX = event.deltaX
      const $body = this.$refs.body
      if (deltaX > 0) {
        $body.scrollLeft = $body.scrollLeft + 10
      } else {
        $body.scrollLeft = $body.scrollLeft - 10
      }
    },
    getIndex(_index) {
      let index
      this.cloneColumns.forEach((col, i) => {
        if (col._index == _index) {
          index = i
        }
      })
      return index
    }, //rightFixed index error
    makeData() {
      let data = deepCopy(this.data)
      data.forEach((row, index) => {
        row._index = index
        row._rowKey = rowKey++
      })
      return data
    },
    makeAddData() {
      // let addData = deepCopy(this.addData);
      let oldLength = this.rebuildData.length
      let data = {}
      this.addData.forEach((row, index) => {
        const newRow = deepCopy(row)
        newRow._isHover = false
        if (newRow._disabled) {
          newRow._isDisabled = newRow._disabled
        } else {
          newRow._isDisabled = false
        }
        if (newRow._checked) {
          newRow._isChecked = newRow._checked
        } else {
          newRow._isChecked = false
        }
        if (newRow._expanded) {
          newRow._isExpanded = newRow._expanded
        } else {
          newRow._isExpanded = false
        }
        if (newRow._highlight) {
          newRow._isHighlight = newRow._highlight
        } else {
          newRow._isHighlight = false
        }
        if (newRow._isMatched) {
          newRow._isMatched = newRow._isMatched
        } else {
          newRow._isMatched = false
        }
        //【TS:201908140071-资管业委会（资管）_钱佳华-【需求类型】缺陷【需求描述】需求背景：如果开启selectC】 如果全选 分页加载数据 也要全选数据
        if(this.isSelectAll) {
          newRow._isChecked = true
        }
        // const newRowdata = deepCopy(row)
        newRow._index = oldLength + index
        newRow._rowKey = rowKey++
        data[oldLength + index] = newRow
      })
      Object.assign(this.objData, data)
      return Object.values(data)
    },
    makeDataWithSort() {
      let data = this.makeData()
      if (this.notSort) {
        return data
      }
      let sortType = 'normal'
      let sortIndex = -1
      let isCustom = false

      for (let i = 0; i < this.cloneColumns.length; i++) {
        if (this.cloneColumns[i]._sortType !== 'normal') {
          sortType = this.cloneColumns[i]._sortType
          sortIndex = i
          isCustom = this.cloneColumns[i].sortable === 'custom'
          break
        }
      }
      if (sortType !== 'normal' && !isCustom)
        data = this.sortData(data, sortType, sortIndex)
      return data
    },
    makeDataWithSortAndFilter() {
      // let data = this.makeData();
      let data = this.makeDataWithSort()
      if (this.isFilter) this.cloneColumns.forEach(col => (data = this.filterData(data, col)))
      return data
    },
    makeObjData() {
      let data = {}
      this.data.forEach((row, index) => {
        const newRow = deepCopy(row) // todo 直接替换
        newRow._isHover = false
        if (newRow._disabled) {
          newRow._isDisabled = newRow._disabled
        } else {
          newRow._isDisabled = false
        }
        if (newRow._checked) {
          newRow._isChecked = newRow._checked
        } else {
          newRow._isChecked = false
        }
        if (newRow._expanded) {
          newRow._isExpanded = newRow._expanded
        } else {
          newRow._isExpanded = false
        }
        if (newRow._highlight) {
          newRow._isHighlight = newRow._highlight
        } else {
          newRow._isHighlight = false
        }
        if (newRow._isMatched) {
          newRow._isMatched = newRow._isMatched
        } else {
          newRow._isMatched = false
        }
        data[index] = newRow
      })
      return data
    },
    makeColumns() {
      let columns = deepCopy(this.columns)
      let left = []
      let right = []
      let center = []
      let curType = false
      columns.forEach((column, index) => {
        if (column.type == 'selection') {
          curType = true
        }
        column._index = index
        column._columnKey = columnKey++
        column._width = column.width ? column.width : '' // update in handleResize()
        column._sortType = 'normal'
        column._filterVisible = false
        column._isFiltered = false
        column._filterChecked = []

        if ('filterMultiple' in column) {
          column._filterMultiple = column.filterMultiple
        } else {
          column._filterMultiple = true
        }
        if ('filteredValue' in column) {
          column._filterChecked = column.filteredValue
          column._isFiltered = true
        }
        if ('sortType' in column) {
          column._sortType = column.sortType
        }
        if (!column.hiddenCol || column.hiddenCol == 'false') {
          if (column.fixed && column.fixed === 'left') {
            left.push(column)
          } else if (column.fixed && column.fixed === 'right') {
            right.push(column)
          } else {
            center.push(column)
          }
        }
      })
      this.$nextTick(() => {
        this.selectType = curType
      })
      return left.concat(center).concat(right)
    },
    initResize() {
      this.$nextTick(() => {
        this.initWidth = parseInt(getStyle(this.$refs.tableWrap, 'width')) || 0
      })
    },
    exportCsv(params = {}) {
      if (params.filename) {
        if (params.filename.indexOf('.csv') === -1) {
          params.filename += params.format ? '.' + params.format : '.csv'
        }
      } else {
        params.filename = params.format
          ? 'simpleTable.' + params.format
          : 'simpleTable.csv'
      }
      let columns = []
      let datas = []
      if (params.columns && params.data) {
        columns = params.columns
        datas = params.data
      } else {
        columns = this.columns
        if (!('original' in params)) params.original = true
        datas = params.original ? this.data : this.rebuildData
      }
      let noHeader = false
      if ('noHeader' in params) noHeader = params.noHeader
      const data = Csv(columns, datas, params, noHeader)
      ExportCsv.download(params.filename, data, params.format)
    },
    handleKeydown(e) {
      if (this.isCurrent && !e.shiftKey) {
        const keyCode = e.keyCode
        // next
        if (keyCode === 40) {
          e.preventDefault()
          e.stopPropagation()
          this.navigateOptions('next')
        }
        // prev
        if (keyCode === 38) {
          e.preventDefault()
          e.stopPropagation()
          this.navigateOptions('prev')
        }
        // end
        if (keyCode == 35) {
        }
        // home
        if (keyCode == 36) {
        }
        // ctrl
        if (e.keyCode === 17) {
          e.preventDefault()
          e.stopPropagation()
          this.isCtrlDown = true
        }
      }
    },
    navigateOptions(direction) {
      if (
        this.isFocusSelect &&
        this.objData[this.focusIndex] &&
        this.switchEmpty
      ) {
        if (this.objData[this.focusIndex].hasOwnProperty('_isChecked'))
          this.objData[this.focusIndex]._isChecked = false
        if (this.objData[this.focusIndex].hasOwnProperty('_isHighlight'))
          this.objData[this.focusIndex]._isHighlight = false
        this.isFocusSelect = false
      }
      let curTop = this.$refs.body.scrollTop ? this.$refs.body.scrollTop : 0
      let contentHeight = this.$refs.body.clientHeight
      // curPageFirstIndex当前屏第一条数据
      let top = this.itemHeight * this.focusIndex
      // let curPageCount = this.isScrollX ? this.visibleCount - 1 : this.visibleCount
      let curPageCount = this.isScrollX
        ? this.visibleCount - 2
        : this.visibleCount - 1
      // 焦点在当前屏，则进行+1或者-1
      if (
        this.focusIndex >= this.curPageFirstIndex &&
        this.focusIndex <= this.curPageFirstIndex + curPageCount
      ) {
        if (direction === 'next') {
          // if (this.focusIndex == this.data.length - 1) return
          if (this.focusIndex == this.rebuildData.length - 1) return
          this.focusIndex = this.focusIndex + 1
        } else if (direction === 'prev') {
          if (this.focusIndex == 0) return
          this.focusIndex = this.focusIndex - 1
        }
        // +1或者-1后判断是否在当前屏，判断是否需要滚动
        if (
          this.focusIndex > this.curPageFirstIndex &&
          this.focusIndex < this.curPageFirstIndex + curPageCount
        ) {
          top = this.focusIndex == 0 ? 0 : curTop
        } else {
          if (direction === 'next') {
            // 向下滚动
            top = this.itemHeight * (this.focusIndex - curPageCount + 1)
            // 当前屏第一条索引更新
            this.curPageFirstIndex = this.focusIndex - curPageCount + 1
          } else if (direction === 'prev') {
            this.curPageFirstIndex = this.focusIndex
            top = this.itemHeight * this.focusIndex
          }
        }
      } else {
        // 滚动后切到本屏第一条
        this.focusIndex = this.curPageFirstIndex
        top = curTop
      }
      this.baseInx = this.focusIndex
      this.offsetInx = this.focusIndex
      if (curTop != top) {
        this.updateVisibleData(top)
        this.$refs.body.scrollTop = top
        this.$refs.content.style.transform = `translateY(${top}px)`
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translateY(${top}px)`
        }
      }
    },
    handleKeyup(e) {
      if (this.isCurrent && !e.shiftKey) {
        this.isFocusSelect = true
        if (e.keyCode === 40 || e.keyCode === 38) {
          e.preventDefault()
          e.stopPropagation()
          let _index = this.rebuildData && this.rebuildData[this.focusIndex] ? this.rebuildData[this.focusIndex]._index : null
          if (_index !== null && Number(_index) >= 0) this.highlightCurrentRow(_index)
        }
        // ctrl
        if (e.keyCode === 17) {
          e.preventDefault()
          e.stopPropagation()
          this.isCtrlDown = false
        }
      }
    },
    keySelectRange() {
      let max, min
      if (this.baseInx < this.offsetInx) {
        min = this.baseInx + 1
        max = this.offsetInx
      }
      if (this.baseInx > this.offsetInx) {
        min = this.offsetInx
        max = this.baseInx - 1
      }
      for (var i = 0; i < this.rebuildData.length; i++) {
        if (this.objData[i]._isDisabled || i == this.baseInx) continue
        let index = this.rebuildData[i]._index
        if (i >= min && i <= max) {
          this.objData[index]._isChecked = true
        } else {
          this.objData[index]._isChecked = false
        }
      }
      this.focusIndex = this.offsetInx
      this.$emit(
        'on-selection-change',
        this.getSelection(),
        this.getSelection(true)
      )
    },
    keySelect(e) {
      if (e.shiftKey && (this.baseInx || this.baseInx == 0)) {
        const keyCode = e.keyCode
        if (keyCode === 40) {
          e.preventDefault()
          e.stopPropagation()
          if (this.offsetInx < this.rebuildData.length - 1) {
            this.offsetInx++
          }
          this.keySelectRange()
        }
        // prev
        if (keyCode === 38) {
          e.preventDefault()
          e.stopPropagation()
          if (this.offsetInx > 0) {
            this.offsetInx--
          }
          this.keySelectRange()
        }
      }
    },
    resetTableScrollPos() {
      if (this.$refs.header) {
        this.$refs.header.scrollLeft = 0
      }
      const body = this.$refs.body
      if (body) {
        body.scrollLeft = 0
        const bodyContent = this.$refs.content
        if (bodyContent) {
          bodyContent.style.transform = 'translateY(0)'
          body.scrollTop = 0
        }
      }
      const fixedBodyContent = this.$refs.leftContent
      if (fixedBodyContent) {
        fixedBodyContent.style.transform = 'translateY(0)'
        if (this.$refs.fixedBody) {
          this.$refs.fixedBody.scrollTop = 0
        }
      }
      if (this.$refs.summation) {
        this.$refs.summation.style.marginLeft = 0
      }
    }
  },
  created() {
    if (!this.context) this.currentContext = this.$parent
    this.showSlotHeader = this.$slots.header !== undefined
    this.showSlotFooter = this.$slots.footer !== undefined
    this.rebuildData = this.makeDataWithSortAndFilter()
  },
  mounted() {
    this.handleResize()
    this.fixedHeader()
    this.getLeftWidth()
    on(document, 'keydown', this.handleKeydown)
    on(document, 'keyup', this.handleKeyup)
    this.$nextTick(() => {
      this.ready = true
      this.initWidth = parseInt(getStyle(this.$refs.tableWrap, 'width')) || 0
      this.visibleCount =
        Math.ceil(this.height / this.itemHeight) - (this.showHeader ? 0 : -1)
        this.updateVisibleData()
      // this.focusIndex = this.defaultFocusIndex
    })
    //window.addEventListener('resize', this.handleResize, false);
    on(window, 'resize', this.handleResize)
    on(window, 'resize', this.initResize)
    on(window, 'resize', this.getLeftWidth)
    this.$on('on-visible-change', val => {
      if (val) {
        this.handleResize()
        this.fixedHeader()
        this.getLeftWidth()
        this.resetTableScrollPos()
      }
    })
    on(document, 'keyup', this.keySelect)
  },
  beforeDestroy() {
    //window.removeEventListener('resize', this.handleResize, false);
    off(window, 'resize', this.handleResize)
    off(window, 'resize', this.initResize)
    off(window, 'resize', this.getLeftWidth)
    off(document, 'keydown', this.handleKeydown)
    off(document, 'keyup', this.handleKeyup)
    off(document, 'keyup', this.keySelect)
  },
  watch: {
    toScrollTop() {
      this.privateToScrollTop = this.toScrollTop
    },
    privateToScrollTop(val) {
      if (val) {
        this.$refs.body.scrollTop = this.scrollTopSet
        this.$nextTick(() => {
          // this.clickCurrentRow(0)
        })
      }
    },
    addData: {
      handler(val, old) {
        if (val && val.length > 0) {
          let addData = this.makeAddData(val)
          this.rebuildData.push.apply(this.rebuildData, addData)
          this.updateVisibleData()
          this.$nextTick(() => {
            this.cloneData.push.apply(this.cloneData, deepCopy(this.addData))
            if(this.isSelectAll) {
              this.$emit(
                'on-selection-change',
                this.getSelection(),
                this.getSelection(true)
              )
            }
          })
        }
      },
      deep: true
    },
    data: {
      handler(val) {
        const oldDataLen = this.rebuildData.length
        this.rebuildData = this.makeDataWithSortAndFilter()
        this.objData = this.makeObjData()
        if (this.addData && this.addData.length > 0) {
          // 针对addData 模式
          this.$refs.body.scrollTop = 0
        }
        // this.rebuildData = this.data;
        // if (!oldDataLen) {
        //   this.fixedHeader();
        // }
        // 处理从无数据到有数据或者有数据到无数据时，表头和统计行水平位置没有归零的问题
        if (oldDataLen === 0 || val.length === 0) {
          if(this.$refs.header) {
            this.$refs.header.scrollLeft = 0
          }
          if (this.$refs.body) {
            this.$refs.body.scrollLeft = 0
          }
          if (this.$refs.summation) {
            this.$refs.summation.style.marginLeft = 0
          }
        }
        if(this.$refs.body.scrollTop > val.length*this.itemHeight){
          this.$refs.body.scrollTop = val.length*this.itemHeight-this.height
        }
        this.updateVisibleData()
        this.handleResize()
        // here will trigger before clickCurrentRow, so use async
        this.$nextTick(() => {
          this.cloneData = deepCopy(this.data)
        })
      },
      deep: true
    },
    columns: {
      handler() {
        // todo 这里有性能问题，可能是左右固定计算属性影响的
        this.cloneColumns = this.makeColumns()
        this.rebuildData = this.makeDataWithSortAndFilter()
        this.handleResize()
        this.buttomNum = null
        this.topNum = null
        this.$nextTick(() => {
          this.updateVisibleData()
        })
      },
      deep: true
    },
    cloneColumns: {
      deep: true,
      handler() {
        // 有过滤项时，实时修改当前显示index,防止滚动是不隐藏
        if (this.isFilter) {
          this.cloneColumns.some((item, index) => {
            this.curShowFiltersIdx = item._filterVisible == true ? index : null
            return item._filterVisible
          })
        }
        this.getLeftWidth()
      }
    },
    height() {
      this.fixedHeader()
      this.$nextTick(() => {
        this.visibleCount =
          Math.ceil(this.height / this.itemHeight) - (this.showHeader ? 0 : -1)
        this.updateVisibleData()
      })
    },
    shiftSelect(val) {
      if (val.length == 2) {
        this.selectRange()
      }
    },
    defaultFocusIndex(val) {
      if (val !== null) {
        this.focusIndex = val
        if (val >= 0) {
          this.$nextTick(() => {
            this.highlightCurrentRow(val)
          })
        }
      } else {
        this.focusIndex = -1
        this.curPageFirstIndex = 0
      }
    }
  },
  activated() {
    if (this.keepAliveFlag) {
      let transform = this.$refs.content ? this.$refs.content.style.transform : ''
      let transformMatch = transform.match(/translateY\(\d+px,\s*(\d+)px,\s*(\d+)px\)/i)
      if(transformMatch !== null) {
        this.$refs.body.scrollTop = transformMatch[1]
      }
      this.handleResize()
      on(window, 'resize', this.handleResize)
    }
    this.keepAliveFlag = true
  },
  deactivated() {
    if (this.keepAliveFlag) {
      off(window, 'resize', this.handleResize)
    }
  }
}
</script>
