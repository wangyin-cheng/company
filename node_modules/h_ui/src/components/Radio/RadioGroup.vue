<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>
<script>
  import { oneOf, findComponentsDownward } from '../../util/tools';
  import Emitter from '../../mixins/emitter';

  const prefixCls = 'h-radio-group';

  export default {
    name: 'RadioGroup',
    mixins: [ Emitter ],
    props: {
      value: {
        type: [String, Number],
        default: ''
      },
      size: {
        validator (value) {
            return oneOf(value, ['small', 'large', 'default']);
        }
      },
      type: {
        validator (value) {
            return oneOf(value, ['button']);
        }
      },
      vertical: {
        type: Boolean,
        default: false
      },
      btnIcon: {
        type: Boolean,
        default: false
      },
      btnIconOnlyChecked: {
        type: Boolean,
        default: false
      },
      tabindex: {
        type: [String, Number],
        default: "0",
        validator(value) {
          let num = parseInt(value);
          return num <= 32767 && num >= -1;
        }
      }
    },
    data () {
      return {
        currentValue: this.value,
        childrens: [],
        viewValue:'',
      };
    },
    computed: {
      classes () {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-${this.size}`]: !!this.size,
            [`h-radio-${this.size}`]: !!this.size,
            [`${prefixCls}-${this.type}`]: !!this.type,
            [`${prefixCls}-vertical`]: this.vertical
          }
        ];
      }
    },
    mounted () {
      this.updateValue();
      this.getViewVlaue(this.value)
      this.$on('on-group-click',()=>{
        this.$emit('on-click');
      })
    },
    methods: {
      updateValue () {
        const value = this.value;
        this.childrens = findComponentsDownward(this, 'Radio');
        if (this.childrens) {
          this.childrens.forEach(child => {
            child.currentValue = value === child.label;
            child.group = true;
          });
        }
      },
      change (data) {
        this.currentValue = data.value;
        this.updateValue();
        this.$emit('input', data.value);
        this.$emit('on-change', data.value);
        this.dispatch('FormItem', 'on-form-change', data.value);
      },
      // groupClick(){
      //   this.$emit('on-click');
      // },
      focus() {
        let targetRadio = this.$slots.default.filter(slot => {
          let isRadio = slot.componentOptions && slot.componentOptions.tag
          if (isRadio && !slot.componentInstance.disabled && slot.componentInstance.currentValue) {
            return true
          }
          return false
        })[0]

        // 选中状态在禁用状态的 radio 上的特殊处理
        // 没有选中状态的特殊处理
        if (!targetRadio) {
          targetRadio = this.$slots.default.filter(slot => {
            let isRadio = slot.componentOptions && slot.componentOptions.tag
            if (isRadio && slot.componentInstance.disabled && slot.componentInstance.currentValue) {
              slot.componentInstance.currentValue = false
            }
            return isRadio && !slot.componentInstance.disabled
          })[0]

          targetRadio.componentInstance.currentValue = true
          this.$emit('input', targetRadio.componentInstance.label)
        }

        targetRadio.componentInstance.focus()
      },
      blur() {
        let targetRadio = this.$slots.default.filter(slot => {
          let isRadio = slot.componentOptions && slot.componentOptions.tag
          if (isRadio && slot.componentInstance.currentValue) {
            return true
          }
          return false
        })[0]
        targetRadio.componentInstance.blur()
      },
      getViewVlaue(val){
        if (this.childrens) {
          let label=''
          this.childrens.forEach(child => {
            if(val== child.label) label=child.text||child.label
          });
          this.viewValue = label
        }else{
          this.viewValue = val
        }
      }
    },
    watch: {
      value () {
        this.updateValue();
      },
      currentValue(val){
        this.getViewVlaue(val)
      }
    }
  };
</script>
