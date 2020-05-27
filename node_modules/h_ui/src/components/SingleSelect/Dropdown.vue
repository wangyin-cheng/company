<template>
  <div class="h-select-dropdown" :style="styles" @click="handleClick" @mousedown.stop ref="selectdrop">
  <!--<div class="h-select-dropdown" style="display: none;" @click="handleClick" @mousedown.stop ref="selectdrop">-->
    <slot></slot>
  </div>
</template>
<script>
//import { Popper } from "../../util";
import { getStyle, getScrollBarSize } from '../../util/tools';
const Popper = require('../../util/popper.js');
export default {
  name: 'Drop',
  props: {
    widthAdaption: {
      type: Boolean,
      default: false,
    },
    maxDropWidth: {
      type:[String,Number],
      default: 500
    },
    placement: {
      type: String,
      default: 'bottom-start'
    },
    className: {
      type: String
    },
    dropWidth:{
      type:[String,Number]
    }
  },
  data() {
    return {
      popper: null,
      width: '',
      parentWidth: null, 	// 保存当前父节点的宽度，当进行下拉内容自适应时需要与最大宽度进行对比,取较大者设为最大宽度
      scrollBarWidth: getScrollBarSize()
    };
  },
  computed: {
    styles() {
      let style = {}
      if (this.widthAdaption) {
        if (parseFloat(this.dropWidth) > 0) {
          style.minWidth = `${parseFloat(this.dropWidth)}px`
        }else {
          style.minWidth = `${parseFloat(this.parentWidth)}px`
        }
        if (parseFloat(this.maxDropWidth) > 0 && parseFloat(this.dropWidth) > 0
          && parseFloat(this.maxDropWidth) > parseFloat(this.dropWidth)) {
          let maxWidth = Math.max(parseFloat(this.maxDropWidth), parseFloat(this.parentWidth))
          style.maxWidth = `${maxWidth}px`
        }else if(parseFloat(this.maxDropWidth) > 0 && parseFloat(this.dropWidth) > 0
          && parseFloat(this.maxDropWidth) <= parseFloat(this.dropWidth)) {
          let maxWidth = Math.max(parseFloat(this.dropWidth), parseFloat(this.parentWidth))
          style.maxWidth = `${maxWidth}px`
        }else {
          style.maxWidth = `${this.maxDropWidth}px`
        }
        if (this.width) {
          style.width = `${this.width}px`
        }else {
          style.width = `${this.dropWidth}px`
        }
      } else {
        if (this.width) {
          style.width = `${this.width}px`
        }else {
          style.width = `${this.dropWidth}px`
        }
      }
      return style
    }
  },
  methods: {
    handleClick(event){
      this.$emit('click', event);
    },
    setWidthAdaption(){
      setTimeout(()=>{
        let content = this.$refs.selectdrop
        content = content.querySelectorAll('.h-selectTable-dropdown-list')[0].children[0]
        // 横向或者纵向滚动条导致的像素偏移的问题
        // 是否有纵向滚动条
        let isScrollY = parseInt(this.$refs.selectdrop.clientWidth) > parseInt(content.clientWidth) ? true : false
        // 是否有横向滚动条
        let isScrollX = parseInt(this.$refs.selectdrop.clientHeight) > parseInt(content.clientHeight) ? true : false
//        this.width = parseInt(content.scrollWidth) + this.scrollBarWidth
        this.width = isScrollY ? parseInt(content.scrollWidth) + this.scrollBarWidth : content.scrollWidth
//        if(isScrollX) {
//
//        }
      },0)
    },
    update() {
//      function setStyle(element, styles) {
//        function is_numeric(n) {
//          return n !== "" && !isNaN(parseFloat(n)) && isFinite(n);
//        }
//        Object.keys(styles).forEach(function(prop) {
//          var unit = "";
//          // add unit if the value is numeric and is one of the following
//          if (["width", "max-width", "min-width", "height", "top", "right", "bottom", "left"].indexOf(prop) !== -1 && is_numeric(styles[prop])) {
//            unit = "px";
//          }
//          element.style[prop] = styles[prop] + unit;
//        })
//      }
//      const _this = this
//      // make sure popper calc exactly
//      setStyle(this.$el, { display: "block", visibility: "hidden", width: "", top: "0", left: "0" })
//      if (this.popper) {
//        this.popper.scheduleUpdate()
//        return
//      }
//      this.$nextTick(() => {
//        const placement = (() => {
//          if (this.autoPlacement) {
//            const { top, bottom, height } = this.$parent.$el.getBoundingClientRect();
//            const wh = window.innerHeight;
//            return wh - top - height < 210 ? "top-start" : "bottom-start";
//          } else {
//            return ["top", "bottom"].includes(this.placement) ? `${this.placement}-start` : this.placement;
//          }
//        })();
//
//        this.popper = new Popper(this.$parent.$refs.reference, this.$el, {
//          placement,
//          eventsEnabled: false, // Whether events (resize, scroll) are initially enabled.
//          modifiers: {
//            preventOverflow: {
//              escapeWithReference: true // When escapeWithReference is set totrue and reference is completely outside its boundaries, the popper will overflow (or completely leave) the boundaries in order to remain attached to the edge of the reference.
//            },
//            flip: { enabled: false }, // Modifier used to flip the popper’s placement when it starts to overlap its reference element.
//            computeStyle: {
//              gpuAcceleration: false // If true, it uses the CSS 3D transformation to position the popper. Otherwise, it will use the top and left properties
//            },
//            applyStyle: { enabled: false },
//            applyVueStyle: {
//              enabled: true,
//              fn(data) {
//                const { show, allowAnimation, dropWidth, maxDropWidth, widthAdaption } = _this;
//                const {
//                  instance: { popper: el },
//                  offsets: {
//                    popper: { width: cWidth },
//                    reference: { width: pWidth }
//                  },
//                  styles
//                } = data;
//                if (widthAdaption) {
//                  if (parseFloat(dropWidth) > 0) {
//                    styles["min-width"] = parseFloat(dropWidth);
//                  } else {
//                    styles["min-width"] = pWidth;
//                  }
//                  if (parseFloat(maxDropWidth) > 0 && parseFloat(maxDropWidth) > parseFloat(dropWidth)) {
//                    styles["max-width"] = Math.max(parseFloat(maxDropWidth), pWidth);
//                  } else {
//                    styles["max-width"] = Math.max(parseFloat(dropWidth), pWidth);
//                  }
//                  styles.width = cWidth;
//                } else {
//                  styles.width = parseFloat(dropWidth) || pWidth;
//                }
//                setStyle(el, { display: "block", visibility: "visible", ...styles }); // make sure animation is possible
//                if (allowAnimation) {
//                  show
//                    ? el.classList.add(placement.includes("top") ? "slide-down-enter-active" : placement.includes("bottom") && "slide-up-enter-active")
//                    : el.classList.add(placement.includes("top") ? "slide-down-leave-active" : placement.includes("bottom") && "slide-up-leave-active");
//                  function onAnimationEnd() {
//                    el.removeEventListener("animationend", onAnimationEnd);
//                    el.classList.remove("slide-up-enter-active", "slide-up-leave-active", "slide-down-enter-active", "slide-down-leave-active");
//                    if (!show) {
//                      setStyle(el, { display: "none" });
//                      _this.$emit("on-hide"); // emit on animation end and dropdown panel hidden
//                    }
//                  }
//                  el.addEventListener("animationend", onAnimationEnd);
//                } else {
//                  if (!show) {
//                    setStyle(el, { display: "none" });
//                    _this.$emit("on-hide");
//                  }
//                }
//              },
//              order: 900
//            }
//          }
//        })
//      })

      if (this.popper) {
        this.$nextTick(() => {
          // select 组件 placement 改变后同步改变 popper 实例
          this.popper._options.placement = this.widthAdaption ? this.placement.indexOf('top') >= 0 ? 'top-start' : 'bottom-start' : this.placement
          this.popper.update();
          // 有滚动条时，下拉宽度为内容宽度
          if (this.widthAdaption) {
            this.setWidthAdaption()
          }
        });
      } else {
        this.$nextTick(() => {
          let curPlacement = this.widthAdaption ? this.placement.indexOf('top') >= 0 ? 'top-start' : 'bottom-start' : this.placement
          // let curPlacement = this.placement.indexOf('top') >= 0 ? 'top-start' : this.placement
          this.popper = new Popper(this.$parent.$refs.reference, this.$el, {
            gpuAcceleration: false,
            placement: curPlacement,
            boundariesPadding: 0,
            forceAbsolute: true,
            boundariesElement: 'body'
          });
          this.popper.onCreate(popper => {
            this.resetTransformOrigin(popper);
          });
          // 有滚动条时，下拉宽度为内容宽度
          if (this.widthAdaption) {
            this.setWidthAdaption()
          }
        });
      }

      if (!this.dropWidth) {
        let width = parseInt(getStyle(this.$parent.$el, 'width'));
        this.width = width
        this.parentWidth = width
      }else{
        this.width = this.dropWidth;
        this.parentWidth = this.dropWidth;
      }
    },
    destroy () {
      if (this.popper) {
        this.resetTransformOrigin(this.popper);
        setTimeout(() => {
          this.popper.destroy();
          this.popper = null;
        }, 300);
      }
    },
    resetTransformOrigin(popper) {
      let placementMap = {top: 'bottom', bottom: 'top'};
      let placement = popper._popper.getAttribute('x-placement').split('-')[0];
      let origin = placementMap[placement];
      popper._popper.style.transformOrigin = `center ${ origin }`;
    }
  },
  created () {
    this.$on('on-update-popper', this.update);
    this.$on('on-destroy-popper', this.destroy);
  },
  beforeDestroy () {
    if (this.popper) {
      this.popper.destroy();
    }
  }
};
</script>
