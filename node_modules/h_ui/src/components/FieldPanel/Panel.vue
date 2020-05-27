<template>
  <fieldset :class="wrapClass">
    <legend><slot name="title">{{title}}</slot></legend>
    <CollapseTransition>
      <div v-show="isCollapse"><slot></slot></div>
    </CollapseTransition>
    <div :class="footerClass" v-if="showIcon">
      <a href="javascript:void(0)" @click="handleCollapse" :class="iconClass">
        <Icon name="doublearrow" size="12"></Icon>
      </a>
      <!-- packup -->
    </div>
  </fieldset>
</template>
<script>
import {oneOf} from '../../util/tools'
import Icon from '../Icon/Icon.vue'
import hButton from '../Button/Button.vue'
import CollapseTransition from '../Notice/collapse-transition';
  const prefixCls = 'h-field-panel';

  export default {
    name: 'FieldPanel',
    // mixins: [ Locale ],
    components: {Icon,hButton,CollapseTransition},
    data () {
      return {
        prefixCls: prefixCls,
        isCollapse: false
      }
    },
    props: {
      title: String,
      collapse: {
        type: Boolean,
        default: false
      },
      iconAlgin:{
        validator (value) {
          return oneOf(value, ['left', 'center', 'right']);
        },
        default:'center'
      },
      showIcon: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      wrapClass(){
        return[
          `${prefixCls}-wrap`,
          {
          }
        ]
      },
      footerClass(){
        return `${prefixCls}-footer`;
      },
      iconClass(){
        return{
          [`${prefixCls}-footer-icon`]: this.isCollapse,
        }
      }
    },
    methods: {
      handleCollapse () {
        this.isCollapse = !this.isCollapse;
        this.$emit('on-change',this.isCollapse);
      }
    },
    watch:{
      collapse(val){
        this.isCollapse=val;
      }
    },
    mounted(){
      this.isCollapse=this.collapse;
    }
  }
</script>
