<template>
  <div :class="classes" ref="cell">
    <div :class="cellClass">
      <template v-if="showSlot"><slot></slot></template>
      <template v-if="renderType === 'index'">
        <span>{{Number(index)+1}}</span>
      </template>
      <template v-if="renderType === 'normal'">
        <span v-html="row[column.key]"></span>
      </template>
    </div>
    <Cell
      v-if="column.render&&renderType != 'expand'"
      :row="row"
      :column="column"
      :index="index"
      :render="column.render"></Cell>
  </div>
</template>
<script>
import Cell from './expand';
import Icon from '../Icon/Icon.vue';
import Checkbox from '../Checkbox/Checkbox.vue';
import {addClass,removeClass,findComponentsUpward,deepCopy,getYMD,getHMS,typeOf} from '../../util/tools.js'

export default {
  name: 'GirdCell',
  components: { Icon, Checkbox, Cell},
  props: {
    prefixCls: String,
    row: Object,
    column: Object,
    parent:Object,
    naturalIndex: Number,    // index of rebuildData
    columnIndex:Number,
    index: Number,           // _index of data
    checked: Boolean,
    disabled: Boolean,
    expanded: Boolean,
    showEditInput: Boolean,
    // typeName:String,
    option:Array,
    treeOption:Array,
  },
  data () {
    return {
      renderType: '',
      uid: -1,
      context: this.parent.currentContext,
      showSlot:true,
    };
  },
  computed: {
    classes () {
      return [
        `${this.prefixCls}-cell`,
        {
          [`${this.prefixCls}-cell-ellipsis`]: this.column.ellipsis || false,
          // [`${this.prefixCls}-cell-with-render`]: this.render&&this.renderType != 'expand',
        }
      ];
    },
    cellClass (){
      return{
        [`${this.prefixCls}-cell-ellipsis`]: this.column.ellipsis || false,
      }
    },
    expandCls () {
      return [
        `${this.prefixCls}-cell-expand`,
        {
          [`${this.prefixCls}-cell-expand-expanded`]: this.expanded
        }
      ];
    },
  },
  methods: {
    toggleSelect () {
      this.parent.toggleSelect(this.index);
    },
    toggleExpand (e) {
      this.parent.toggleExpand(this.index,e);
    },
    handleClick () {
        // 放置 Checkbox 冒泡
    },
    // addBg(){
    //   if (this.checked) {
    //     addClass(this.$parent,`${this.prefixCls}-row-hover`)
    //   }else{
    //     removeClass(this.$parent,`${this.prefixCls}-row-hover`)
    //   }
    // },
  },
  watch: {
  },
  created () {
    // this.render = this.column.render?true:false;
  },
  mounted(){
    this.$nextTick(()=>{
      if(!this.column.type ||this.column.type === 'html'){
        this.renderType = 'normal';
      } else {
        this.renderType = this.column.type;
      }
    })
    // if (!this.column.type ||this.column.type === 'html') {
    //   this.renderType = 'normal';
    // } else {
    //   if (!this.showEditInput&&this.column.type!='index'&&this.column.type!='selection'&&this.column.type!='expand') {
    //     this.renderType = 'normal';
    //   }else{
    //     this.renderType = this.column.type;
    //   }
    // }
  },
};
</script>
