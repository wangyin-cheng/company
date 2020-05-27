<template>
  <div :class="classes" :style="listStyle">
    <div :class="prefixCls + '-header'" v-if="showTitle">
      <span :class="prefixCls + '-header-title'" @click="toggleSelectAll(!checkedAll)">{{ title }}</span>
      <span :class="prefixCls + '-header-count'">{{ count }}</span>
    </div>
    <div :class="bodyClasses">
      <div :class="prefixCls + '-body-search-wrapper'" v-if="filterable">
        <Search
          ref="search"
          :prefix-cls="prefixCls + '-search'"
          :query="query"
          @on-query-clear="handleQueryClear"
          @on-query-change="handleQueryChange"
          :placeholder="filterPlaceholder"
        ></Search>
      </div>
      <ul :class="prefixCls + '-content'">
        <h-edit-gird
          v-if="!noEdit"
          ref="table"
          :data="filterData"
          :columns="columns"
          :stripe="stripe"
          :border="border"
          :rowSelect="rowSelect"
          :highlight-row="highlightRow"
          :showEditInput ="showEditInput"
          :option="option"
          :treeOption="treeOption"
          :height="height"
          @on-current-change="currentChange"
          @on-selection-change="selectionChange"
          @on-row-click="rowClick"
          :no-data-text="notData"
        ></h-edit-gird>
        <h-simple-table
          v-if="noEdit"
          ref="table"
          :data="filterData"
          :columns="columns"
          :stripe="stripe"
          :border="border"
          :rowSelect="rowSelect"
          :highlight-row="highlightRow"
          :height="height"
          @on-current-change="currentChange"
          @on-selection-change="selectionChange"
          @on-row-click="rowClick"
          :no-data-text="notData"
        ></h-simple-table>
      </ul>
    </div>
    <div :class="prefixCls + '-footer'" v-if="showFooter"><slot></slot></div>
  </div>
</template>
<script>
  import Search from './Search.vue';
  import Checkbox from '../Checkbox/Checkbox.vue';

  export default {
    name: 'TransferList',
    components: { Search, Checkbox },
    props: {
      prefixCls: String,
      data: Array,
      columns:Array,
      stripe:Boolean,
      border:Boolean,
      rowSelect:Boolean,
      highlightRow:Boolean,
      showEditInput:Boolean,
      option:Array,
      treeOption:Array,
      width:Number,
      height:Number,
      title: [String, Number],
      showTitle:Boolean,
      width:[String, Number],
      notData: String,
      filterable: Boolean,
      filterPlaceholder: String,
      filterMethod: Function,
      noEdit:Boolean,
      isHide:Boolean,
    },
    data () {
        return {
            showItems: [],
            query: '',
            showFooter: true,
            showData:false,
        };
    },
    watch: {
        data () {
            this.updateFilteredData();
        }
    },
    computed: {
        listStyle(){
          let style={};
          if (this.width) {
              style.width = this.width+'px'              
          }
          if(this.isHide){
              style.display ='none'
          }
          return style;
        },
        classes () {
            return [
                `${this.prefixCls}`,
                {
                    [`${this.prefixCls}-with-footer`]: this.showFooter,
                    [`${this.prefixCls}-with-title`]: this.showTitle,
                }
            ];
        },
        bodyClasses () {
            return [
                `${this.prefixCls}-body`,
                {
                    [`${this.prefixCls}-body-with-search`]: this.filterable,
                    [`${this.prefixCls}-body-with-footer`]: this.showFooter
                }
            ];
        },
        count () {
            const validKeysCount = this.validKeysCount;
            return (validKeysCount > 0 ? `${validKeysCount}/` : '') + `${this.data.length}`;
        },
        checkedAll () {
            return this.data.filter(data => !data.disabled).length === this.validKeysCount && this.validKeysCount !== 0;
        },
        checkedAllDisabled () {
            return this.data.filter(data => !data.disabled).length <= 0;
        },
        filterData () {
            if (this.data.length == 0) {
               this.showData = true;
            }else {
               this.showData = false;
            }
            return this.showItems.filter(item => this.filterMethod(item, this.query));
        }
    },
    methods: {
      itemClasses (item) {
        return [
            `${this.prefixCls}-content-item`,
            {
                [`${this.prefixCls}-content-item-disabled`]: item.disabled
            }
        ];
      },
      showLabel (item) {
        return this.renderFormat(item);
      },
      isCheck (item) {
        return this.checkedKeys.some(key => key === item.key);
      },
      select (item) {
        if (item.disabled) return;
        const index = this.checkedKeys.indexOf(item.key);
        index > -1 ? this.checkedKeys.splice(index, 1) : this.checkedKeys.push(item.key);
      },
      updateFilteredData () {
        this.showItems = this.data.map((d, i) => {
          d._hkey_ = i;
          return d;
        });
      },
      toggleSelectAll (status) {
          const keys = status ?
                  this.data.filter(data => !data.disabled || this.checkedKeys.indexOf(data.key) > -1).map(data => data.key) :
                  this.data.filter(data => data.disabled && this.checkedKeys.indexOf(data.key) > -1).map(data => data.key);
          this.$emit('on-checked-keys-change', keys);
      },
      handleQueryClear () {
        this.query = '';
      },
      handleQueryChange (val) {
        this.query = val;
      },
      getdata: function(evt){
      },
      datadragEnd:function(evt){ 
      },
      currentChange(cur,old){
        this.$emit('on-current-change',cur,old)
      }, 
      selectionChange(sel){
        this.$emit('on-selection-change',sel)
      },
      rowClick(val){
        this.$emit('on-row-click',val)
      },
      clearSearch(){
        this.$refs.search.clearSearch()
      }
    },
    created () {
        // this.updateFilteredData();
    },
    mounted () {
        this.showFooter = this.$slots.default !== undefined;
    }
  };
</script>