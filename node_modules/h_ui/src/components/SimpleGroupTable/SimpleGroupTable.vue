<template>
  <div :class="wrapClasses" :style="styles" ref="tableWrap">
    <div :class="classes">
      <div :class="[prefixCls + '-header']" v-if="showHeader" ref="header" @mousewheel="handleMouseWheel">
        <table cellspacing="0" cellpadding="0" border="0" :style="headStyles" ref="thead">
          <colgroup>
            <col v-for="(column, index) in cloneColumns" :width="setCellWidth(column, index, true)" :key="index">
          </colgroup>
          <thead>
            <tr v-if="multiLevel" v-for="(colItem,inx) in multiData" :key="inx">
              <th v-for="(multi, index) in colItem" :colspan="multi.cols||1" :rowspan="multi.rows||1" :key="index" :class="aliCls(multi)">
                <!-- <div :class="[prefixCls+'-cell']">
                  <span>{{multi.title}}</span>
                </div> -->
                 <!-- <table-cell
                    :column="multi"
                    :index = "index"
                    :checked = "isSelectAll"
                    :prefixCls="prefixCls"
                    :class="[prefixCls+'-cell']"
                  >
                </table-cell> -->
                <div :class="[prefixCls + '-cell']">
                  <template v-if="multi.type === 'selection'">
                    <Checkbox v-if="!multi.title" size="large" :value="isSelectAll" @on-change="selectAll"></Checkbox>
                    <span v-else>{{multi.title}}</span>
                  </template>
                  <template v-else>
                    <span v-if="!multi.renderHeader">{{ multi.title || multi.title == '' ? multi.title : '#' }}</span>
                    <render-header v-else :render="multi.renderHeader" :column="multi" :index="index"></render-header>
                  </template>
                </div>
              </th>
            </tr>
            <tr class="cur-th" v-show="!isNotShowCurTh">
              <th v-for="(column, index) in cloneColumns"
                :key="index"
                v-on:mousedown="mousedown($event,column,index)"
                v-on:mouseout="mouseout($event,column,index)"
                v-on:mousemove="mousemove($event,column,index)"
                :class="alignCls(column)"
                >
                <!--table-cell  -->
                <div :class="[prefixCls + '-cell']">
                  <template v-if="column.type === 'selection'">
                    <Checkbox v-if="!column.title" size="large" :value="isSelectAll" @on-change="selectAll"></Checkbox>
                    <span v-else>{{column.title}}</span>
                  </template>
                  <template v-else>
                    <!-- <span>{{ column.title || column.title == '' ? column.title : '#' }}</span>
                    -->
                    <span v-if="!column.renderHeader">{{ column.title || column.title == '' ? column.title : '#' }}</span>
                    <render-header v-else :render="column.renderHeader" :column="column" :index="index"></render-header>
                  </template>
                </div>
                <!-- <table-cell
                  :column="column"
                  :index = "index"
                  :checked = "isSelectAll"
                  :prefixCls="prefixCls"
                >
                </table-cell> -->
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <div ref="body" :class="[prefixCls + '-body'] " class="h-simple-view" :style="bodyStyle" @scroll="handleBodyScroll"
        v-show="!((!!localeNoDataText && (!data || data.length === 0)) || (!!localeNoFilteredDataText && (!rebuildData || rebuildData.length === 0)))">
        <div :class="[prefixCls + '-phantom']" :style="{height: contentHeight + 'px'}">
        </div>
        <div class="h-simple-content"  ref="content">
          <table cellspacing="0" cellpadding="0" border="0" :style="tableStyle" ref="tbody">
            <colgroup>
              <col v-for="(column, index) in cloneColumns" :width="setCellWidth(column, index, false)" :key="index">
            </colgroup>
            <tbody :class="[prefixCls + '-tbody']">
              <template v-for="row in visibleData">
                <!--group-tr  -->
                <tr :class="groupRowClasses(row)" v-if="row._isGroup" :key="row._rowKey">
                  <td v-show="columns[0].type=='selection'" :class="alignCls(columns[0])">
                    <div :class="prefixCls+'-cell'">
                      <Checkbox :value="rowChecked(row._index)" @on-change="toggleSelect(row._index)"></Checkbox>
                    </div>
                  </td>
                  <td :colspan="columns[0].type=='selection'?columns.length-1:columns.length" :style="groupStyle">
                    <div :class="prefixCls+'-cell-group'" @click="handleToggleExpand(row)">
                      <span :class="groupCls(Boolean(row.expand))">
                        <Icon name="enter"></Icon>
                      </span>
                      <span :class="prefixCls+'-cell-title'">{{row.title}}</span>
                    </div>
                  </td>
                </tr>
                <table-tr
                  v-else
                  :row="row"
                  :key="row._rowKey"
                  :prefix-cls="prefixCls"
                  :hoverIndex="hoverIndex"
                  @mouseenter.native.stop="handleMouseIn(row._index)"
                  @mouseleave.native.stop="handleMouseOut(row._index)"
                  @click.native="clickCurrentRowTr($event,row._index)"
                  @dblclick.native.stop="dblclickCurrentRowTr(row._index)"
                >
                  <td v-for="column in cloneColumns" :class="alignCls(column, row)" :data-index="row._index+1" :key="column._index"  @click="handleCellClick($event,row[column.key], row._index, column)">
                    <div :class="classesTd(column)">
                      <!-- &&!this.splitIndex -->
                      <template v-if="column.type === 'index'&&!splitIndex">{{row._index + 1}}</template>
                      <template v-if="column.type === 'selection'">
                        <Checkbox :size="calcCheckboxSize(column.checkboxSize)" :value="rowChecked(row._index)" @click.native.stop="handleClickTr($event,row._index,rowChecked(row._index))" @on-change="toggleSelect(row._index)" :disabled="rowDisabled(row._index)"></Checkbox>
                      </template>
                      <template v-if="!column.type&&!column.render"><span v-html="row[column.key]"></span></template>
                      <template v-if="column.render">
                        <Cell
                          :row="row"
                          :key="column._columnKey"
                          :column="column"
                          :index="row._index"
                        ></Cell>
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
        v-if="((!!localeNoDataText && (!data || data.length === 0)) || (!!localeNoFilteredDataText && (!rebuildData || rebuildData.length === 0)))" @scroll="handleBodyScroll" :style="bodyStyle">
        <div :class="[prefixCls+'-tiptext']" :style="textStyle" >
          <span v-html="localeNoDataText" v-if="!data || data.length === 0"></span>
          <span v-html="localeNoFilteredDataText" v-else></span>
        </div>
        <table cellspacing="0" cellpadding="0" border="0" :style="tableStyle">
          <tbody>
            <tr>
            </tr>
          </tbody>
        </table>
      </div>
      <div :class="[prefixCls + '-fixed']" :style="fixedTableStyle" v-if="isLeftFixed" ref="leftF">
        <div :class="fixedHeaderClasses">
          <table cellspacing="0" cellpadding="0" border="0" :style="headStyles" ref="leftF">
            <colgroup>
              <col v-for="(column, index) in leftFixedColumns" :width="setCellWidth(column, index, true)" :key="index">
            </colgroup>
            <thead>
              <tr v-if="multiLevel" v-for="(colItem,inx) in leftMultiLevel" :key="inx">
                <th v-for="(multi, index) in colItem" :colspan="multi.cols||1" :rowspan="multi.rows||1" :key="index" :class="aliCls(multi)">
                    <!-- <table-cell
                      :column="multi"
                      :index = "index"
                      :checked = "isSelectAll"
                      :prefixCls="prefixCls"
                      :class="[prefixCls+'-cell']"
                    >
                    </table-cell> -->
                  <!-- <div :class="[prefixCls+'-cell']">
                     <span>{{multi.title}}</span>
                  </div> -->
                  <div :class="[prefixCls + '-cell']">
                    <template v-if="multi.type === 'selection'">
                      <Checkbox v-if="!multi.title" size="large" :value="isSelectAll" @on-change="selectAll"></Checkbox>
                      <span v-else>{{multi.title}}</span>
                    </template>
                    <!-- <template v-else>
                      <span>{{ multi.title || multi.title == '' ? multi.title : '#' }}</span>
                    </template> -->
                    <template v-else>
                      <span v-if="!multi.renderHeader">{{ multi.title || multi.title == '' ? multi.title : '#' }}</span>
                      <render-header v-else :render="multi.renderHeader" :column="multi" :index="index"></render-header>
                    </template>
                  </div>
                </th>
              </tr>
              <tr v-show="!isNotShowCurTh">
                <th v-for="(column, index) in leftFixedColumns"
                  :key="index"
                  v-on:mousedown="mousedown($event,column,index)"
                  v-on:mouseout="mouseout($event,column,index)"
                  v-on:mousemove="mousemove($event,column,index)"
                  :class="alignCls(column,{},'left')"
                  >
                   <!-- <table-cell
                    :column="column"
                    :index = "index"
                    :checked = "isSelectAll"
                    :prefixCls="prefixCls"
                  >
                  </table-cell> -->
                  <!--table-cell  -->
                  <div :class="[prefixCls + '-cell']">
                    <template v-if="column.type === 'selection'">
                      <Checkbox v-if="!column.title" size="large" :value="isSelectAll" @on-change="selectAll"></Checkbox>
                      <span v-else>{{column.title}}</span>
                    </template>
                    <template v-else>
                      <!-- <span>{{ column.title || column.title == '' ? column.title : '#' }}</span>
                      -->
                      <span v-if="!column.renderHeader">{{ column.title || column.title == '' ? column.title : '#' }}</span>
                      <render-header v-else :render="column.renderHeader" :column="column" :index="index"></render-header>
                    </template>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div :class="fixedBodyClass" class="h-simple-view" :style="fixedBodyStyle" ref="fixedBody" @mousewheel="handleFixedMousewheel" @DOMMouseScroll="handleFixedMousewheel">
          <div :class="[prefixCls + '-phantom']" :style="{height: contentHeight + 'px'}">
          </div>
          <div class="h-simple-content" ref="leftContent">
            <table cellspacing="0" cellpadding="0" border="0" :style="tableStyle" ref="tbody">
              <colgroup>
                <col v-for="(column, index) in cloneColumns" :width="setCellWidth(column, index, false)" :key="index">
              </colgroup>
              <tbody :class="[prefixCls + '-tbody']">
                <template v-for="row in visibleData" >
                  <tr :class="groupRowClasses(row)" v-if="row._isGroup" :key="row._rowKey">
                    <td v-show="columns[0].type=='selection'" :class="alignCls(columns[0])">
                      <div :class="prefixCls+'-cell'">
                        <Checkbox :value="rowChecked(row._index)" @on-change="toggleSelect(row._index)"></Checkbox>
                      </div>
                    </td>
                    <td :colspan="columns[0].type=='selection'?columns.length-1:columns.length">
                      <div :class="prefixCls+'-cell-group'" @click="handleToggleExpand(row)">
                        <span :class="groupCls(Boolean(row.expand))">
                          <Icon name="enter"></Icon>
                        </span>
                        <span :class="prefixCls+'-cell-title'">{{row.title}}</span>
                      </div>
                    </td>
                  </tr>
                  <!-- <group-tr v-if="row._isGroup"
                    :key="row._rowKey"
                    :columns="columns"
                    :prefix-cls="prefixCls"
                    :rowTitle = "row"
                    :expanded = "Boolean(row.expand)"
                    :checked = "rowChecked(row._index)">
                  </group-tr> -->
                  <table-tr
                    v-else
                    :row="row"
                    :key="row._rowKey"
                    :prefix-cls="prefixCls"
                    @mouseenter.native.stop="handleMouseIn(row._index)"
                    @mouseleave.native.stop="handleMouseOut(row._index)"
                    @click.native="clickCurrentRowTr($event,row._index)"
                    @dblclick.native.stop="dblclickCurrentRowTr(row._index)"
                  >
                    <td v-for="column in cloneColumns" :class="alignCls(column, row,'left')" :data-index="row._index+1" :key="column._index" @click="handleCellClick($event,row[column.key], row._index, column)">
                      <div :class="classesTd(column)">
                        <template v-if="column.type === 'index'&&!splitIndex">{{row._index+1}}</template>
                        <template v-if="column.type === 'selection'">
                          <Checkbox :size="calcCheckboxSize(column.checkboxSize)" :value="rowChecked(row._index)" @click.native.stop="handleClickTr($event,row._index,rowChecked(row._index))" @on-change="toggleSelect(row._index)" :disabled="rowDisabled(row._index)"></Checkbox>
                        </template>
                        <template v-if="!column.type&&!column.render"><span v-html="row[column.key]"></span></template>
                        <template v-if="column.render">
                          <Cell
                            :row="row"
                            :key="column._columnKey"
                            :column="column"
                            :index="row._index"
                          ></Cell>
                        </template>
                      </div>
                    </td>
                  </table-tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="h-table__column-resize-proxy" ref="resizeProxy" v-show="resizeProxyVisible"> </div>
      <div class="h-table__column-move-proxy h-table-cell" ref="moveProxy" v-show="moveProxyVisible"> </div>
    </div>
    <Spin fix size="large" v-if="loading">
      <slot name="loading">
        <h-icon name="load-c" size=18 class='h-load-loop'></h-icon>
        <div v-html="loadingText"></div>
      </slot>
    </Spin>
  </div>
</template>
<script>

import renderHeader from './header';
import Spin from '../Spin/Spin.vue';
import { oneOf, getStyle, deepCopy, deepCopyEx, getScrollBarSize,findInx,getBarBottomS,hasClass,addClass,removeClass,typeOf,getScrollBarSizeHeight, scrollAnimate,debounceWithImmediate} from '../../util/tools';
import { on, off } from '../../util/dom';
import Locale from '../../mixins/locale';
import Mixin from './mixin';
import Csv from '../../util/csv';
import ExportCsv from '../Table/export-csv.js';
import TableTr from './Table-tr.vue'
import TableCell from './Table-cell.vue'
import Cell from './Cell.vue'
import Checkbox from '../Checkbox/Checkbox.vue';
// import GroupTr from './Group-tr.vue'
const prefixCls = 'h-table';

let rowKey = 1;
let columnKey = 1;

export default {
  name: 'SimpleGroupTable',
  mixins: [ Locale,Mixin],
  components: {Cell,Checkbox,renderHeader,TableTr,Cell,TableCell,
    // GroupTr
  },
  props: {
    data: {
      type: Array,
      default () {
        return [];
      }
    },
    columns: {
      type: Array,
      default () {
        return [];
      }
    },
    size: {
      validator (value) {
        return oneOf(value, ['small', 'large', 'default']);
      }
    },
    width: {
      type: [Number, String]
    },
    height: {
      type: [Number, String],
      default:400,
    },
    stripe: {
      type: Boolean,
      default: false
    },
    border: {
      type: Boolean,
      default: true
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
      default () {
        return '';
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
    canDrag:{
      type:Boolean,
      default:true
    },
    canMove:{
      type:Boolean,
      default:false
    },
    rowSelect:{
      type:Boolean,//多选时是否支持点击行选中
      default:false
    },
    loading: {
      type: Boolean,
      default: false
    },
    headAlgin:{
      validator (value) {
        return oneOf(value, ['left', 'center', 'right']);
      },
      default:null
    },
    bodyAlgin:{
      validator (value) {
        return oneOf(value, ['left', 'center', 'right']);
      },
      default:null
    },
    selectOption:{
      type:Boolean,
      default:false,
    },
    showTitle:{
      type:Boolean,
      default:false,
    },
    itemHeight: {
      type: Number,
      default: 40
    },
    notSort:{
      type:Boolean,
      default:false,
    },
    multiLevel:{
      type:Array,
      default:null
    },
    notAdaptive:{
      type:Boolean,
      default:false,
    },
    defaultFocusIndex: Number,
    scrollTopSet: {
      type: Number,
      default: 0
    },
    toScrollTop: {
      type:Boolean,
      default:false,
    },
    splitIndex:{
      type:Boolean,
      default:false,
    },
    lastColWidth:{
      type:[Number,String],
      default:80,
    },
    cellClick: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      ready: false,
      tableWidth: 0,
      dragWidth: 0,
      initWidth:0,
      columnsWidth: {},
      prefixCls: prefixCls,
      compiledUids: [],
      objData: this.makeObjData(),     // checkbox or highlight-row
      rebuildData: [],    // for sort or filter
      cloneColumns: this.makeColumns(),
      showSlotHeader: true,
      showSlotFooter: true,
      bodyHeight: 0,
      bodyRealHeight: 0,
      scrollBarWidth: getScrollBarSize(),
      scrollBarHeight: getScrollBarSizeHeight(),//横向高度
      currentContext: this.context,
      cloneData: [],    // when Cell has a button to delete row data, clickCurrentRow will throw an error, so clone a data
      resizeProxyVisible: false,
      moveProxyVisible: false,
      showScroll:false,
      headerRealHeight:0,
      visibleCount:50,
      start:0,
      end:50,
      visibleData:[],
      allclick:false,
      buttomNum:null,
      topNum:null,
      shiftSelect:[],
      ctrlSelect:[],
      dragging:false,
      draggingColumn:false,
      moving: false,
      movingColumn: null,
      isScrollX: false, //是否有横向滚动
      focusIndex: -1,
      curPageFirstIndex: 0,
      isFocusSelect: true,
      isCurrent: true,
      privateToScrollTop: false,
      selectType:false,
      cloumnsLeft: [],
      curShiftIndex:null,
      sumMarginLeft: 0,
      // 真实显示数据-rebuildData过滤要隐藏的
      realRebuildData: [],
      hideData: {},
      scrollLeft: 0,
      cellCheckObj: {},
      curCellCheck: [],
      hoverIndex:-1,
      scheduledAnimationFrame: false, // 是否进行动画帧更新visibledata
      animationFrame: null
    }
  },
  computed: {
    groupStyle () {
      // 固定主表的头，padding-left == 滚动条左侧滚动距离-非冻结滚动时也固定
      return {
        paddingLeft: this.scrollLeft + 'px'
      }
    },
    // 跨行显示时，将cur-th隐藏
    isNotShowCurTh () {
      if (!this.multiLevel || this.multiLevel.length==0) return false;
      return this.multiLevel.some((cols,i)=>{
        if (typeOf(cols) != 'array') {
          return cols.rows && Number(cols.rows) > 1
        } else {
          if (cols && cols.length > 0) {
            return cols.some((item,inx)=>{
              return item.rows && Number(item.rows) > 1
            })
          } else {
            return false
          }
        }
      })
    },
    leftMultiLevel () {
      if (!this.multiLevel || this.multiLevel.length==0) return [];
      let data = [];
          data[0]=[];
      this.multiLevel.forEach((cols,i)=>{
        if(typeOf(cols)!='array'){
          if(!cols.hiddenCol&&cols.hiddenCol!='false'){
            data[0].push(cols);
          }
        }else{
          let data2=[]
          cols.forEach((item,inx)=>{
            if(!item.hiddenCol && item.hiddenCol!='false' && item.fixed && item.fixed ==='left'){
              data2.push(item);
            }
          })
          // 防止只有跨行显示时，显示不全
          data2.push({})
          data.push(data2);
        }
      })
      return data.length > 0 ? data: [];
    },
    // 分组主表的合并单元格列数
    groupColpan () {
      if (this.columns && this.columns.length > 0) {
        if (this.columns[0] && this.columns[0].type == 'selection') {
          return this.columns.length - 1
        } else {
          return this.columns.length
        }
      } else {
        return 0
      }

    },
    multiData(){
      if (!this.multiLevel || this.multiLevel.length==0) return [];
      let data = [];
          data[0]=[];
      this.multiLevel.forEach((cols,i)=>{
        if(typeOf(cols)!='array'){
          if(!cols.hiddenCol&&cols.hiddenCol!='false'){
            data[0].push(cols);
          }
        }else{
          let data2=[]
          cols.forEach((item,inx)=>{
            if(!item.hiddenCol&&item.hiddenCol!='false'){
              data2.push(item);
            }
          })
          data.push(data2);
        }
      })
      return data.length>0?data:[];
    },
    isSelectAll () {
      let isSelectAll = true;
      if (!this.visibleData.length || !this.objData[0]) return false;
      for (let i = 0; i < this.visibleData.length; i++) {
        if (!this.objData[this.visibleData[i]._index]._isChecked && !this.objData[this.visibleData[i]._index]._isDisabled) {
          isSelectAll = false;
          break;
        }
      }
      if (isSelectAll&&!this.allclick) {
        this.allclick = false;
        for (let i = 0; i < this.rebuildData.length; i++) {
          if (!this.objData[this.rebuildData[i]._index]._isChecked && !this.objData[this.rebuildData[i]._index]._isDisabled) {
            isSelectAll = false;
            break;
          }
        }
        return isSelectAll;
      }else{
        return isSelectAll;
      }
    },
    loadingText(){
      return this.t('i.table.loadingText');
    },
    localeNoDataText () {
      if (this.noDataText === undefined) {
        return this.t('i.table.noDataText');
      } else {
        return this.noDataText;
      }
    },
    localeNoFilteredDataText () {
      if (this.noFilteredDataText === undefined) {
        return this.t('i.table.noFilteredDataText');
      } else {
        return this.noFilteredDataText;
      }
    },
    wrapClasses () {
      return [
        `${prefixCls}-wrapper`,
        {
          [`${prefixCls}-hide`]: !this.ready,
          [`${prefixCls}-with-header`]: this.showSlotHeader,
          [`${prefixCls}-with-footer`]: this.showSlotFooter
        }
      ];
    },
    classes () {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-${this.size}`]: !!this.size,
          [`${prefixCls}-border`]: this.border,
          [`${prefixCls}-stripe`]: this.stripe,
          [`${prefixCls}-with-fixed-top`]: !!this.height
        }
      ];
    },
    fixedHeaderClasses () {
      return [
        `${prefixCls}-fixed-header`,
        {
          [`${prefixCls}-fixed-header-with-empty`]: !this.rebuildData.length
        }
      ];
    },
    fixedBodyClass () {
      return [
        `${prefixCls}-fixed-body`,
        {
          [`${prefixCls}-fixed-body-shadow`]:this.data.length!=0
        }
      ]
    },
    styles () {
      let style = {};
      // if (this.height) {
      //   let height = Number(this.height)+2
      //   style.height = `${height}px`;
      // }
      if (this.width) style.width = `${this.width}px`;
      return style;
    },
    tableStyle () {
      let style = {};
      if (this.tableWidth !== 0) {
        let width = '';
        if (this.bodyHeight === 0) {
          width = this.tableWidth;
        } else {
          if (this.data.length==0) {
            width = this.tableWidth;
          } else {
            width = this.tableWidth - this.scrollBarWidth;
          }
        }
        style.width = `${width}px`;
      }
      return style;
    },
    headStyles () {//深拷贝
      const style = Object.assign({}, this.tableStyle);
      const width = this.data.length==0?parseInt(this.tableStyle.width):parseInt(this.tableStyle.width)+this.scrollBarWidth;
      style.width = `${width}px`;
      return style;
    },
    fixedTableStyle () {
      let style = {};
      let width = 0;
      this.leftFixedColumns.forEach((col) => {
        if (col.fixed && col.fixed === 'left') width += col._width;
      });
      style.width = `${width}px`;
      return style;
    },
    fixedRightTableStyle () {
      let style = {};
      let width = 0;
      this.rightFixedColumns.forEach((col) => {
        if (col.fixed && col.fixed === 'right') width += col._width;
      });
      if (!!this.height && this.height < this.bodyRealHeight) {
        style.marginRight = `${this.scrollBarWidth}px`;
        this.showScroll = true;
      }else{
        width = width==0?0:width+this.scrollBarWidth;
      }
      style.width = `${width}px`;

      return style;
    },
    fixedRightPatchStyle(){
      let style = {};
      let width = this.scrollBarWidth;
      let height = this.headerRealHeight;
      let top = parseInt(getStyle(this.$refs.title, 'height')) || 0;
      style.width = `${width}px`;
      style.height = `${height}px`;
      style.top = `${top}px`;
      return style;
    },
    bodyStyle () {
      let style = {};
      if (this.bodyHeight !== 0) {
        style.height = `${this.bodyHeight}px`;
      }
      return style;
    },
    fixedBodyStyle () {
      let style = {};
      if (this.bodyHeight !== 0) {
        let height = this.bodyHeight- this.scrollBarHeight;
        if (this.tableWidth < this.initWidth - this.scrollBarWidth) {
          height = this.bodyHeight-1;
        }
        style.height = `${height}px`;
      }
      return style;
    },
    textStyle(){
      let style = {};
      style.width = this.initWidth!=0?this.initWidth+'px':'100%';
      const height = this.bodyHeight;
      style.height = this.height?Number(height-this.scrollBarHeight)+'px':null;
      style.lineHeight = this.height?Number(height-this.scrollBarHeight)+'px':null;
      return style;
    },
    leftFixedColumns () {
        let left = [];
        let other = [];
        this.cloneColumns.forEach((col) => {
            if (col.fixed && col.fixed === 'left') {
                left.push(col);
            } else {
                other.push(col);
            }
        });
        return left.concat(other);
    },
    isLeftFixed () {
      return this.columns.some(col => col.fixed && col.fixed === 'left');
    },
    isRightFixed () {
      return this.columns.some(col => col.fixed && col.fixed === 'right');
    },
    contentHeight() {
      // return this.rebuildData.length * this.itemHeight;
      return this.realRebuildData.length * this.itemHeight
    }
  },
  methods: {
    groupCls (expanded) {
      return [
        `${this.prefixCls}-cell-expand`,
        {
          [`${this.prefixCls}-cell-expand-expanded`]: expanded
        }
      ];
    },
    // group row clsaa
    groupRowClasses (row) {
      let _title = Number(row._index) % 2 == 0 ? false : true
      return {
        [`${this.prefixCls}-title-stripe`]: _title,
        [`${this.prefixCls}-title-expand`]: row.expand
      }
    },
    // 单元格点击
    handleCellClick (event,value, rowIndex, column) {
      if (this.cellClick && column.type != 'index' && column.type != 'selection') {
        if (this.curCellCheck.length > 0 && (this.curCellCheck[0] !== rowIndex || this.curCellCheck[1] !== column.key)) {
          this.cellCheckObj[this.curCellCheck[0]][this.curCellCheck[1]] = false
        }
        this.curCellCheck = [rowIndex, column.key]
        const cellStatus = this.cellCheckObj[rowIndex][column.key]
        this.cellCheckObj[rowIndex][column.key]  = !cellStatus
        // this.$set(this.cellCheckObj[rowIndex], column.key, true)
        // 返回当前单元格的值、横坐标、纵坐标
        this.$emit('on-cell-click', value, rowIndex, column._index, !cellStatus)
      }
    },
    // 固定主表的头，padding-left == 滚动条左侧滚动距离
    handleToggleExpand(row) {
      // 没有子表直接返回
      if (row.childNum && row.childNum === 0) return
      // 展开或者收缩当前主表
      // 获取真正index索引
      let realIndex
      this.realRebuildData.some((item, index) => {
        if (item._rowIndex === row._rowIndex) {
          realIndex = index
          return true
        } else {
          return false
        }
      })
      let curScrollTop = this.$refs.body.scrollTop
      if (this.objData[row._index]._isExpand) {
        // 展开——>收缩
        // 提取子节点
        // this.hideData[row._rowIndex] = this.rebuildData.slice(row._index, row._index + row.childNum)
        // 删除数据
        if (realIndex !== undefined) {
          this.hideData[row._rowIndex] = this.realRebuildData.splice(realIndex + 1, row.childNum)
        }
        // 更新滚动条高度，最后一个主表收起时会空白
        curScrollTop = curScrollTop - this.itemHeight * Number(row.childNum) > 0 ? curScrollTop - this.itemHeight * Number(row.childNum) : 0
      } else {
          this.realRebuildData.splice(realIndex + 1, 0, ...this.hideData[row._rowIndex])
      }
      // 更新可视数据visibleData
      this.updateVisibleData(curScrollTop)
      // 展开或收缩
      this.objData[row._index]._isExpand = !this.objData[row._index]._isExpand
    },
    calcCheckboxSize(size) {
      return size || 'large'
    },
    toggleIsCurrent (val) {
      this.isCurrent = val
    },
    cellClasses (column) {
      return [
        `${this.prefixCls}-cell`,
      ];
    },
    aliCls(item){
      return[
        {
          [`${item.className}`]: item.className,
          [`${this.prefixCls}-column-${item.align}`]: item.align,
        }
      ]
    },
    rowClsName (index) {
      return this.rowClassName(this.data[index], index);
    },
    classesTd (column) {
      return [
        `${this.prefixCls}-cell`,
        {
          [`${this.prefixCls}-cell-ellipsis`]: column.ellipsis && column.ellipsis!='false',
        }
      ];
    },
    rowChecked (_index) {
      if(!this.objData[_index]){
        return false;
      }else{
        return this.objData[_index]._isChecked;
      }
    },
    rowDisabled(_index){
      if(!this.objData[_index]){
        return false;
      }else{
        return this.objData[_index]._isDisabled;
      }
    },
    changeWidth(width,key,lastWidth){
      var that = this;
      var lastInx = this.cloneColumns.length-1;
      var totalWidth=0;
      this.cloneColumns.forEach((col,i)=>{
        if (col.key==key) {
          that.$set(col,"width",width);
          that.$set(col,"_width",width);
        }
        // && !that.notAdaptive
        if (i == lastInx && !that.notAdaptive) {
          that.$set(col,"width",lastWidth);
          that.$set(col,"_width",lastWidth);
        }
        var colWidth = col.width||col._width
        totalWidth = totalWidth+ colWidth;
      });
      if (this.rebuildData.length !=0 && !that.notAdaptive) {
        totalWidth = totalWidth + this.scrollBarWidth;
      }
      this.tableWidth=totalWidth;
      // && !that.notAdaptive
      if (this.tableWidth<this.initWidth && !that.notAdaptive) {
        this.tableWidth = this.initWidth-1;
      }
      this.$nextTick(()=>{
        this.$emit('on-drag', width, key);
      })
    },
    getLeftWidth (){
      this.$nextTick(()=>{
        const columns = this.cloneColumns;
        for (let i = 0; i < columns.length; i++) {
          let leftWidth = 0;
          for (let j = 0; j<i; j++) {
            leftWidth = leftWidth + columns[j]._width;
          }
          this.cloumnsLeft[i] = leftWidth;
        }
      })
    },
    mousedown(event,column,index) {
      if (this.$isServer) return;
      if (!column) return;
      if (!this.canDrag && !this.canMove) return;
      let _this = this;
      if (this.draggingColumn) {
        this.dragging = true;
        this.resizeProxyVisible = true;
        const table = this;
        const tableEl = table.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const columnEl = this.$el.querySelector(`th.h-ui-${column.key}`);
        const columnRect = columnEl.getBoundingClientRect();
        const minLeft = columnRect.left - tableLeft + 30;
        let lastWidth =this.findObj(event,"TR").lastChild.offsetWidth;
        let tableWidth = this.$el.offsetWidth;
        let headWidth = this.tableWidth;
        addClass(columnEl, 'noclick');

        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        };

        const resizeProxy = this.$refs.resizeProxy;
        resizeProxy.style.left = this.dragState.startLeft + 'px';

        document.onselectstart = function() { return false; };
        document.ondragstart = function() { return false; };

        const handleMouseMove = (event) => {
          const deltaLeft = event.clientX - this.dragState.startMouseLeft;
          const proxyLeft = this.dragState.startLeft + deltaLeft;

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px';
        };

        const handleMouseUp = () => {
          if (_this.dragging) {
            const {
              startColumnLeft,
              startLeft
            } = _this.dragState;
            const finalLeft = parseInt(resizeProxy.style.left, 10);
            const columnWidth = finalLeft - startColumnLeft;
            let dragWidth = finalLeft - startLeft;//>0为输入框增大，<0为减小
            if (dragWidth>=0) {
              lastWidth = (lastWidth-dragWidth)>=this.lastColWidth?(lastWidth-dragWidth):this.lastColWidth;
            }else{
              if (headWidth>=tableWidth) {//此时有滚动条
                if (headWidth+dragWidth<=tableWidth) {
                  lastWidth =lastWidth+tableWidth-headWidth-dragWidth-1;
                }
              }else{
                lastWidth = lastWidth-dragWidth;
              }
            }
            if (table.bodyHeight !== 0) {
              lastWidth = lastWidth - getScrollBarSize();
            }
            _this.changeWidth(columnWidth, column.key,lastWidth);

            document.body.style.cursor = '';
            _this.dragging = false;
             _this.draggingColumn = false;
            _this.dragState = {};

            table.resizeProxyVisible = false;
          }

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.onselectstart = null;
          document.ondragstart = null;

          setTimeout(function() {
            removeClass(columnEl, 'noclick');
          }, 0);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }

      if (this.movingColumn) {
        this.moving = true;
        addClass(document.body, 'useSelect');
        this.moveProxyVisible = true;
        let dom = this.findObj(event,'TH').cloneNode(true);
        dom.width = column._width;
        addClass(dom,'move-proxy-th');
        const tableEl = this.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const tableTop = tableEl.getBoundingClientRect().top;
        const columnEl = this.$el.querySelector(`th.h-ui-${column.key}`);
        const columnRect = columnEl.getBoundingClientRect();
        addClass(columnEl, 'noclick');
        this.moveState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.left - tableLeft - 1,
          tableLeft
        };
        const moveProxy = this.$refs.moveProxy;
        const resizeProxy = this.$refs.resizeProxy;
        moveProxy.style.left = this.moveState.startLeft + 'px';
        moveProxy.style.top = event.clientY - tableTop - 20 + 'px';
        moveProxy.appendChild(dom);
        let resizeIndex = Number(index);
        let resizeLeft;
        const handleMouseMove = (event) => {
          this.resizeProxyVisible = true;
          const deltaLeft = event.clientX - _this.moveState.startMouseLeft;
          const moveLeft = _this.moveState.startLeft + deltaLeft;
          if (deltaLeft > 0) {
            let changeRight = _this.cloumnsLeft[index]+deltaLeft;
            changeRight = changeRight+column._width;
            for (let i in _this.cloumnsLeft) {
              if (changeRight >_this.cloumnsLeft[i]+30) resizeIndex = Number(i);
            }
            resizeLeft = _this.$el.querySelectorAll(`th`)[resizeIndex].getBoundingClientRect().right - tableLeft -1;
          }
          if (deltaLeft < 0){
            let changeLeft = _this.cloumnsLeft[index]+deltaLeft;
            for (let i in _this.cloumnsLeft) {
              if (changeLeft >_this.cloumnsLeft[i]-50) resizeIndex = Number(i);
            }
            resizeLeft = _this.$el.querySelectorAll(`th`)[resizeIndex].getBoundingClientRect().left - tableLeft -1;
          }
          moveProxy.style.left = moveLeft + 'px';
          moveProxy.style.top = event.clientY-tableTop-20 + 'px';
          resizeProxy.style.left = resizeLeft + 'px';
        };

        const handleMouseUp = () => {
          if (_this.moving) {
            _this.sortCloumn(index,resizeIndex,column._index);
            document.body.style.cursor = '';
            removeClass(document.body, 'useSelect');
            _this.moving = false;
            _this.movingColumn = null;
            _this.moveState = {};
            moveProxy.removeChild(dom);
            _this.resizeProxyVisible = false;
            _this.moveProxyVisible = false;
          }

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);

          setTimeout(function() {
            removeClass(columnEl, 'noclick');
          }, 0);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },
    mousemove(event,column,index){
      if (!this.canDrag ||!column) return;
      if (this.splitIndex && column.type=='index') return;
      if (column.children && column.children.length > 0) return;
      let target = this.findObj(event,"TH");
      if(this.canDrag){
        // moveDrag需传入event win7下FF60版本不可拖拽
        this.moveDrag(event, target,column);
      }
      if(this.canMove) {
        this.moveMove(event, target,column)
      }
    },
    moveDrag(event, target,column){
      if (!this.dragging) {
        let rect = target.getBoundingClientRect();
        const bodyStyle = document.body.style;
        if (rect.width > 12 && rect.right - event.pageX < 8) {
          bodyStyle.cursor = 'col-resize';
          this.draggingColumn = true;
        } else if (!this.dragging) {
          bodyStyle.cursor = '';
          this.draggingColumn = false;
        }
      }
    },
    moveMove(event, target,column){
      if (!this.moving && !this.dragging) {
        let rect = target.getBoundingClientRect();
        const bodyStyle = document.body.style;
        if (rect.right - event.pageX > 8 && rect.right - event.pageX<rect.width && !column.fixed) {
          bodyStyle.cursor = 'pointer';
          // bodyStyle.userSelect = 'none';
          this.movingColumn = column;
        } else if (!this.moving) {
          if(!this.canDrag) bodyStyle.cursor = '';
          // bodyStyle.userSelect = 'text';
          this.movingColumn = null;
        }
      }
    },
    mouseout() {
      if (this.$isServer) return;
      document.body.style.cursor = '';
    },
    sortCloumn (curIndex,insertIndex,_index){
      if (this.cloneColumns[insertIndex].fixed) return;
      const item = this.cloneColumns[curIndex];
      this.cloneColumns.splice(curIndex,1);
      this.cloneColumns.splice(insertIndex,0,item);
      this.$emit('on-move',_index,insertIndex);
    },
    findObj(e,name){
      var obj=e.target;
      while(obj&&obj.tagName!=name){
        obj=obj.parentElement
      }
      return obj;
    },
    handleResize () {
      this.$nextTick(() => {
        this.$refs.content.style.transform = `translate3d(0, ${this.$refs.body.scrollTop}px, 0)`;
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translate3d(0, ${this.$refs.body.scrollTop}px, 0)`;
        }
        let width = this.$refs.body.getBoundingClientRect().width;
        let conentWidth = this.$refs.body.scrollWidth;
        this.isScrollX = conentWidth + this.scrollBarWidth > width ? true :false
        if(this.cloneColumns.length==0) return;
        const allWidth = !this.columns.some(cell => !cell.width&&cell.width!==0);    // each column set a width
        if (allWidth) {
          this.tableWidth = this.columns.map(cell => cell.width).reduce((a, b) => a + b);
        } else {
          this.tableWidth = parseInt(getStyle(this.$el, 'width')) - 1;
        }
        this.columnsWidth = {};
        this.$nextTick(() => {
          let columnsWidth = {};
          let autoWidthIndex = -1;
          // if (allWidth) autoWidthIndex = this.cloneColumns.findIndex(cell => !cell.width);//todo 这行可能有问题
          if (allWidth) autoWidthIndex = findInx(this.cloneColumns,cell => !cell.width);
          if (this.data.length) {
            const $td = this.$refs.tbody.querySelectorAll('tbody tr')[0].querySelectorAll('td');
            let errorNum = 0
            for (let i = 0; i < $td.length; i++) {    // can not use forEach in Firefox
              const column = this.cloneColumns[i];
              let curWidth = parseFloat(getStyle($td[i], 'width'));
              let width = parseInt(curWidth)
              errorNum = errorNum+ curWidth - width;
              if(errorNum>1){
                width=  width+1;
                errorNum = errorNum -1;
              }
              if (i === autoWidthIndex) {
                width = width - 1;
              }
              if (column.width) {
                  width = column.width||'';
              } else {
                  if (width < 100) width = 100;
              }
              this.cloneColumns[i]._width = width||'';
              this.tableWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b);
              columnsWidth[column._index] = {
                  width: width
              };
            }
            this.columnsWidth = columnsWidth;
          }else{
            const $th = this.$refs.thead.querySelectorAll('thead .cur-th')[0].querySelectorAll('th');
            for (let i = 0; i < $th.length; i++) {    // can not use forEach in Firefox
              const column = this.cloneColumns[i];
              let width = parseInt(getStyle($th[i], 'width'));
              if (i === autoWidthIndex) {
                width = parseInt(getStyle($th[i], 'width')) - 1;
              }
             // 自适应列在表格宽度较小时显示异常，为自适应列设置最小宽度100（拖拽后除外）
              if (column.width) {
                  width = column.width||'';
              } else {
                  if (width < 100) width = 100;
              }
              this.cloneColumns[i]._width = width||'';
              this.tableWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b);
              columnsWidth[column._index] = {
                  width: width
              };
            }
            // this.tableWidth = this.cloneColumns.map(cell => cell._width).reduce((a, b) => a + b);
            this.columnsWidth = columnsWidth;
          }

          // get table real height,for fixed when set height prop,but height < table's height,show scrollBarWidth
          this.bodyRealHeight = parseInt(getStyle(this.$refs.tbody.$el, 'height'))||0;
          this.headerRealHeight = parseInt(getStyle(this.$refs.header, 'height')) || 0;
        });
      });
    },
    getshiftSelect(_index){
      this.curShiftIndex = _index;
      switch(this.shiftSelect.length){
        case 0:
          this.shiftSelect[0]=_index;
          break;
        case 1:
          let min=Math.min(this.shiftSelect[0],_index);
          let max = Math.max(this.shiftSelect[0],_index);
          this.$set(this.shiftSelect,0,min);
          this.$set(this.shiftSelect,1,max);
          break;
        case 2:
          if (_index<this.shiftSelect[0]) this.$set(this.shiftSelect,0,_index);
          if (_index>this.shiftSelect[1]) this.$set(this.shiftSelect,1,_index);
          break;
        default:
          this.shiftSelect=[];
      }
    },
    getctrlSelect(_index){
      let itemIndex = this.ctrlSelect.indexOf(_index)
      if (itemIndex==-1) {
        this.ctrlSelect.push(_index);
        this.objData[_index]._isChecked = true;
      }else{
        this.ctrlSelect.splice(itemIndex,1);
        this.objData[_index]._isHighlight = false;
        this.objData[_index]._isChecked = false;
      }
      this.$nextTick(()=>{
        this.$emit('on-selection-change', this.getSelection(),this.getSelection(true), _index);
      })
    },
    handleClick(){
    },
    handleClickTr (event,rowIndex,status) {
      if (event.shiftKey&&rowIndex) {
        this.getshiftSelect(rowIndex);
      }else if(!status){
        this.shiftSelect=[]
        this.shiftSelect[0] = rowIndex;
      }else{
        this.shiftSelect=[]
      }
    },
    handleMouseIn (_index) {
        if (this.disabledHover) return;
        if (this.objData[_index]._isHover) return;
        // this.objData[_index]._isHover = true;
        this.hoverIndex = _index
    },
    handleMouseOut (_index) {
        if (this.disabledHover) return;
        // this.objData[_index]._isHover = false;
        this.hoverIndex = -1
    },
    highlightCurrentRow (_index) {
        if (!this.highlightRow) return;
        const curStatus = this.objData[_index] && this.objData[_index].hasOwnProperty('_isHighlight') ? this.objData[_index]._isHighlight : false;
        let oldIndex = -1;
        for (let i in this.objData) {
          this.objData[i]._isChecked = false;//单选时取消多选项，估值6.0专用
            if (this.objData[i]._isHighlight && this.objData[_index].hasOwnProperty('_isHighlight')) {
              oldIndex = parseInt(i);
              this.objData[i]._isHighlight = false;//单选是上一项取消选中
            }
        }
        if (curStatus && !this.selectOption) {
          this.objData[_index]._isHighlight = false;
          this.objData[_index]._isChecked = false;
          // this.$emit('on-current-change-cancle',JSON.parse(JSON.stringify(this.cloneData[_index])), oldData);
          this.$nextTick(()=>{
            this.$emit('on-current-change', null,null);
          })
        }else{
          if (this.objData[_index] && this.objData[_index].hasOwnProperty('_isHighlight')) this.objData[_index]._isHighlight = true;
          if (this.objData[_index] && this.objData[_index].hasOwnProperty('_isChecked')) this.objData[_index]._isChecked = true;
          // this.$emit('on-current-change', JSON.parse(JSON.stringify(this.cloneData[_index])), oldData);
          this.$nextTick(()=>{
            if(this.cloneData[_index]) {
              this.$emit('on-current-change', JSON.parse(JSON.stringify(this.cloneData[_index])),_index);
            } else {
              this.$emit('on-current-change', null, null);
            }
          })
        }
        this.$nextTick(()=>{
          this.$emit('on-selection-change',this.getSelection(),this.getSelection(true), _index);
        })
    },
    clickCurrentRowTr (event,_index) {
      if (!this.cellClick) {
        if (!event.shiftKey && !event.ctrlKey || (this.highlightRow&&!this.selectType)) {
          if(this.rowSelect){
            // this.objData[_index]._isChecked=!this.objData[_index]._isChecked;
            this.toggleSelect(_index);
          }else{
            this.clickCurrentRow(_index);
          }
          if (this.objData[_index]._isHighlight) {
            this.shiftSelect = [];
            this.ctrlSelect = [];
            this.shiftSelect[0]=_index
            this.ctrlSelect.push(_index);
          }else{
            this.shiftSelect= [];
            this.ctrlSelect = [];
          }
        }else if(event.shiftKey){
          window.getSelection()?window.getSelection().removeAllRanges():document.selection.empty();
          this.getshiftSelect(_index);
        }else{
          this.getctrlSelect(_index);
        }
      }
    },
    dblclickCurrentRowTr (_index) {
      if (!this.rowSelect) {
        this.dblclickCurrentRow(_index);
      }
    },
    clickCurrentRow (_index) {
      if (!this.rowSelect) {
        this.focusIndex = _index
        this.highlightCurrentRow(_index);
      }
      this.$nextTick(()=>{
        if (this.cloneData[_index]){
          let checkStatus = this.objData[_index]._isHighlight ? true : false
          this.$emit('on-row-click', [JSON.parse(JSON.stringify(this.cloneData[_index])),_index], checkStatus);
        } else {
          this.$emit('on-current-change', null, null);
        }
      })
    },
    dblclickCurrentRow (_index) {
      if (!this.rowSelect) {
        this.focusIndex = _index
        this.highlightCurrentRow(_index);
      }
      this.$nextTick(()=>{
        this.$emit('on-row-dblclick', JSON.parse(JSON.stringify(this.cloneData[_index])));
      })
    },
    getSelection (status=false) {
      let selectionIndexes = [];
      for (let i in this.objData) {
          if (this.objData[i]._isChecked) selectionIndexes.push(parseInt(i));
      }
      // return status?selectionIndexes:JSON.parse(JSON.stringify(this.data.filter((data, index) => selectionIndexes.indexOf(index) > -1)));
      // 考虑addData模式
      return status?selectionIndexes:JSON.parse(JSON.stringify(this.cloneData.filter((data, index) => selectionIndexes.indexOf(index) > -1)));
    },
    toggleSelect (_index) {
      this.allclick = false;
      // let data = {};
      // if (this.objData[_index]) data = Object.assign({}, this.objData[_index])
      // for (let i in this.objData) {
      //   if (parseInt(i) === _index) {
      //     data = this.objData[i];
      //   }
      // }
      if (this.objData[_index]) {
        const status = !this.objData[_index]._isChecked
        this.objData[_index]._isChecked = status;
        if (!status) {
          this.objData[_index]._isHighlight = false;
        }
        if (this.objData[_index] && this.objData[_index].childNum) {
        // 如当前节点是父节点-则联动子节点
          for (let i = 1; i <= this.objData[_index].childNum; i++) {
            this.objData[_index + i]._isChecked = status
            if (!status) {
              this.objData[_index]._isHighlight = false;
            }
          }
        } else if (this.objData[_index] && this.objData[_index]._rowIndex.indexOf('child') >= 0){
          // 子节点联动父节点
          // _rowIndex = child/parent + '_' + 主表或者子表各自的索引
          // 父节点索引=子节点索引-子表中的索引
          let parentIndex = _index - Number(this.objData[_index]._rowIndex.split('_')[1]) - 1
          // if (status) {
          let parentStatus = true
          for (let i = 1; i <= this.objData[parentIndex].childNum; i++) {
            if (!this.objData[parentIndex + i]._isChecked) {
              parentStatus = false
              break
            }
          }
          if (this.objData[parentIndex]._isChecked != parentStatus) this.objData[parentIndex]._isChecked = parentStatus
          // } else {
            // this.objData[parentIndex]._isChecked = false
          // }
        }
      }

      this.$nextTick(()=>{
        const selection = this.getSelection();
        // this.$emit(status ? 'on-select' : 'on-select-cancel', selection, JSON.parse(JSON.stringify(this.data[_index])));
        // 考虑addData模式
        this.$emit(status ? 'on-select' : 'on-select-cancel', selection, JSON.parse(JSON.stringify(this.cloneData[_index])));
        this.$emit('on-selection-change', selection,this.getSelection(true), _index);
      })
    },
    clearAllRow(){
      for (let i in this.objData) {
          if (this.objData[i]._isHighlight) {
            this.objData[i]._isHighlight = false;
          }
      }
    },
    toggleMached(arr){
      for (let i in this.objData) {
        this.objData[i]._isMatched = false;//取消所有匹配项，估值6.0专用
      }
      if (arr.length == 0) return false;
      arr.map(inx=>{this.objData[inx]._isMatched = true;});
    },
    itemSelect(i,status){
      if (!this.rebuildData[i]) return;
      let index = this.rebuildData[i]._index;
      this.objData[index]._isHighlight=false;
      if(!this.objData[index]._isDisabled){
        this.objData[index]._isChecked = status;
      }
    },
    selectAll (status) {
      this.allclick=true;
      for(const data of this.visibleData){
        this.objData[data._index]._isHighlight=false;
        if(this.objData[data._index]._isDisabled){
          continue;
        }else{
          this.objData[data._index]._isChecked = status;
        }
      }
      setTimeout(()=>{
        for(const data of this.rebuildData){
          this.objData[data._index]._isHighlight=false;
          if(this.objData[data._index]._isDisabled){
            continue;
          }else{
           this.objData[data._index]._isChecked = status;
          }
        }
        this.$nextTick(()=>{
          const selection = this.getSelection();
          this.$emit('on-select-all', selection);
          this.$emit('on-selection-change', selection,this.getSelection(true), null);
        })
      }, 0);
    },
    selectRange(){
      for (var i = this.shiftSelect[0]; i <= this.shiftSelect[1]; i++) {
        this.objData[i]._isHighlight=false;
        if(!this.objData[i]._isDisabled){
          this.objData[i]._isChecked = true;
        }
      }
      this.$nextTick(()=>{
        this.$emit('on-selection-change', this.getSelection(),this.getSelection(true), this.curShiftIndex);
      })
    },
    fixedHeader () {
      if (this.height) {
        this.$nextTick(() => {
            const titleHeight = parseInt(getStyle(this.$refs.title, 'height')) || 0;
            if (titleHeight>0) {
              if(this.$refs.leftF)this.$refs.leftF.style.marginTop=titleHeight+'px';
              if(this.$refs.rightF)this.$refs.rightF.style.marginTop=titleHeight+'px';
            }

            // 兼容 columns 异步生成
            const headerHeight = this.headerRealHeight || parseInt(getStyle(this.$refs.header, 'height')) || 0;
            const footerHeight = parseInt(getStyle(this.$refs.footer, 'height')) || 0;
            this.bodyHeight = this.height - titleHeight - headerHeight - footerHeight;
        });
      } else {
        this.bodyHeight = 0;
      }
    },
    handleBodyScroll (event) {
      if (window.requestAnimationFrame) { // 该特性有浏览器限制
        this.updateVisibleAnimate(event)
      } else {
        this.privateToScrollTop = false
        let scrolltop = event.target.scrollTop;
        this.curPageFirstIndex = Math.floor(scrolltop / this.itemHeight)
        this.$refs.header.scrollLeft = event.target.scrollLeft
        this.scrollLeft = this.isLeftFixed ? event.target.scrollLeft : 0
        if (this.isLeftFixed) this.$refs.fixedBody.scrollTop = scrolltop
        this.buttomNum = getBarBottomS(event.target, this.bodyHeight, this.contentHeight,this.scrollBarHeight, this.isScrollX);
        let curtop = Math.floor(scrolltop / this.itemHeight)*this.itemHeight;

        this.updateVisibleDataDebounce(false)(scrolltop)
        this.$refs.content.style.transform = `translate3d(0, ${curtop}px, 0)`;
        if(this.$refs.leftContent){
          this.$refs.leftContent.style.transform = `translate3d(0, ${curtop}px, 0)`;
        }
      }
      // setTimeout(()=>{
      //   this.updateVisibleDataDebounce(false)(scrolltop)
      // },0);
    },
    /**
    * @description 使用requestAnimationFrame根据动画帧更新visibleData，原理同setTimeout，更贴近浏览器重绘原理
    */
    updateVisibleAnimate (event) {
      if (this.scheduledAnimationFrame) { return }
      this.scheduledAnimationFrame = true
      this.animationFrame = window.requestAnimationFrame((num) => {
        this.scheduledAnimationFrame = false
        this.privateToScrollTop = false
        let scrolltop = event.target.scrollTop
        this.curPageFirstIndex = Math.floor(scrolltop / this.itemHeight)
        this.$refs.header.scrollLeft = event.target.scrollLeft
        if (this.isSummation) this.sumMarginLeft = event.target.scrollLeft
        if (this.isLeftFixed) this.$refs.fixedBody.scrollTop = scrolltop
        this.buttomNum = getBarBottomS(
          event.target,
          this.bodyHeight,
          this.contentHeight,
          this.scrollBarHeight,
          this.isScrollX
        )
        let curtop = Math.floor(scrolltop / this.itemHeight) * this.itemHeight
        this.updateVisibleData(scrolltop)
        this.$refs.content.style.transform = `translate3d(0, ${curtop}px, 0)`
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translate3d(0, ${curtop}px, 0)`
        }
      })

    },
    /**
     * @description 防抖更新，滚动时调用，防止滚动卡顿
     */
    updateVisibleDataDebounce(immediate = true) {
      if (!this.updateVisibleDataDebounce.body) this.updateVisibleDataDebounce.body = debounceWithImmediate(this.updateVisibleData, 10, immediate)
      return this.updateVisibleDataDebounce.body
    },
    handleFixedMousewheel(event) {
      let deltaY = event.deltaY;
      if(!deltaY && event.detail){
          deltaY = event.detail * this.itemHeight;
      }
      if(!deltaY && event.wheelDeltaY){
          deltaY = -event.wheelDeltaY;
      }
      if(!deltaY && event.wheelDelta){
          deltaY = -event.wheelDelta;
      }
      if(!deltaY) return;
      const body = this.$refs.body;
      const currentScrollTop = body.scrollTop;
      if (deltaY < 0 && currentScrollTop !== 0) {
          event.preventDefault();
      }
      if (deltaY > 0 && body.scrollHeight - body.clientHeight > currentScrollTop) {
          event.preventDefault();
      }
      //body.scrollTop += deltaY;
      let step = 0;
      let timeId = setInterval(()=>{
          step += this.itemHeight;
          if(deltaY>0){
              body.scrollTop += this.itemHeight;
          }
          else{
              body.scrollTop -= this.itemHeight;
          }
          if(step >= Math.abs(deltaY)){
              clearInterval(timeId);
          }
      }, 1);
    },
    updateVisibleData(scrollTop) {
      scrollTop = scrollTop || (this.$refs.body ? this.$refs.body.scrollTop : 0) || 0
      this.start = Math.floor(scrollTop / this.itemHeight);
      this.end = this.start + this.visibleCount;
      // this.visibleData = this.rebuildData.slice(this.start, this.end);
      this.visibleData = this.realRebuildData.slice(this.start, this.end)
      // let curtop =  this.start*this.itemHeight;
      // this.$refs.content.style.transform = `translate3d(0, ${curtop}px, 0)`;
      // if(this.$refs.leftContent){
      //   this.$refs.leftContent.style.transform = `translate3d(0, ${curtop}px, 0)`;
      // }
    },
    handleMouseWheel (event) {
      const deltaX = event.deltaX;
      const $body = this.$refs.body;
      if (deltaX > 0) {
        $body.scrollLeft = $body.scrollLeft + 10;
      } else {
        $body.scrollLeft = $body.scrollLeft - 10;
      }
    },
    getIndex(_index){
      let index;
      this.cloneColumns.forEach((col,i) => {
        if (col._index == _index) {
          index = i;
        }
      });
      return index;
    },//rightFixed index error
    // 转换数据，仅有一层子节点
    makeData () {
      let i = 0
      let newData = []
      this.hideData = {}
      this.realRebuildData = []
      this.data.forEach((row, index) => {
        let newRow = deepCopyEx(row, ['item'])
        newRow._index = i++
        newRow._rowKey = rowKey++
        // 是否主表
        newRow._isGroup = true
        // 每个子表的序号，主表为第几个主表
        newRow._rowIndex = 'parent_' + index
        // 是否展开
        newRow._isExpand = row.expand || false
        // 子节点数量
        newRow.childNum = row.item && row.item.length > 0 ? row.item.length : 0

        this.realRebuildData.push(newRow)
        newData.push(newRow)
        // 保存隐藏子节点，方便进行切换，而不是全部更新
        let childData = []
        if (!row.expand) this.hideData['parent_' + index] = childData
        if (row.item && row.item.length > 0) {
          row.item.forEach((rowItem, itemIndex) => {
            let newRowItem = deepCopy(rowItem)
            newRowItem._index = i++
            newRowItem._rowKey = rowKey++;
            newRowItem._isGroup = false
            newRowItem._rowIndex = 'child_' + itemIndex
            newRowItem._isExpand = false
            newRowItem.childNum = null
            // if (newRow.expand) {
            //   newRowItem._isShow
            // } else {
            //   newRowItem._isShow = false
            // }
            // newRowItem._isShow = newRow.expand ? true : false
            newData.push(newRowItem)
            childData.push(newRowItem)
            if (newRow.expand) {
              this.realRebuildData.push(newRowItem)
            }

          })
        }
      });
      return newData;
    },
    makeObjData () {
      let data = {}
      let cellObj = {} // 单元格点击状态
      if (this.columns && this.columns.length > 0 && this.cellClick) {
        this.columns.forEach(item => {
          if (item.key) this.$set(cellObj, item.key, false)
        })
      }
      if (this.rebuildData && this.rebuildData.length > 0) {
        let newCellObj = {}
        this.rebuildData.forEach((row, index) => {
          const newRow = deepCopy(row);// todo 直接替换
          newRow._isHover = false;
          if (newRow._disabled) {
              newRow._isDisabled = newRow._disabled;
          } else {
              newRow._isDisabled = false;
          }
          if (newRow._checked) {
              newRow._isChecked = newRow._checked;
          } else {
              newRow._isChecked = false;
          }
          if (newRow._highlight) {
              newRow._isHighlight = newRow._highlight;
          } else {
              newRow._isHighlight = false;
          }
          data[index] = newRow
          if (this.cellClick) newCellObj[index] = JSON.parse(JSON.stringify(cellObj))
        })
        this.cellCheckObj = newCellObj
      }
      return data
    },
    makeColumns () {
      var that = this;
      let columns = deepCopy(this.columns);
      let left = [];
      let right = [];
      let center = [];
      let curType = false;
      columns.forEach((column, index) => {
        if(column.type == 'selection'){
          curType = true;
        }
        column._index = index;
        column._columnKey = columnKey++;
        column._width = column.width ? column.width : '';    // update in handleResize()
        column._sortType = 'normal';
        column._filterVisible = false;
        column._isFiltered = false;
        column._filterChecked = [];

        if ('filterMultiple' in column) {
            column._filterMultiple = column.filterMultiple;
        } else {
            column._filterMultiple = true;
        }
        if ('filteredValue' in column) {
            column._filterChecked = column.filteredValue;
            column._isFiltered = true;
        }
        if (!column.hiddenCol || column.hiddenCol=='false') {
          if (column.fixed && column.fixed === 'left') {
              left.push(column);
          } else if (column.fixed && column.fixed === 'right') {
              right.push(column);
          } else {
              center.push(column);
          }
        }
      });
      this.$nextTick(()=>{
        this.selectType = curType;
      })
      return left.concat(center).concat(right);
    },
    initResize(){
      this.$nextTick(() => {
        this.initWidth =parseInt(getStyle(this.$refs.tableWrap, 'width')) || 0;
      });
    },
    exportCsv (params={}) {
      if (params.filename) {
        if (params.filename.indexOf('.csv') === -1) {
            params.filename += params.format?'.'+params.format:'.csv';
        }
      } else {
        params.filename = params.format?'simpleTable.'+params.format:'simpleTable.csv';
      }
      let columns = [];
      let datas = [];
      if (params.columns && params.data) {
          columns = params.columns;
          datas = params.data;
      } else {
          columns = this.columns;
          if (!('original' in params)) params.original = true;
          datas = params.original ? this.data : this.rebuildData;
      }
      let noHeader = false;
      if ('noHeader' in params) noHeader = params.noHeader;
      const data = Csv(columns, datas, params, noHeader);
      ExportCsv.download(params.filename, data,params.format);
    },
    handleKeydown (e) {
      if (this.isCurrent) {
        const keyCode = e.keyCode;
        // next
        if (keyCode === 40) {
          e.preventDefault();
          e.stopPropagation();
          this.navigateOptions('next');
        }
        // prev
        if (keyCode === 38) {
          e.preventDefault();
          e.stopPropagation();
          this.navigateOptions('prev');
        }
        // end
        if (keyCode == 35) {

        }
        // home
        if (keyCode == 36) {

        }
      }
    },
    navigateOptions (direction) {
      if (this.isFocusSelect && this.objData[this.focusIndex]) {
        if (this.objData[this.focusIndex].hasOwnProperty('_isChecked')) this.objData[this.focusIndex]._isChecked = false
        if (this.objData[this.focusIndex].hasOwnProperty('_isHighlight')) this.objData[this.focusIndex]._isHighlight = false;
        this.isFocusSelect = false
      }
      let curTop = this.$refs.body.scrollTop ? this.$refs.body.scrollTop : 0;
      let contentHeight = this.$refs.body.clientHeight
      // curPageFirstIndex当前屏第一条数据
      let top = this.itemHeight * this.focusIndex;
      // let curPageCount = this.isScrollX ? this.visibleCount - 1 : this.visibleCount
      let curPageCount = this.isScrollX ? this.visibleCount - 2 : this.visibleCount - 1
      // 焦点在当前屏，则进行+1或者-1
      if (this.focusIndex >= this.curPageFirstIndex && this.focusIndex <= this.curPageFirstIndex + curPageCount) {
        if (direction === 'next') {
          // if (this.focusIndex == this.data.length - 1) return
          if (this.focusIndex == this.rebuildData.length - 1) return
          this.focusIndex = this.focusIndex + 1;
        } else if (direction === 'prev') {
          if (this.focusIndex == 0) return
          this.focusIndex = this.focusIndex - 1;
        }
        // +1或者-1后判断是否在当前屏，判断是否需要滚动
        if (this.focusIndex > this.curPageFirstIndex && this.focusIndex < this.curPageFirstIndex + curPageCount) {
          top = this.focusIndex == 0 ? 0 : curTop
        }  else {
          if (direction === 'next') {
            // 向下滚动
            top = this.itemHeight * (this.focusIndex - curPageCount + 1);
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
      if (curTop != top) {
        this.updateVisibleData(top)
        this.$refs.body.scrollTop = top
        this.$refs.content.style.transform = `translate3d(0, ${top}px, 0)`;
        if (this.$refs.leftContent) {
          this.$refs.leftContent.style.transform = `translate3d(0, ${top}px, 0)`;
        }
      }
    },
    handleKeyup (e) {
      if (this.isCurrent) {
        this.isFocusSelect = true
        if (e.keyCode === 40 || e.keyCode === 38) {
          e.preventDefault();
          e.stopPropagation();
          this.highlightCurrentRow(this.focusIndex)
        }
      }
    }
  },
  created () {
      if (!this.context) this.currentContext = this.$parent;
      this.showSlotHeader = this.$slots.header !== undefined;
      this.showSlotFooter = this.$slots.footer !== undefined;
      // this.rebuildData = this.makeData();
  },
  mounted () {
    this.handleResize();
    this.fixedHeader();
    this.getLeftWidth();
    on(document,'keydown', this.handleKeydown);
    on(document,'keyup', this.handleKeyup);
    this.$nextTick(() => {
      this.ready = true;
      this.initWidth =parseInt(getStyle(this.$refs.tableWrap, 'width')) || 0;
      this.visibleCount = Math.ceil(this.height / this.itemHeight) - (this.showHeader ? 0 : -1);
      this.updateVisibleData();
      // this.focusIndex = this.defaultFocusIndex
    });
    //window.addEventListener('resize', this.handleResize, false);
    on(window, 'resize', this.handleResize);
    on(window, 'resize', this.initResize);
    on(window, 'resize', this.getLeftWidth);
    this.$on('on-visible-change', (val) => {
      if (val) {
        this.handleResize();
        this.fixedHeader();
        this.getLeftWidth();
      }
    });
  },
  beforeDestroy () {
      //window.removeEventListener('resize', this.handleResize, false);
      off(window, 'resize', this.handleResize);
      off(window, 'resize', this.initResize);
      off(window, 'resize', this.getLeftWidth);
      off(document,'keydown',this.handleKeydown)
      off(document,'keyup', this.handleKeyup);
      window.cancelAnimationFrame(this.animationFrame)

  },
  watch: {
      // rebuildData: {
      //   handler () {
      //     this.realRebuildData = this.rebuildData.filter(item => {
      //       return item._isShow
      //     })
      //   },
      //   deep: true
      // },
      toScrollTop () {
        this.privateToScrollTop = this.toScrollTop
      },
      privateToScrollTop (val) {
        if (val) {
          this.$refs.body.scrollTop = this.scrollTopSet
          this.$nextTick(() => {
            this.clickCurrentRow(0)
          })
        }
      },
      data: {
        handler () {
          // const oldDataLen = this.rebuildData.length;
          this.rebuildData = this.makeData();
          // this.initCellClickStatus()
          this.objData = this.makeObjData();
          this.updateVisibleData(0);
          this.handleResize();
          // here will trigger before clickCurrentRow, so use async
          this.$nextTick(()=>{
            this.cloneData = deepCopy(this.rebuildData);
          })
        },
        deep: true,
        immediate: true
      },
      columns: {
        handler () {
          // this.initCellClickStatus()
          // todo 这里有性能问题，可能是左右固定计算属性影响的
          this.cloneColumns = this.makeColumns();
          // this.rebuildData = this.makeData();
          this.handleResize();
          this.buttomNum = null;
          this.topNum = null;
          this.$nextTick(()=>{
            this.updateVisibleData();
          });
        },
        deep: true
      },
      cloneColumns: {
        deep: true,
        handler() {
          this.getLeftWidth();
        }
      },
      height () {
          this.fixedHeader();
          this.$nextTick(()=>{
            this.visibleCount = Math.ceil(this.height / this.itemHeight) - (this.showHeader ? 0 : -1);
            this.updateVisibleData();
          });
      },
      buttomNum(val,oldvalue){
        if(val==null || oldvalue == null) return;
        this.$nextTick(()=>{
          this.$emit('on-scroll',this.buttomNum);
        })
      },
      shiftSelect(val){
        if (val.length==2) {
          this.selectRange();
        }
      },
      defaultFocusIndex (val) {
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
      this.$refs.body.scrollTop = transform.match(/translate3d\(\d+px,\s*(\d+)px,\s*(\d+)px\)/i)[1];
      this.handleResize();
      on(window, 'resize', this.handleResize);
    }
    this.keepAliveFlag = true
  },
  deactivated() {
    if (this.keepAliveFlag) {
      off(window, 'resize', this.handleResize);
    }
  },
};
</script>
