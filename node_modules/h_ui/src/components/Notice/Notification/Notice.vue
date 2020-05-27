<template>
  <transition :name="transitionName">
    <div :class="classes" :style="styles">
      <!-- <div :class="[baseClass + '-content']" ref="content" v-html="content"></div>
      <a :class="[baseClass + '-close']" @click="close" v-if="closable">
        <i class="iconfont icon-close"></i>
      </a> -->
      <template v-if="type === 'notice'">
        <content-render v-if="render !== null" :render="render"></content-render>
        <div v-else :class="[baseClass + '-content']" ref="content" v-html="content"></div>
        <a :class="[baseClass + '-close']" @click="close" v-if="closable">
            <i class="iconfont icon-close"></i>
        </a>
      </template>
      <template v-if="type === 'message'">
        <div :class="[baseClass + '-content']" ref="content">
          <div :class="[baseClass + '-content-text']" v-html="content"></div>
          <a :class="[baseClass + '-close']" @click="close" v-if="closable">
            <i class="iconfont icon-close"></i>
          </a>
        </div>
      </template>
    </div>
  </transition>
</template>
<script>
import ContentRender from '../render';

export default {
  components: { ContentRender },
  props: {
    prefixCls: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 1.5
    },
    type: {
        type: String
    },
    content: {
      type: String,
      default: ''
    },
    styles: {
      type: Object,
      default: function() {
          return {
              right: '50%'
          };
      }
    },
    closable: {
      type: Boolean,
      default: false
    },
    className: {
      type: String
    },
    name: {
      type: String,
      required: true
    },
    onClose: {
      type: Function
    },
    transitionName: {
      type: String
    },
    render: [Function, Object]
  },
  data () {
    return {
      withDesc: false
    };
  },
  computed: {
    baseClass () {
      return `${this.prefixCls}-notice`;
    },
    classes () {
      return [
        this.baseClass,
        {
          [`${this.className}`]: !!this.className,
          [`${this.baseClass}-closable`]: this.closable,
          [`${this.baseClass}-with-desc`]: this.withDesc
        }
      ];
    },
    contentClasses () {
      return `${this.baseClass}-content`;
    }
  },
  methods: {
    clearCloseTimer () {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }
    },
    close () {
      this.clearCloseTimer();
      this.onClose();
      this.$parent.close(this.name);
    }
  },
  mounted () {
    this.clearCloseTimer();

    if (this.duration !== 0) {
      this.closeTimer = setTimeout(() => {
        this.close();
      }, this.duration * 1000);
    }

    // check if with desc in Notice component
    if (this.prefixCls === 'h-notice') {
      this.withDesc = this.$refs.content && this.$refs.content.querySelectorAll(`.${this.prefixCls}-desc`)[0].innerHTML !== '';
    }
  },
  beforeDestroy () {
    this.clearCloseTimer();
  }
};
</script>
