<template>
  <input
  ref="inputEl"
  v-model="inputValue"
  :class="classes"
  :readonly="readonly"
  :disabled="disabled"
  :tabindex="tabindex"
  @input="val"
  @blur="blur"
  @focus="focuser"
  @keydown="changeValue"
  @mousewheel="handleMouseWheel"
   />
</template>
<script>
import Emitter from '../../mixins/emitter'
const prefixCls = 'h-fast-date-input'
export default {
  name: 'DateInput',
  mixins: [Emitter],
  props: {
    value: {
      type: [String,Number]
    },
    type:{
      type:String
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tabindex: {
      type: [String, Number],
      default: "-1",
      validator(value) {
        let num = parseInt(value);
        return num <= 32767 && num >= -1;
      }
    }
  },
  data(){
    return{
      currentValue: this.value,
      inputValue: '',
      curYear:(new Date()).getFullYear(),
      isFocus:false,
    }
  },
  computed:{
    classes(){
      return [`${prefixCls}`]
    },
  },
  methods: {
    val(event){
      let value = event.target.value.trim();
      let pos = value.length
      if (/^\d+$/.test(value)||!value) {
        this.currentValue = value;
      } else {
        event.target.value = this.currentValue;
        value = this.currentValue;
      }
      if (this.type == 'year') {
        if (pos==4) {
          this.$emit('on-change-focus');
        }
      }
      if (this.type == 'months') {
        if (pos>2 ||Number(value)>12||value =='00') {
          value = value.substr(-1)
          event.target.value = value
        }else if (pos==2) {
          this.$emit('on-change-focus');
        }
      }
      if (this.type == 'day') {
        if (pos>2 ||Number(value)>31||value =='00') {
          value = value.substr(-1)
          event.target.value = value
        }else if (pos==2){
          this.$emit('on-change-focus');
        }
      }
      this.inputValue = value;
      this.$emit('input', this.inputValue);
    },
    blur(event){
      this.isFocus = false;
      this.$emit('blur', event);
      this.dispatch('FormItem', 'on-form-blur')
    },
    focuser(event){
      this.isFocus = true;
      this.$emit('focus', event);
      this.dispatch('FormItem', 'on-form-focus')
    },
    focus(){
      this.$refs.inputEl.focus();
    },
    changeValue(event){
      if(this.readonly) return;
      let code = event.keyCode
      // let curValue;
      if (code == 38){
        event.stopPropagation()
        this.decValue();
      }
      if(code == 40){
        event.stopPropagation()
        this.addValue();
      }
      this.$emit('input', this.inputValue);
    },
    decValue(){
      let curValue = Number(this.inputValue)+1;
      switch(this.type){
        case 'year':
          if (!this.inputValue) curValue = this.curYear;
          this.inputValue = curValue<1?this.curYear:curValue;
          break;
        case 'months':
          this.inputValue = curValue>12?1:curValue;
          break;
        case 'day':
          this.inputValue = curValue>31?1:curValue;
          break;
      }
    },
    addValue(){
      let curValue = Number(this.inputValue)-1;
      switch(this.type){
        case 'year':
          if (!this.inputValue) curValue = this.curYear;
          this.inputValue = curValue;
          break;
        case 'months':
          this.inputValue = curValue<1?12:curValue;
          break;
        case 'day':
          this.inputValue = curValue<1?31:curValue;
          break;
      }
    },
    handleMouseWheel(event){
      if(this.disabled || this.readonly) return false
      event.preventDefault();
      if(!this.isFocus) return;
      let value = event.target.value;
      const deltaX = event.wheelDelta;
      if(deltaX>0){
        this.decValue();
      }else{
        this.addValue();
      }
       this.$emit('input', this.inputValue);
    }
  },
  watch:{
    value(val){
      this.inputValue = val;
    }
  },
  mounted(){
    this.inputValue = this.value;
  },
};
</script>
