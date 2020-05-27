<template>
  <li :class="classes" @click.stop="select" @mouseout.stop="blur" v-show="!hidden" @keyup.native.stop="select">
    <checkbox v-show="multiple&&!hideMult" notGroup v-model="selected" @click.native.stop="handleclick" :disabled="disabled" @on-change="checkChange" ></checkbox>
    <slot>{{showLabel}}</slot>
  </li>
</template>
<script>
  import Emitter from '../../mixins/emitter';
  import Checkbox from '../Checkbox/Checkbox.vue';
  import {hasClass} from '../../util/tools';
  const prefixCls = 'h-select-item';

  export default {
    name: 'Option',
    componentName: 'select-item',
    mixins: [ Emitter ],
    components:{Checkbox},
    props: {
      value: {
        type: [String, Number],
        required: true
      },
      label: {
        type: [String, Number]
      },
      disabled: {
        type: Boolean,
        default: false
      },
      /**
       * 是否是内部新建条目
       */
      created: {
        type: Boolean,
        default: false
      },
//      hideMultiple: {
//        type: Boolean,
//        default: false
//      }
    },
    data () {
      return {
        selected: false,
        index: 0,
        isFocus: false,
        hidden: false,
        searchLabel: '',
        multiple:false,
        hideMult:false,
      };
    },
    computed: {
      classes () {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-disabled`]: this.disabled,
            [`${prefixCls}-selected`]: this.selected,
            [`${prefixCls}-focus`]: this.isFocus,
          }
        ];
      },
      showLabel () {
        return (this.label) ? this.label : this.value;
      }
    },
    methods: {
      select () {
        if (this.disabled) {
          return false;
        }
        this.$emit('on-keyup', this.value)
        this.dispatch('Select', 'on-select-selected', this.value);
      },
      checkChange(val){
        this.dispatch('Select', 'on-select-selected', this.value);
      },
      blur () {
        this.isFocus = false;
      },
      queryChange (val) {
        if (!this.created) {
          const parsedQuery = val.replace(/(\^|\(|\)|\[|\]|\$|\*|\+|\.|\?|\\|\{|\}|\|)/g, '\\$1');
          if(!this.$parent.$parent.accuFilter){  //149105 【TS:201906280063-资管业委会（资管）_钱佳华-【需求类型】需求【需求描述】【需求类型】需求【需求描述】select和SimpleSelect 控件多选时 如果搜索时输入的信息完全匹配到 value或者label的时候 自动勾上；
               this.hidden = !new RegExp(parsedQuery, 'i').test(this.searchLabel);
          }else{
            if((parsedQuery===this.value||parsedQuery===this.label)&&!this.selected){
                   this.dispatch('Select', 'on-select-selected', this.value);
            }
          }
        }
      },
      handleclick(){
      }
    },
    watch: {
      value(){
        let obj = this.$parent.$parent;
        //value变化更新下拉项
        if (!hasClass(obj.$el,'h-select')) {
          obj = this.$parent.$parent.$parent;
        }
        obj.updateOptions(true, true);
      },
//      hideMultiple(val) {
//        this.hideMult=val
//      }
    },
    mounted () {
      var str=this.$el.innerText
      this.searchLabel = str.replace('false','').replace('true','').trim();
      // this.searchLabel =str.slice(Number(str.indexOf('</label>')+9));
      !this.created && this.dispatch('Select', 'append');
      this.$on('on-select-close', () => {
        this.isFocus = false;
      });
      this.$on('on-query-change', (val) => {
        this.queryChange(val);
      });
      let obj = this.$parent.$parent;
      if (!hasClass(obj.$el,'h-select')) {
        obj = this.$parent.$parent.$parent;
      }
      this.multiple=obj.multiple;
      this.hideMult=obj.hideMult;
    },
    destroyed () {
      !this.created && this.dispatch('Select', 'remove');
    }
  };
</script>
