<template>
  <li :class="[prefixCls + '-item-group']">
    <div :class="[prefixCls + '-item-group-title']" :style="{paddingLeft: levelPadding + 'px'}">{{ title }}</div>
    <ul><slot></slot></ul>
  </li>
</template>
<script>
const prefixCls = 'h-menu';

export default {
  name: 'MenuGroup',
  inject: ['rootMenu'],
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      prefixCls: prefixCls,
      paddingLeft: 20
    };
  },
  computed: {
    levelPadding() {
      let padding = 10;
      let parent = this.$parent;
      if (this.rootMenu.collapse) return 20;
      while (parent && parent.$options.componentName !== 'Menu') {
        if (parent.$options.componentName === 'Submenu') {
          padding += 20;
        }
        parent = parent.$parent;
      }
      padding === 10 && (padding = 20);
      return padding;
    }
  }
};
</script>
