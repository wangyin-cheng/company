<template>
  <label :class="wrapClasses">
    <span :class="radioClasses" @click="radioClick">
      <span :class="innerClasses"></span>
      <input
        ref="input"
        type="radio"
        @focus="focus"
        @blur="blur"
        :class="inputClasses"
        :disabled="disabled"
        :readonly = "readonly"
        :checked="currentValue"
        :tabindex="getTabIndex()"
        @change="change">
    </span><slot>{{ text||label }}</slot>
  </label>
</template>
<script>
  import { findComponentsUpward, oneOf } from '../../util/tools';
  import Emitter from '../../mixins/emitter';

  const prefixCls = 'h-radio';

  export default {
    name: 'Radio',
    mixins: [ Emitter ],
    props: {
      value: {
        type: [String, Number, Boolean],
        default: false
      },
      trueValue: {
        type: [String, Number, Boolean],
        default: true
      },
      falseValue: {
        type: [String, Number, Boolean],
        default: false
      },
      label: {
        type: [String, Number]
      },
      //显示文字，层级高于label，低于slot
      text:{
        type: [String, Number, Boolean],
        default:null
      },
      disabled: {
        type: Boolean,
        default: false
      },
      size: {
        validator (value) {
            return oneOf(value, ['small', 'large', 'default']);
        }
      },
      readonly: {
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
        group: false,
        parent: findComponentsUpward(this, 'RadioGroup'),
        isFocus: false,
        viewValue: this.text||this.value,
      };
    },
    computed: {
      showBtnIcon () {
        if (this.parent) {
          if (this.parent.type == 'button' && !!this.parent.btnIcon && this.parent.btnIconOnlyChecked) {
            return this.currentValue
          } else {
            return !!this.parent.btnIcon && this.parent.type == 'button'
          }
        } else {
          return false
        }
      },
      wrapClasses () {
        return [
          `${prefixCls}-wrapper`,
          {
            [`${prefixCls}-group-item`]: this.group,
            [`${prefixCls}-wrapper-checked`]: this.currentValue,
            [`${prefixCls}-wrapper-disabled`]: this.disabled,
            [`${prefixCls}-${this.size}`]: !!this.size
          }
        ];
      },
      radioClasses () {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-checked`]: this.currentValue,
            [`${prefixCls}-disabled`]: this.disabled,
            [`${prefixCls}-btnIcon`]: this.showBtnIcon
          }
        ];
      },
      innerClasses () {
          return [
            `${prefixCls}-inner`,
            {
              [`${prefixCls}-inner-focus`]: this.isFocus,
            }
          ];
      },
      inputClasses () {
          return `${prefixCls}-input`;
      }
    },
    mounted () {
      if (this.parent) this.group = true;
      if (!this.group) {
          this.updateValue();
      } else {
          this.parent.updateValue();
      }
    },
    methods: {
      change (event) {
        if (this.disabled) {
            return false;
        }
        const checked = event.target.checked;
        this.currentValue = checked;

        let value = checked ? this.trueValue : this.falseValue;
        this.$emit('input', value);
        if (this.group && this.label !== undefined) {
          this.parent.change({
            value: this.label,
            checked: this.value
          });
        }
        if (!this.group) {
          this.$emit('on-change', value);
          this.dispatch('FormItem', 'on-form-change', value);
        }
      },
      radioClick(){
        this.$emit('on-click')
        this.dispatch('RadioGroup', 'on-group-click')
      },
      updateValue () {
        this.currentValue = this.value === this.trueValue;
      },
      focus(event) {
        this.$refs.input.focus();
        this.isFocus = true;
        this.$emit('on-focus', event)
      },
      blur(event) {
        this.$refs.input.blur();
        this.isFocus = false;
        this.$emit('on-blur', event)
      },
      getTabIndex() {
        let tabindex = this.tabindex;
        if (("" + tabindex) === "0") {
          if (this.parent) {
            if (("" + this.parent.tabindex) !== "0") {
              tabindex = this.parent.tabindex
            }
          }
        }
        return tabindex
      }
    },
    watch: {
      value (val) {
        if (val !== this.trueValue && val !== this.falseValue) {
          throw 'Value should be trueValue or falseValue.';
        }
        this.updateValue();
      },
      currentValue(val) {
        this.viewValue = this.text||val
      }
    }
  };
</script>
