<template>
  <table cellspacing="0" cellpadding="0" border="0" :style="styles">
  <!-- 签用于对表格中的列进行组合，以便对其进行格式化。 -->
    <colgroup>
      <col v-for="(column, index) in columns" :width="setCellWidth(column, index, true)" :key="index">
    </colgroup>
    <thead>
      <tr v-if="multiLevel" v-for="(colItem,inx) in multiData" :key="inx">
        <th v-for="(multi, index) in colItem" :colspan="multi.cols||1" :rowspan="multi.rows||1" :key="index" :class="aliCls(multi)">
          <div :class="[prefixCls+'-cell']"><span>{{multi.title}}</span></div>
        </th>
      </tr>
      <tr>
        <th v-for="(column, index) in columns"
          v-on:mousedown="mousedown($event,column,index)" 
          v-on:mouseout="mouseout($event,column,index)" 
          v-on:mousemove="mousemove($event,column,index)"
          :key="index"
          :class="alignCls(column)" 
          >
          <div :class="cellClasses(column)">
            <Checkbox :value="isSelectAll" v-if="headSelection&&!index" @on-change="selectAll" class="asyc-check"></Checkbox>
            <template>
              <span v-if="!column.renderHeader" @click="handleSortByHead(index)">{{ column.title || '#' }}</span>
              <render-header v-else :render="column.renderHeader" :column="column" :index="index"></render-header>
            </template>
          </div>
        </th>
      </tr>
    </thead>
  </table>
</template>
<script>
import Icon from '../Icon/Icon.vue'
import CheckboxGroup from '../Checkbox/CheckboxGroup.vue';
import Checkbox from '../Checkbox/Checkbox.vue';
import hButton from '../Button/Button.vue';
import renderHeader from './header';
import { on, off } from '../../util/dom';
import {getScrollBarSize,hasClass,addClass,removeClass} from '../../util/tools';
import Mixin from './mixin';
import Locale from '../../mixins/locale';

export default {
  name: 'TableHead',
  mixins: [ Mixin, Locale ],
  components: {CheckboxGroup, Checkbox,hButton, renderHeader,Icon},
  props: {
    prefixCls: String,
    styleObject: Object,
    columns: Array,
    objData: Object,
    data: Array,    // rebuildData for sort or filter
    columnsWidth: Object,
    headSelection: Boolean,
    canDrag:Boolean,
    multiLevel:Array,
    lastColWidth:[Number,String]
  },
  data(){
    return{
      draggingColumn: null,
      dragging: false,
      dragState: {},
      multiData:null,
    }
  },
  computed: {
    styles () {//深拷贝
      const style = Object.assign({}, this.styleObject);
      // 考虑所有都有宽度，总列宽小于屏幕宽度时，不可加scrollBarWidth
      const width = this.$parent.bodyHeight === 0 ? parseInt(this.styleObject.width) : parseInt(this.styleObject.width) < this.$parent.$el.clientWidth ?parseInt(this.styleObject.width) : parseInt(this.styleObject.width) + this.$parent.scrollBarWidth;
      // const width = this.$parent.bodyHeight === 0 ? parseInt(this.styleObject.width) : parseInt(this.styleObject.width) + this.$parent.scrollBarWidth;
      style.width = `${width}px`;
      return style;
    },
    isSelectAll () {
      let isSelectAll = true;
      if (!this.data.length) isSelectAll = false;
      for (let i = 0; i < this.data.length; i++) {
        if (!this.objData[this.data[i]._index]._isChecked && !this.objData[this.data[i]._index]._isDisabled) {
          isSelectAll = false;
          break;
        }
      }
      return isSelectAll;
    },
  },
  mounted(){
    this.multiData = this.multiLevel;
  },
  watch:{
    multiLevel(val){
      this.multiData = this.multiLevel;
    }
  },
  methods: {
    cellClasses (column) {
      return [
        `${this.prefixCls}-cell`,
      ];
    },
    selectAll (status) {
      this.$parent.selectAll(status);
    },
    handleSortByHead (index) {
    },
    mousedown(event,column,index){
      if (this.$isServer || !this.canDrag || !this.draggingColumn) return;
      if (!column) return;
      let _this = this;
        this.dragging = true;      
        this.$parent.resizeProxyVisible = true;
        const table = this.$parent; 
        const tableEl = table.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const columnEl = this.$el.querySelector(`th.h-ui-${column.key}`);
        const columnRect = columnEl.getBoundingClientRect();
        const minLeft = columnRect.left - tableLeft + 30;
        let lastWidth =this.findObj(event,"TR").lastChild.offsetWidth;
        let tableWidth = this.$el.parentElement.offsetWidth;
        let headWidth = this.$el.offsetWidth;
        addClass(columnEl, 'noclick');
        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        };

        const resizeProxy = table.$refs.resizeProxy;
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
            table.changeWidth(columnWidth, column.key,lastWidth)
            // _this.changeWidth(columnWidth, column.key,lastWidth);

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
    },
    mousemove(event,column,index){
      if (!this.canDrag) return;
      if (!column ) return;
      if (column.children && column.children.length > 0) return;
      let target = this.findObj(event,"TH");
      if(this.canDrag){
        // moveDrag需传入event win7下FF60版本不可拖拽
        this.moveDrag(event, target,column);
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
    findObj(e,name){
      var obj=e.target;
      while(obj&&obj.tagName!=name){
        obj=obj.parentElement
      }
      return obj;      
    },
    mouseout() {
      if (this.$isServer) return;
      document.body.style.cursor = '';
    },
    aliCls(item){
      return[
        { 
          [`${item.className}`]: item.className,
          [`${this.prefixCls}-column-${item.align}`]: item.align,
        }
      ]
    },
  }
};
</script>
