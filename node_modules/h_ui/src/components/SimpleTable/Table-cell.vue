<template>
  <div :class="cellClasses" :style="minWidthStyle(column)">
    <template v-if="column.type === 'selection'">
      <Checkbox v-if="!column.title" :size="checkboxSize" @mousedown.native.stop="handleClick" :value="checked" @on-change="selectAll"></Checkbox>
      <span v-else :class="ellipsisClass(column, titleEllipsis)" :style="ellipsisStyle(column)" :title="column.showTitle?column.title:null">{{column.title}}</span>
    </template>
    <template v-else>
      <span v-if="!column.renderHeader" :class="ellipsisClass(column, titleEllipsis)" :style="ellipsisStyle(column)" :title="column.showTitle?column.title:null">{{ column.title || '#' }}</span>
      <render-header v-else :render="column.renderHeader" :column="column" :index="index"></render-header>
    </template>
    <span :class="sortCellCls" v-if="column.sortable&&!useNewSort&&column.type!=='selection'">
      <Icon name="android-arrow-dropup" :class="{on: column._sortType === 'asc'}" @on-click="handleSort(index, 'asc')" @mousedown.native.stop="handleClick"></Icon>
      <Icon name="android-arrow-dropdo" :class="{on: column._sortType === 'desc'}" @on-click="handleSort(index, 'desc')" @mousedown.native.stop="handleClick"></Icon>
    </span>
    <div v-if="column.sortable&&useNewSort"  :class="newsortWrapClass" @click="handleSortByHead(index)">
      <span :class="[prefixCls + '-sortnew']" >
        <Icon name="android-arrow-dropup" :class="{on: column._sortType === 'asc'}"  ></Icon>
        <Icon name="android-arrow-dropdo" :class="{on: column._sortType === 'desc'}" ></Icon>
      </span>
    </div>
    <Poptip
      v-if="isPopperShow(column)"
      v-model="column._filterVisible"
      placement="bottom"
      @on-popper-hide="handleFilterHide(index)">
      <span :class="[prefixCls + '-filter']">
        <Icon name="keyboard" @mousedown.native.stop="handleClick" :class="{on: column._isFiltered}"></Icon>
      </span>
      <render-header slot="content" v-if="column.renderFilter" :render="column.renderFilter" :column="column" :index="index"></render-header>
      <div slot="content" :class="[prefixCls + '-filter-list']" v-else-if="column._filterMultiple" @mousedown.native.stop="handleClick">
        <div :class="[prefixCls + '-filter-list-item']">
          <checkbox-group v-model="column._filterChecked">
            <checkbox v-for="(item,i) in column.filters" :key="column._columnKey+i" :label="item.value">{{ item.label }}</checkbox>
          </checkbox-group>
        </div>
        <div :class="[prefixCls + '-filter-footer']">
          <h-button type="text" size="small" :disabled="!column._filterChecked.length" @click.native="handleFilter(index)">{{ t('i.table.confirmFilter') }}</h-button>
          <h-button type="text" size="small" @click.native="handleReset(index)">{{ t('i.table.resetFilter') }}</h-button>
        </div>
      </div>
      <div slot="content" :class="[prefixCls + '-filter-list']" v-else @mousedown.native.stop="handleClick">
        <ul :class="[prefixCls + '-filter-list-single']">
          <li
            :class="itemAllClasses(column)"
            @click="handleReset(index)">{{ t('i.table.clearFilter') }}</li>
          <li
            :class="itemClasses(column, item)"
            v-for="item in column.filters"
            :key = "item.value"
            @click="handleSelect(index, item.value)">{{ item.label }}</li>
        </ul>
      </div>
    </Poptip>
  </div>
</template>
<script>
import renderHeader from './header'
import Icon from '../Icon/Icon.vue'
import CheckboxGroup from '../Checkbox/CheckboxGroup.vue';
import Checkbox from '../Checkbox/Checkbox.vue';
import Poptip from '../Poptip/Poptip.vue';
import hButton from '../Button/Button.vue';
import Locale from '../../mixins/locale';
import { getScrollBarSize } from '../../util/tools'
export default {
  name: 'TableCell',
  props: {
    column:Object,
    index:[Number,String],
    checked:Boolean,
    prefixCls:String,
    titleEllipsis:Boolean,
     // 是否进行过滤，无限滚动加载数据的场景不适用， 仅支持通过simpleTable显式分页的场景
    isFilter: {
      type: Boolean,
      default: false
    },
    fixed: [Boolean, String]
  },
  // components:{renderHeader},
  mixins: [Locale ],
  components: {CheckboxGroup, Checkbox, Poptip, hButton, renderHeader,Icon},
  computed: {
    sortCellCls() {
      // o45 排序图标右浮动
      return [
        {
          [`${this.prefixCls}-sortSimp`] : window.isO45,
          [`${this.prefixCls}-sort`]: !window.isO45
        },
      ]
    },
    objData() {
      return this.$parent.objData
    },
    cellClasses(){
      return [
        `${this.prefixCls}-cell`,
      ]
    },
    useNewSort(){
      return this.$parent.newSort
    },
    newsortWrapClass(){
      return [
        `${this.prefixCls}-newsort-wrap`,
      ]
    },
    checkboxSize() {
      return this.column.checkboxSize ? this.column.checkboxSize : 'large'
    }
  },
  methods: {
    // 过滤列表样式
    itemClasses (column, item) {
      return [
        `${this.prefixCls}-filter-select-item`,
        {
          [`${this.prefixCls}-filter-select-item-selected`]: column  && column._filterChecked && column._filterChecked[0] === item.value
        }
      ];
    },
    itemAllClasses (column) {
      return [
        `${this.prefixCls}-filter-select-item`,
        {
          [`${this.prefixCls}-filter-select-item-selected`]:  column && column._filterChecked && !column._filterChecked.length
        }
      ];
    },
    minWidthStyle(column) {
      let style = {}
      if(column.width === 60) {
        style.paddingLeft = 8 + 'px'
        style.paddingRight = 8 + 'px'
      }
      return style
    },
    ellipsisStyle(column) {
      let style = {}
      let width = 0
      if(column._width && this.titleEllipsis && window.isO45) {
        style.display = 'inline-block'
        if(column.sortable) {
          width = column._width - 36 <= 24 ? 24 : column._width - 36
        }else {
          width = column._width - 16 <= 24 ? 24 : column._width - 16
        }
        // o45最后一列不设置width
        if(column.width === undefined ) {
          width = width - getScrollBarSize()
        }
        // if(window.isO45) {
        // }else {
        //   if(column.sortable) {
        //     width = column._width - 50 <= 24 ? 24 : column._width - 50
        //   }else {
        //     width = column._width - 30 <= 24 ? 24 : column._width - 30
        //   }
        // }
        style.width = `${width}px`
      }
      return style
    },
    ellipsisClass(column, titleEllipsis){
      return {
        [`${this.prefixCls}-cell-ellipsis`]: titleEllipsis && titleEllipsis != 'false'
      }
    },
    handleClick(event){
      event.stopPropagation();
    },
    selectAll(status){
      this.$parent.selectAll(status)
    },
    handleSort(index,type){
      this.$parent.handleSort(index,type)
    },
    handleSortByHead(index){
      this.$parent.handleSortByHead(index)
    },
    /*
     * 是否显示过滤pop
    */
    isPopperShow (column) {
      return this.isFilter && column.filters && ((!this.fixed && !column.fixed) || (this.fixed === 'left' && column.fixed === 'left') || (this.fixed === 'right' && column.fixed === 'right'));
    },
    // 隐藏过滤输入
    handleFilterHide (index) {
      this.$parent.handleFilterHide(index);
    },
    handleFilter (index) {
      this.$parent.handleFilter(index);
    },
    handleSelect (index, value) {
      this.$parent.handleFilterSelect(index, value);
    },
    handleReset (index) {
      this.$parent.handleFilterReset(index);
    },
  },
}
</script>
