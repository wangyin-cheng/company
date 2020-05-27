<template>
  <div :class="classes" :style="styles">
    <slot></slot>
  </div>
</template>
<script>
import { oneOf } from '../../util/tools';

const prefixCls = 'h-row';

export default {
  name: 'Row',
  props: {
    type: {
      validator (value) {
        return oneOf(value, ['flex']);
      }
    },
    // flex 布局下的垂直对齐方式
    align: {
      validator (value) {
        return oneOf(value, ['top', 'middle', 'bottom']);
      }
    },
    // flex 布局下的水平排列方式
    justify: {
      validator (value) {
        return oneOf(value, ['start', 'end', 'center', 'space-around', 'space-between']);
      }
    },
    gutter:Number,
    className: String
  },
  computed: {
    classes () {
      return [
        {
          [`${prefixCls}`]: !this.type,
          [`${prefixCls}-${this.type}`]: !!this.type,
          [`${prefixCls}-${this.type}-${this.align}`]: !!this.align,
          [`${prefixCls}-${this.type}-${this.justify}`]: !!this.justify,
          [`${this.className}`]: !!this.className
        }
      ];
    },
    styles () {
      let style = {};
      if (this.gutter) {
        style = {
          marginLeft: this.gutter / -2 + 'px',
          marginRight: this.gutter / -2 + 'px'
        };
      }

      return style;
    }
  },
  methods: {
    updateGutter (val) {
      this.$children.forEach((child) => {
        if (val !== 0) {
          child.gutter = val;
        }
      });
    }
  },
  watch: {
    gutter (val) {
      this.updateGutter(val);
    }
  }
};
</script>
