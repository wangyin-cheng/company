<template>
    <tr :class="rowClasses(row._index)"><slot></slot></tr>
</template>
<script>
  export default {
    props: {
      row: Object,
      prefixCls: String,
      hoverIndex:Number,
    },
    computed: {
      objData () {
          return this.$parent.objData;
      }
    },
    methods: {
      rowClasses (_index) {
        return [
          `${this.prefixCls}-row`,
          this.rowClsName(_index),
          {
            [`${this.prefixCls}-row-checked`]: this.objData[_index] && this.objData[_index]._isChecked,
            [`${this.prefixCls}-row-highlight`]: this.objData[_index] && this.objData[_index]._isHighlight,
            // [`${this.prefixCls}-row-hover`]: this.objData[_index] && this.objData[_index]._isHover,
            [`${this.prefixCls}-row-hover`]: _index == this.hoverIndex,
            [`${this.prefixCls}-row-filterable`]: this.objData[_index] && this.objData[_index]._isMatched
          }
        ];
      },
      rowClsName (_index) {
        return this.$parent.rowClassName(this.objData[_index], _index);
      },
    }
  };
</script>