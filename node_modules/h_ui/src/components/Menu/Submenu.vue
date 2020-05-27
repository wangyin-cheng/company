<template>
  <li :class="classes" @mouseenter="handleMouseenter" @mouseleave="handleMouseleave">
    <div :class="[prefixCls + '-submenu-title']" ref="reference" @click="handleClick">
      <slot name="title"></slot>
      <Icon :name="subIcon" :class="[prefixCls + '-submenu-title-icon']"></Icon>
    </div>
    <collapse-transition v-if="mode === 'vertical' &&shrinked">
      <ul :class="[prefixCls]" v-show="opened"><slot></slot></ul>
    </collapse-transition>
    <transition name="slide-up" v-else>
      <Drop
        v-show="opened"
        :placement="subTransPos"
        ref="drop"
        :style="dropStyle"><slot></slot></Drop>
    </transition>
  </li>
</template>
<script>
import Drop from '../Select/Dropdown.vue';
import Icon from '../Icon/Icon.vue';
import CollapseTransition from '../Notice/collapse-transition.js';
import { getStyle, findComponentsUpward } from '../../util/tools';
import Emitter from '../../mixins/emitter';
import MenuMixin from './menu-mixin'

const prefixCls = 'h-menu';

export default {
  name: 'Submenu',
  mixins: [ Emitter ],
  components: { Icon, Drop,CollapseTransition },
  props: {
    name: {
      type: [String, Number],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showSlide:{
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      prefixCls: prefixCls,
      active: false,
      opened: false,
      dropWidth: parseFloat(getStyle(this.$el, 'width')),
      parent: findComponentsUpward(this, 'Menu'),
      shrinked:true,
      timeout:null,
    };
  },
  computed: {
    classes () {
      return [
        `${prefixCls}-submenu`,
        {
          [`${prefixCls}-item-active`]: this.active,
          [`${prefixCls}-opened`]: this.opened,
          [`${prefixCls}-submenu-disabled`]: this.disabled
        }
      ];
    },
    subIcon () {
      // 侧边菜单栏伸缩时，改变submenu的图标
      if(this.parent.mode === 'vertical' && this.parent.collapse) {
        return 'enter'
      } else {
        return 'unfold'
      }
    },
    subTransPos () {
      if(this.parent.mode === 'vertical' && this.parent.collapse) {
        return 'left'
      } else {
        return 'bottom'
      } 
    },
    collapse () {
      return this.parent.collapse;
    },
    mode () {
      return this.parent.mode;
    },
    vertiSide () {
      return this.parent.vertiSide;
    },
    accordion () {
      // this.parent == menu
      return this.parent.accordion;
    },
    dropStyle () {
      let style = {};

      if (this.dropWidth) style.minWidth = `${this.dropWidth}px`;
      return style;
    }
  },
  methods: {
    handleMouseenter () {
      // if (this.parent.) {}
      if (this.disabled) return;
      // if (this.mode === 'vertical') return;
      // collapse为true时，可以鼠标经过
      if (this.mode === 'vertical' && !this.collapse&&!this.showSlide) return;
      
      clearTimeout(this.timeout);
      this.parent.updateOpenKeys(this.name);
      this.timeout = setTimeout(() => {
        this.opened = true;
      }, 250);
    },
    handleMouseleave () {
      if (this.disabled) return;
      // if (this.mode === 'vertical') return;
      // collapse为true时，可以鼠标经过
      if (this.mode === 'vertical' && !this.collapse&&!this.showSlide) return;
       // 考虑嵌套一层及三级侧边展开的情况--理财5.0 三级侧边展开时需要保存当前二级展开情况
      let submenuList = []
      if (this.parent.vertiSide && this.showSlide) {
        function findSubmenu (context, componentName) {
          let parent = context.$parent;
          let name = parent.$options.name;
          // 需找到二级菜单
          while (parent && (!name || [componentName].indexOf(name) < 0 || parent.showSlide)) {
            parent = parent.$parent;
            if (parent) name = parent.$options.name;
          }
          return parent;
        }
        let submenuItem = findSubmenu(this, 'Submenu')
        submenuList.push(submenuItem.name)
      }
      this.parent.updateOpenKeys(this.name, submenuList);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
          this.opened = false;
      }, 150);
    },
    handleClick () {
      if (this.disabled||this.showSlide) return;
      // collapse为true时，触发鼠标经过，因此忽略点击
      if (this.mode === 'horizontal' || this.collapse ) return;
      const opened = this.opened;
      // 考虑嵌套一层的情况(分开判断)
      if (this.accordion) {
        if (Number(this.parent.nestIndex) == 0 && this.$parent.$options.name !== 'Submenu') {
          this.parent.$children.forEach(item => {
            if (item.$options.name === 'Submenu') item.opened = false;
          });
        } else if (Number(this.parent.nestIndex) == 1 && this.$parent.$parent.$options.name !== 'Submenu') {
          if (this.parent.$children && this.parent.$children.length == 1) {
            // 垂直嵌套一层-menu下一个嵌套层级，同时该嵌套层级中多个submenu及其子元素-参考业务基础框架sidebar--sidebarItem
            this.parent.$children[0].$children.forEach(item => {
              if (item && item.$options.name === 'Submenu') item.opened = false;
            })
          } else {
            // 平级嵌套，menu下多个嵌套一层组件的submenu
            this.parent.$children.forEach(item => {
              if (item.$children && item.$children[0].$options.name === 'Submenu') item.$children[0].opened = false;
            });
          }
        } 
      }
      // if (this.accordion && this.$parent.$options.name !== 'Submenu') {
      //   this.parent.$children.forEach(item => {
      //       if (item.$options.name === 'Submenu') item.opened = false;
      //   });
      // } 
      this.opened = !opened;
      this.parent.updateOpenKeys(this.name);
    }
  },
  watch: {
    mode (val) {
      if (val === 'horizontal') {
        this.$refs.drop.update();
      }
    },
    opened (val) {
      if (this.mode === 'vertical') return;
      if (val) {
        // set drop a width to fixed when menu has fixed position
        this.dropWidth = parseFloat(getStyle(this.$el, 'width'));
        this.$refs.drop.update();
      } else {
        // this.$refs.drop.destroy();
      }
    }
  },
  mounted () {
    this.$on('on-menu-item-select', (name) => {
      if (this.mode === 'horizontal') this.opened = false;
      this.dispatch('Menu', 'on-menu-item-select', name);
      return true;
    });
    this.$on('on-update-active-name', (status) => {
      this.active = status;
    });
    this.$on('on-collapse-close',()=>{
      this.shrinked = false;
      this.opened=false;
      this.$nextTick(()=>{
        this.shrinked = true;
      })
    })
  },
  beforeDestroy(){
    if(this.$refs.drop){
      this.$refs.drop.destroy();
    }
  }
};
</script>
