<template>
  <div :class="cellClasses">
    <template v-if="column.type === 'selection'">
      <Checkbox v-if="!column.title" :size="checkboxSize" @mousedown.native.stop="handleClick" :value="checked" @on-change="selectAll"></Checkbox>
      <span v-else>{{column.title}}</span>
    </template>
    <template v-else>
      <span v-if="!column.renderHeader">{{ column.title || column.title == '' ? column.title : '#' }}</span>
      <render-header v-else :render="column.renderHeader" :column="column" :index="index"></render-header>
    </template>
    <span :class="[prefixCls + '-sort']" v-if="column.sortable">
      <Icon name="android-arrow-dropup" :class="{on: column._sortType === 'asc'}" @on-click="handleSort(index, 'asc')" @mousedown.native.stop="handleClick"></Icon>
      <Icon name="android-arrow-dropdo" :class="{on: column._sortType === 'desc'}" @on-click="handleSort(index, 'desc')" @mousedown.native.stop="handleClick"></Icon>
    </span>
  </div>
</template>
<script>
import renderHeader from './header';
  export default {
    name:"TableCell",
    props: {
      column:Object,
      index:[Number,String],
      checked:Boolean,
      prefixCls:String,
    },
    components:{renderHeader},
    computed: {
      objData () {
        return this.$parent.objData;
      },
      cellClasses (){
        return [
          `${this.prefixCls}-cell`,
        ];
      },
      checkboxSize() {
        return this.column.checkboxSize ? this.column.checkboxSize : 'large'
      }
    },
    methods: {
      handleClick(){
      },
      selectAll(status){
        this.$parent.selectAll(status);
      },
      handleSort(index,type){
        this.$parent.handleSort(index,type);
      }
    },
  };
</script>
