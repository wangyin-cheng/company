<template>
  <div :class="classes" ref="cell" :title="titleText">
    <template v-if="(renderType === 'index' && sum && columnIdx == 0 || renderType === 'selection' && sum && columnIdx == 0)">汇总</template>
    <template v-else-if="(renderType === 'index' && sum && columnIdx != 0 || renderType === 'selection' && sum && columnIdx != 0)"></template>
    <template v-else-if="renderType === 'index'">{{naturalIndex + 1}}</template>
    <template v-else-if="renderType === 'radio'">
      <Radio :value="highlight" style="marginRight:-8px"  @click.native.stop="handleClick" @input="clickCurrentRow"></Radio>
    </template>
    <template v-else-if="renderType === 'selection'">
      <Checkbox :size="checkboxSize" :value="checked" @click.native.stop="handleClick" @on-change="toggleSelect" :disabled="disabled"></Checkbox>
      <!--<input type="checkbox" v-model="tChecked" @click.native.stop="handleClick" @change="toggleSelect" :disabled="disabled"> -->
    </template>
    <template v-else-if="renderType === 'drag'">
      <h-icon name="arrow-move" size="18" data-drag="true" draggable="true" @dragstart.native="dragStart($event, row._index)"></h-icon>
    </template>
    <template v-if="renderType === 'html'" >
      <span v-html="row[column.key]"></span>
    </template>
    <template v-if="renderType === 'normal'" >
      <span v-text="row[column.key]"></span>
    </template>
    <template v-if="renderType === 'text'" >
      <span>{{row[column.key]}}</span>
    </template>
    <template v-if="renderType === 'expand' && !row._disableExpand">
      <div :class="expandCls" @click.stop="toggleExpand">
        <Icon name="enter"></Icon>
      </div>
    </template>
    <Cell
      v-if="renderType === 'render'"
      :row="row"
      :column="column"
      :index="index"
      :sum="sum"
      :render="column.render"></Cell>
  </div>
</template>
<script>
import Cell from './expand';
import Icon from '../Icon/Icon.vue';
import Checkbox from '../Checkbox/Checkbox.vue';
import Radio from '../Radio/Radio.vue';
import {addClass,removeClass} from '../../util/tools.js'

export default {
  name: 'TableCell',
  components: { Icon, Checkbox, Cell },
  props: {
    prefixCls: String,
    row: Object,
    column: Object,
    naturalIndex: Number,    // index of rebuildData
    index: Number,           // _index of data
    checked: Boolean,
    highlight: Boolean,
    disabled: Boolean,
    expanded: Boolean,
    fixed: {
      type: [Boolean, String],
      default: false
    },
    showTitle:Boolean,
    sum: Boolean,
    columnIdx: Number
  },
  data () {
    return {
      renderType: '',
      uid: -1,
      context: this.$parent.$parent.$parent.currentContext,
      titleText:null,
      tChecked:this.checked,
    };
  },
  computed: {
    classes () {
      return [
        `${this.prefixCls}-cell`,
        {
          [`${this.prefixCls}-hidden`]: !this.sum&&(!this.fixed && this.column.fixed && (this.column.fixed === 'left' || this.column.fixed === 'right')),
          [`${this.prefixCls}-cell-ellipsis`]: this.column.ellipsis&&this.column.ellipsis!='false',
          [`${this.prefixCls}-cell-with-expand`]: this.renderType === 'expand',
          [`${this.prefixCls}-cell-with-drag`]: this.renderType === 'drag'
        }
      ];
    },
    expandCls () {
      return [
        `${this.prefixCls}-cell-expand`,
        {
          [`${this.prefixCls}-cell-expand-expanded`]: this.expanded
        }
      ];
    },
    checkboxSize() {
      return this.column.checkboxSize ? this.column.checkboxSize : 'large'
    }
  },
  methods: {
      dragStart(event, index) {
        const dataTransfer = event.dataTransfer;
        dataTransfer.effectAllowed = "move";
        dataTransfer.setData("text", "" + index);
        this.$parent.table.dragEl = event.currentTarget;
      },
      toggleSelect (status,event) {
        this.$parent.$parent.$parent.toggleSelect(this.index,event,this.naturalIndex);
        this.$parent.$parent.$parent.clickCurrentBtn(this.index)
      },
      clickCurrentRow () {
        this.$parent.$parent.$parent.highlightCurrentRow(this.index);
        this.$parent.$parent.$parent.clickCurrentBtn(this.index)

      },
      toggleExpand () {
        this.$parent.$parent.$parent.toggleExpand(this.index);
      },
      handleClick () {
          // 放置 Checkbox 冒泡
      },
      addBg(){
        if (this.checked) {
          addClass(this.$parent,`${this.prefixCls}-row-hover`)
        }else{
          removeClass(this.$parent,`${this.prefixCls}-row-hover`)
        }
      }
  },
  created () {
    if (this.column.type === 'index') {
        this.renderType = 'index';
    } else if (this.column.type === 'selection') {
        this.renderType = 'selection';
    } else if (this.column.type === 'radio') {
        this.renderType = 'radio';
    } else if (this.column.type === 'expand') {
        this.renderType = 'expand';
    } else if (this.column.render) {
        this.renderType = 'render';
    } else if(this.column.type === 'text'){
        this.renderType = 'text';
    }else if(this.column.type === 'drag'){
        this.renderType = 'drag';
    }else if(this.column.type === 'html'){
      this.renderType = 'html'
    }else {
      this.renderType = 'normal';
    }
  },
  mounted(){
    if (this.showTitle && this.column.ellipsis&&this.column.ellipsis!="false") {
      this.titleText = this.row[this.column.key];
    }else{
      this.titleText = null;
    }
  },
  watch:{
    checked(val){
      this.tChecked=val;
    }
  }
};
</script>
