<template>
  <div :class="wrapClasses">
    <template v-if="type !== 'textarea'">
      <div :class="[prefixCls + '-group-prepend']"
           v-if="prepend"
           v-show="slotReady">
        <slot name="prepend"></slot>
      </div>
      <Icon name="close" :style="clearstyle"
            :class="[prefixCls + '-icon',prefixCls + '-clear']"
            v-if="clearable&&type!='textarea'" v-show="hasvalue"
            @on-click="handleClear"></Icon>
      <Icon :name="icon"
            :class="[prefixCls + '-icon',prefixCls + '-icon-normal']" :style="iconStyle"
            v-if="icon&&type!='textarea'"
            @on-click="handleIconClick"></Icon>
      <transition name="fade">
        <Icon name="load-c"
              class="h-icon h-load-loop"
              :class="[prefixCls + '-icon', prefixCls + '-icon-validate']"
              v-if="!icon"></Icon>
      </transition>
      <input ref="input"
             :type="type"
             :class="inputClasses"
             :placeholder="placeholder"
             :disabled="disabled"
             :maxlength="maxlength"
             :readonly="autocomplete === 'off' || autocomplete === 'on' && (!editable || readonly)"
             :name="name"
             :value="currentValue"
             :title="type!=='password'?currentValue:null"
             :number="number"
             :autofocus="autofocus"
             :spellcheck="spellcheck"
             :autocomplete="autocomplete"
             :style="inputStyle"
             :tabindex="tabindex"
             @keyup.enter="handleEnter"
             @keyup="handleKeyup"
             @keypress="handleKeypress"
             @keydown="handleKeydown"
             @focus="handleFocus"
             @blur="handleBlur"
             @input="handleInputValue"
             @change="handleChange">
      <div :class="[prefixCls + '-group-append']"
           v-if="append"
           v-show="slotReady">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea v-else
              ref="textarea"
              :class="textareaClasses"
              :style="textareaStyles"
              :placeholder="placeholder"
              :disabled="disabled"
              :rows="rows"
              :maxlength="maxlength"
              :readonly="readonly"
              :name="name"
              :value="currentValue"
              :autofocus="autofocus"
              :spellcheck="spellcheck"
              :autocomplete="autocomplete"
              :tabindex="tabindex"
              @keyup.enter="handleEnter"
              @keyup="handleKeyup"
              @keypress="handleKeypress"
              @keydown="handleKeydown"
              @focus="handleFocus"
              @blur="handleBlur"
              @input="handleInputValue"
              @change="handleChange">
    </textarea>
    <div v-if="type=='password'&&strengthTip"
         :class="`${prefixCls}-tips`">
      <ul>
        <li>
          <div :class="weakClass"></div>
          {{this.t('i.input.weak')}}
        </li>
        <li>
          <div :class="generalClass"></div>
          {{this.t('i.input.general')}}
        </li>
        <li>
          <div :class="complexClass"></div>
          {{this.t('i.input.complex')}}
        </li>
      </ul>
    </div>
    <div v-if="showWordLimit" :class="[prefixCls + '-word-limit']">
     {{currentLength}}/{{maxlength}} {{limitTip}}
    </div>
  </div>
</template>
<script>
import { oneOf, findComponentsUpward } from '../../util/tools'
import calcTextareaHeight from '../../util/calcTextareaHeight'
import Emitter from '../../mixins/emitter'
import Locale from '../../mixins/locale'
import Icon from '../Icon/Icon.vue'

const prefixCls = 'h-input'

export default {
  name: 'Input',
  mixins: [Emitter, Locale],
  components: { Icon },
  props: {
    type: {
      validator(value) {
        return oneOf(value, ['text', 'textarea', 'password', 'int'])
      },
      default: 'text'
    },
    value: {
      type: [String, Number],
      default: ''
    },
    size: {
      validator(value) {
        return oneOf(value, ['small', 'large', 'normal'])
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    maxlength: {
      type: Number
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: String,
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    rows: {
      type: Number,
      default: 2
    },
    readonly: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    name: {
      type: String
    },
    number: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    algin: {
      //金额组件内部显示
      type: String,
      default: 'left'
    },
    strengthTip: {
      type: Boolean,
      default: false
    },
    tipState: {
      type: String,
      default: null
    },
    spellcheck: {
      type: Boolean,
      default: false
    },
    canResize: {
      type: Boolean,
      default: true
    },
    filterRE: {
      type: [Object, RegExp],
      default: null
    },
    specialFilter: {
      type: Boolean,
      default: false
    },
    specialLength: {
      type: [Number, String],
      default: 12
    },
    specialDecimal: {
      type: [Number, String],
      default: 2
    },
    lengthByByte: {
      type: Boolean,
      default: false
    }, // 是否按照字节计算长度
    byteNum:{//字节占位符
      type: [Number, String],
      default: 2
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    focusAllSelect: {
      type: Boolean,
      default: false
    },
    //键盘松开触发on-input事件
    keyUpMode: {
      type: Boolean,
      default: false
    },
    // 显示长度限制提示
    showWordLimit: {
      type: Boolean,
      default: false
    },
    clearable:{
      type:Boolean,
      default:false
    },
    limitTip:{
      type:String,
      default:''
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
  data() {
    return {
      currentValue: this.value,
      prefixCls: prefixCls,
      prepend: true,
      append: true,
      slotReady: false,
      textareaStyles: {},
      viewValue:this.value,
      hasvalue:false,
      /* 是否按下按键 */
      keyPressed: false
    }
  },
  computed: {
    wrapClasses() {
      return [
        `${prefixCls}-wrapper`,
        {
          [`${prefixCls}-wrapper-${this.size}`]: !!this.size,
          [`${prefixCls}-type`]: this.type != 'textarea',
          [`${prefixCls}-group`]: this.prepend || this.append,
          [`${prefixCls}-group-${this.size}`]:
            (this.prepend || this.append) && !!this.size,
          [`${prefixCls}-group-with-prepend`]: this.prepend,
          [`${prefixCls}-group-with-append`]: this.append,
          [`${prefixCls}-hide-icon`]: this.append // #554
        }
      ]
    },
    inputClasses() {
      return [
        `${prefixCls}`,
        `${prefixCls}-${this.algin}`,
        {
          [`${prefixCls}-${this.size}`]: !!this.size,
          [`${prefixCls}-disabled`]: this.disabled,
          [`${prefixCls}-readonly`]: this.readonly,
          [`${prefixCls}-editable`]: !this.editable
        }
      ]
    },
    textareaClasses() {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-disabled`]: this.disabled,
          [`${prefixCls}-noresize`]: !this.canResize
        }
      ]
    },
    weakClass() {
      return {
        [`${prefixCls}-tips-weak`]:
          this.tipState == 'weak' ||
          this.tipState == 'general' ||
          this.tipState == 'complex'
      }
    },
    generalClass() {
      return {
        [`${prefixCls}-tips-general`]:
          this.tipState == 'general' || this.tipState == 'complex'
      }
    },
    complexClass() {
      return {
        [`${prefixCls}-tips-complex`]: this.tipState == 'complex'
      }
    },
    /**
     * @description 当前输入字符 / 字节的长度
     */
    currentLength() {
      if (this.lengthByByte) {
        let bytesCount = 0
        for (var i = 0; i < this.value.length; i++) {
          var c = this.value.charAt(i)
          if (/^[\u0000-\u00ff]$/.test(c)) {
            //匹配双字节
            bytesCount += 1
          } else {
            bytesCount += this.byteNum
          }
        }

        return bytesCount
      }

      return this.value.length
    },
    iconStyle(){
      let style={};
      if(this.clearable){
        style.width=26+'px'
      }
      return style;
    },
    inputStyle(){
      let  style={};
      if(this.clearable){
        style.paddingRight=30+'px';
        if(this.icon){
          style.paddingRight=42+'px';
        }
      }
      return style;
    },
    clearstyle(){
      let style={}
      let right=this.icon?22:10
      style.right=right+'px'
      style.width='16px'
      return style
    }
  },
  methods: {
    handleEnter(event) {
      this.$emit('on-enter', event)
    },
    handleKeydown(event) {
      this.$emit('on-keydown', event)
      this.keyPressed = true;
    },
    handleKeypress(event) {
      this.$emit('on-keypress', event)
    },
    handleKeyup(event) {
      this.$emit('on-keyup', event)
      if (this.keyUpMode && this.keyPressed) {
        this.handleInput(event)
      }
      this.keyPressed = false;
    },
    handleIconClick(event) {
      this.$emit('on-click', event)
    },
    handleClear(event){
      this.currentValue='';
      this.$emit('input', "")
      this.$emit('on-input-change', event)
      this.$emit('on-clear',event)
    },
    handleFocus(event) {
      // IPMS 167437 屏蔽浏览器的记住密码功能，禁止密码回填或者点击选择
      // 这个功能本是浏览器的安全策略行为，如果要生效，需要 Web 端应用程序首次启动前关闭浏览器的记住密码设置
      if(this.editable && !this.readonly && this.autocomplete === "off") {
        this.$refs.input && this.$refs.input.removeAttribute("readonly")
      }
      if (this.focusAllSelect && this.type === 'text') {
        this.$refs.input.select()
      }
      if (this.focusAllSelect && this.type === 'textarea') {
        this.$refs.textarea.select()
      }
      if(this.currentValue!=""&&this.clearable){
        this.hasvalue=true;
      }
      this.$emit('on-focus', event)
      this.dispatch('FormItem', 'on-form-focus')
    },
    handleBlur(event) {
      let value = event.target.value

      if (this.specialFilter && value.charAt(value.length - 1) == '.') {
        value = value.replace('.', '')
        event.target.value = value
      }
      this.$emit('on-blur', event)
      if (
        !findComponentsUpward(this, [
          'HDatePicker',
          'DatePicker',
          'HTimePicker',
          'TimePicker',
          'HCascader',
          'Cascader',
          'HSearch',
          'Search'
        ])
      ) {
        this.dispatch('FormItem', 'on-form-blur', this.currentValue)
      }
      if(this.clearable){
        setTimeout(()=>{
          this.hasvalue=false
        }, 200);
      }
    },
    handleInputValue(event) {
      if (!this.keyUpMode || !this.keyPressed) {
        this.handleInput(event)
      }
    },
    handleInput(event) {
      let value = event.target.value
      if (this.number)
        value = Number.isNaN(Number(value)) ? value : Number(value)
      if (this.filterRE) {
        value = value.replace(this.filterRE, '')
        event.target.value = value
      }

      if (this.type === 'int') {
        if (isNaN(Number(value)) && value !== '-' ) {
          value = this.currentValue
        } else if (value !== '' && value !== '-') {
          value = value.replace(/[^\d-]/g, '').replace(/^(-?)0*/, '$1')
          value === '' && (value = '0')
        }

        event.target.value = value
      }

      if (this.specialFilter) {
        if (!isNaN(value) && Number(value) >= 0) {
          if (value.replace('.', '').length > this.specialLength) {
            value = this.currentValue
          }
          if (
            value.split('.')[1] &&
            value.split('.')[1].length > this.specialDecimal
          ) {
            value = this.currentValue
          }
          if(this.specialDecimal==0){
            value = value.replace('.', '')
          }
          value = value.replace('+', '')
        } else {
          value = this.currentValue
        }
        event.target.value = value
      }

      if (this.lengthByByte) {
        let bytesCount = 0
        for (var i = 0; i < value.length; i++) {
          var c = value.charAt(i)
          if (/^[\u0000-\u00ff]$/.test(c)) {
            //匹配双字节
            bytesCount += 1
          } else {
            bytesCount += this.byteNum
          }
          if (bytesCount > this.maxlength) {
            value = value.substr(0, i)
            event.target.value = value.substr(0, i)
            break
          }
        }
      }
      if(this.clearable){
        if(value!=''){
          this.hasvalue=true
        }else{
          this.hasvalue=false
        }
      }

      this.$emit('input', value)
      this.setCurrentValue(value)
      this.$emit('on-change', event)
    },
    handleChange(event) {
      this.$emit('on-input-change', event)
    },
    handleSelect(event) {
      console.log('sel')
    },
    setCurrentValue(value) {
      if (value === this.currentValue) return
      this.$nextTick(() => {
        this.resizeTextarea()
      })
      this.currentValue = value
      if (
        !findComponentsUpward(this, [
          'HDatePicker',
          'DatePicker',
          'HTimePicker',
          'TimePicker',
          'HCascader',
          'Cascader',
          'HSearch',
          'Search'
        ])
      ) {
        this.dispatch('FormItem', 'on-form-change', value)
      }
    },
    resizeTextarea() {
      const autosize = this.autosize
      if (!autosize || this.type !== 'textarea') {
        // 如果显示字符长度限制，则设置宽度为100%
        if (this.showWordLimit) {
          this.textareaStyles.minWidth = '100%'
        }

        return false
      }

      const minRows = autosize.minRows
      const maxRows = autosize.maxRows

      this.textareaStyles = calcTextareaHeight(
        this.$refs.textarea,
        minRows,
        maxRows
      )

      if (this.showWordLimit) {
        this.textareaStyles.minWidth = '100%'
      }
    },
    focus() {
      if (this.type === 'textarea') {
        this.$refs.textarea.focus()
      } else {
        this.$refs.input.focus()
      }
    },
    blur() {
      if (this.type === 'textarea') {
        this.$refs.textarea.blur()
      } else {
        this.$refs.input.blur()
      }
    },
    select() {
      if(this.type !== 'textarea') {
        this.$refs.input.select()
      }else {
        this.$refs.textarea.select()
      }
    }
  },
  watch: {
    value(val) {
      this.setCurrentValue(val)
    },
    currentValue(val){
      this.viewValue = val
    }
  },
  mounted() {
    if (this.type !== 'textarea') {
      this.prepend = this.$slots.prepend !== undefined
      this.append = this.$slots.append !== undefined
    } else {
      this.prepend = false
      this.append = false
    }
    this.slotReady = true
    this.resizeTextarea()
  }
}
</script>
