<template>
  <tr :class="rowClasses(rowTitle._index)">
    <td v-show="columns[0].type=='selection'" :class="alignCls(columns[0])">
      <div :class="prefixCls+'-cell'">
        <Checkbox :value="checked" @on-change="toggleSelect(rowTitle._index)"></Checkbox>
      </div>
    </td>
    <td :colspan="columns[0].type=='selection'?columns.length-1:columns.length">
      <div :class="prefixCls+'-cell-group'" @click="toggleExpand(rowTitle._index)">
        <span :class="groupCls">
          <Icon name="enter"></Icon>
        </span>
        <!-- <span :class="prefixCls+'-cell-title'">{{rowTitle.title}}</span> -->
        <group-title :prefixCls="prefixCls" :rowtitle="rowTitle.title" :titleRender="titleRender"></group-title>
      </div>
    </td>
  </tr>
</template>
<script>
import Checkbox from '../Checkbox/Checkbox.vue'
import Icon from '../Icon/Icon.vue'
import Mixin from './mixin';
import GroupTitle from './Group-title.vue'
  export default {
    name: 'GroupTr',
    components:{Checkbox,Icon,GroupTitle},
    mixins: [ Mixin ],
    props: {
      columns: Array,
      prefixCls: String,
      rowTitle: Object,
      expanded: Boolean,
      checked:Boolean,
      titleRender: Function
    },
    computed: {
      groupCls () {
        return [
          `${this.prefixCls}-cell-expand`,
          {
            [`${this.prefixCls}-cell-expand-expanded`]: this.expanded
          }
        ];
      }
    },
    methods: {
      toggleExpand (index) {
        this.$parent.$parent.toggleExpand(index);
      },
      toggleSelect (index) {
      this.$parent.$parent.toggleSelect(index);
      },
      rowClasses (_index) {
        let _title = _index%2==0?false:true;
        return {
          [`${this.prefixCls}-title-stripe`]:_title,
          [`${this.prefixCls}-title-expand`]: this.expanded
        }
      }
    },
    mounted(){
    }
  };
</script>
