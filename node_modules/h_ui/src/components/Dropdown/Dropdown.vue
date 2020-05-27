<template>
  <div
    :class="[prefixCls]"
    v-clickoutside="handleClose"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave">
    <div :class="[prefixCls + '-rel']" ref="reference" @click="handleClick"><slot></slot></div>
    <transition :name="transition" v-if="!noTransition">
      <Drop
        v-show="currentVisible"
        :placement="placement"
        :widthAdaption="false"
        ref="drop"
        :adaptParentWidth="adaptParentWidth"
        @mouseenter.native="handleMouseenter"
        @mouseleave.native="handleMouseleave"
        :data-transfer="transfer"
        v-transfer-dom><slot name="list"></slot></Drop>
    </transition>
    <Drop
        v-else
        v-show="currentVisible"
        :placement="placement"
        :widthAdaption="false"
        ref="drop"
        :adaptParentWidth="adaptParentWidth"
        @mouseenter.native="handleMouseenter"
        @mouseleave.native="handleMouseleave"
        :data-transfer="transfer"
        v-transfer-dom><slot name="list"></slot></Drop>
  </div>
</template>
<script>
  import Drop from '../Select/Dropdown.vue';
  import clickoutside from '../../directives/clickoutside';
  import TransferDom from '../../directives/transfer-dom';
  import { oneOf, findComponentsUpward } from '../../util/tools';

  const prefixCls = 'h-dropdown';

  export default {
    name: 'Dropdown',
    directives: { clickoutside, TransferDom },
    components: { Drop },
    props: {
      trigger: {
        validator (value) {
            return oneOf(value, ['click', 'hover', 'custom']);
        },
        default: 'hover'
      },
      placement: {
        validator (value) {
          return oneOf(value, ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']);
        },
        default: 'bottom'
      },
      visible: {
        type: Boolean,
        default: false
      },
      adaptParentWidth: {
        type:Boolean,
        default: false
      },
      transfer: {
        type: Boolean,
        default: false
      },
      noTransition: {
        type: Boolean,
        default: false
      },
    },
    computed: {
      transition () {
        return ['bottom-start', 'bottom', 'bottom-end'].indexOf(this.placement) > -1 ? 'slide-up' : 'fade';
      }
    },
    data () {
      return {
        prefixCls: prefixCls,
        currentVisible: this.visible
      };
    },
    watch: {
      visible (val) {
          this.currentVisible = val;
      },
      currentVisible (val) {
        if (val) {
            this.$refs.drop.update();
        } else {
            this.$refs.drop.destroy();
        }
        this.$emit('on-visible-change', val);
      }
    },
    methods: {
      handleClick () {
        if (this.trigger === 'custom') return false;
        if (this.trigger !== 'click') {
            return false;
        }
        this.currentVisible = !this.currentVisible;
      },
      handleMouseenter () {
        if (this.trigger === 'custom') return false;
        if (this.trigger !== 'hover') {
            return false;
        }
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.currentVisible = true;
        }, 250);
      },
      handleMouseleave () {
        if (this.trigger === 'custom') return false;
        if (this.trigger !== 'hover') {
            return false;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.currentVisible = false;
            }, 150);
        }
      },
      handleClose () {
        if (this.trigger === 'custom') return false;
        if (this.trigger !== 'click') {
            return false;
        }
        this.currentVisible = false;
      },
      hasParent () {
        // const $parent = this.$parent.$parent.$parent;
        const $parent = findComponentsUpward(this, 'Dropdown');
        if ($parent) {
            return $parent;
        } else {
            return false;
        }
      },
      fold() {
        this.currentVisible = false
      }
    },
    mounted () {
      this.$on('on-click', (key) => {
        const $parent = this.hasParent();
        if ($parent) $parent.$emit('on-click', key);
      });
      this.$on('on-hover-click', () => {
        const $parent = this.hasParent();
        if ($parent) {
          this.$nextTick(() => {
              if (this.trigger === 'custom') return false;
              this.currentVisible = false;
          });
          $parent.$emit('on-hover-click');
        } else {
          this.$nextTick(() => {
              if (this.trigger === 'custom') return false;
              this.currentVisible = false;
          });
        }
      });
      this.$on('on-haschild-click', () => {
        this.$nextTick(() => {
          if (this.trigger === 'custom') return false;
          this.currentVisible = true;
        });
        const $parent = this.hasParent();
        if ($parent) $parent.$emit('on-haschild-click');
      });
    }
  };
</script>
