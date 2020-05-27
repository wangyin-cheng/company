<template>
    <tr :class="rowClasses(row._index)"><slot></slot></tr>
</template>
<script>
  export default {
    props: {
      row: Object,
      prefixCls: String,
      typeName:String,
      clickToSelect:Boolean,
    },
    computed: {
      objData () {
        return this.$parent.objData;
      }
    },
    methods: {
      rowClasses (_index) {
        let _isChecked,_isHighlight,_isHover;
        if (this.typeName=="groupTable" && String(_index).indexOf('.')>-1) {
          let k = String(_index).split('.')[0];
          let m = Number(String(_index).split('.')[1]) -1;
          _isChecked = this.objData[k].item[m]._isChecked;
          _isHighlight = this.objData[k].item[m]._isHighlight;
          _isHover = this.objData[k].item[m]._isHover;
        }else{
          _isChecked = this.objData[_index] && this.objData[_index]._isChecked;
          _isHighlight =this.objData[_index] && this.objData[_index]._isHighlight;
          _isHover = this.objData[_index] && this.objData[_index]._isHover;
        }
        return [
          `${this.prefixCls}-row`,
          this.rowClsName(_index),
          {
            [`${this.prefixCls}-row-checked`]: _isChecked && !this.clickToSelect ,
            [`${this.prefixCls}-row-highlight`]:_isHighlight,
            [`${this.prefixCls}-row-hover`]:_isHover
          }
        ];
      },
      rowClsName (_index) {
        return this.$parent.$parent.rowClassName(this.objData[_index], _index);
      },
    }
  };
</script>