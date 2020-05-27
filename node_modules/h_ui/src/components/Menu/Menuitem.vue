<template>
  <li :class="classes" @click.stop="handleClick">
    <Tooltip v-if="$parent === rootMenu && rootMenu.collapse"
             placement="right"
             transfer>
      <div slot="content">
        <slot name="title"></slot>
      </div>
      <div style="position: absolute;left: 0;top: 0;height: 100%;width: 100%;display: inline-block;box-sizing: border-box;padding: 0 20px;">
        <slot></slot>
      </div>
    </Tooltip>
    <slot></slot>
  </li>
</template>
<script>
import Emitter from '../../mixins/emitter';
import MenuMixin from './menu-mixin'
import Tooltip from '../Tooltip'
const prefixCls = 'h-menu';

export default {
  name: 'MenuItem',
  mixins: [ Emitter , MenuMixin],
  components: {Tooltip},
  props: {
    // 菜单项的唯一标识，必填
    name: {
      type: [String, Number],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      active: false
    };
  },
  computed: {
    classes () {
      return [
        `${prefixCls}-item`,
        {
          [`${prefixCls}-item-active`]: this.active,
          [`${prefixCls}-item-selected`]: this.active,
          [`${prefixCls}-item-disabled`]: this.disabled
        }
      ];
    }
  },
  methods: {
    handleClick () {
      if (this.disabled) return;

      let parent = this.$parent;
      let name = parent.$options.name;
      while (parent && (!name || name !== 'Submenu')) {
        parent = parent.$parent;
        if (parent) name = parent.$options.name;
      }

      if (parent) {
        this.dispatch('Submenu', 'on-menu-item-select', this.name);
      } else {
        this.dispatch('Menu', 'on-menu-item-select', this.name);
      }
    }
  },
  mounted () {
    this.$on('on-update-active-name', (name) => {
      if (this.name === name) {
        this.active = true;
        this.dispatch('Submenu', 'on-update-active-name', true);
      } else {
        this.active = false;
      }
    });
  }
};
</script>
