<template>
  <label :class="wrapClasses">
    <span :class="checkboxClasses">
      <span :class="innerClasses"></span>
      <input
        v-if="group"
        ref="input"
        type="checkbox"
        :class="inputClasses"
        :disabled="disabled"
        @focus="focus"
        @blur="blur"
        :value="label"
        v-model="model"
        @change="change"
        @click="click($event)">
      <input
        v-if="!group"
        ref="input"
        type="checkbox"
        @focus="focus"
        @blur="blur"
        :class="inputClasses"
        :disabled="disabled"
        :checked="currentValue"
        @change="change"
        :tabindex="tabindex"
        @click="click($event)">
    </span>
    <slot><span v-if="showSlot">{{ text||label }}</span></slot>
  </label>
</template>
<script>
  import { findComponentsUpward, oneOf } from '../../util/tools';
  import Emitter from '../../mixins/emitter';

  const prefixCls = 'h-checkbox';

  export default {
    name: 'Checkbox',
    mixins: [ Emitter ],
    props: {
      tabindex: {
        type: [String, Number],
        default: "0",
        validator(value) {
          let num = parseInt(value);
          return num <= 32767 && num >= -1;
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
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
        type: [String, Number, Boolean]
      },
      indeterminate: {
        type: Boolean,
        default: false
      },
      size: {
        validator (value) {
          return oneOf(value, ['small', 'large', 'default']);
        }
      },
      notGroup:{
        type: Boolean,
        default: false
      },
      //显示文字，层级高于label，低于slot
      text:{
        type: [String, Number, Boolean],
        default:null
      },
    },
    data () {
      return {
        model: [],
        currentValue: this.value,
        group: false,
        showSlot: true,
        parent: findComponentsUpward(this, 'CheckboxGroup'),
        isFocus: false,
        viewValue:this.value
      };
    },
    computed: {
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
      checkboxClasses () {
        return [
          `${prefixCls}`,
          {
              [`${prefixCls}-checked`]: this.currentValue,
              [`${prefixCls}-disabled`]: this.disabled,
              [`${prefixCls}-indeterminate`]: this.indeterminate
          }
        ];
      },
      innerClasses () {
        return  [
          `${prefixCls}-inner`,
          {
            [`${prefixCls}-inner-focus`]: this.isFocus&&window.isO45,
          }
        ];
      },
      inputClasses () {
        return `${prefixCls}-input`;
      }
    },
    mounted () {
      this.parent = findComponentsUpward(this, 'CheckboxGroup');
      if (this.parent) this.group = true;
      if (this.notGroup) this.group = false;
      if (!this.group) {
          this.updateModel();
          this.showSlot = this.$slots.default !== undefined;
      } else {
          this.parent.updateModel(true);
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
          if (this.group) {
            this.parent.change(this.model);
          } else {
            this.$emit('on-change', value,event);
            this.dispatch('FormItem', 'on-form-change', value);
          }
      },
      updateModel () {
          this.currentValue = this.value === this.trueValue;
      },
      click(e){
        this.$emit('on-click',e);
      },
      focus(e) {
        this.$refs.input.focus();
        this.isFocus = true;
        this.$emit('on-focus', e)
      },
      blur(e) {
        this.$refs.input.blur();
        this.isFocus = false;
        this.$emit('on-blur', e)
      }
    },
    watch: {
      value (val) {
          if (val !== this.trueValue && val !== this.falseValue) {
              throw 'Value should be trueValue or falseValue.';
          }
          this.updateModel();
      },
      currentValue(val){
        this.viewValue = val
      }
    }
  };
</script>
