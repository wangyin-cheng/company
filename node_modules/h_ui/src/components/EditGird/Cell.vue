<template>
  <!-- :tabindex="row._rowKey+column._columnKey" -->
  <div :class="classes"
       ref="cell"
       v-clickoutside="handleClose">
    <div v-if="!hiddenOther"
         :style="renderSty"
         @dblclick="dblclickCurrentCell($event)"
         class="dbClass"
         :class="innerClass">
      <template v-if="showSlot">
        <slot></slot>
      </template>
      <template v-if="renderType === 'index'">
        <span v-if="typeName!='treeGird'">{{naturalIndex + 1}}</span>
        <span v-else>{{Number(row._index)+1}}</span>
      </template>
      <template v-if="renderType === 'selection'">
        <Checkbox :value="checked"
                  @click.native.stop="handleClick"
                  @on-change="toggleSelect"
                  :disabled="disabled"></Checkbox>
      </template>
      <template v-if="renderType === 'radio'">
        <Radio :value="radioChecked"></Radio>
      </template>
      <template v-if="renderType === 'normal'">
        {{preLabel}}
        <span v-html="normalDate"
              :title="column.showTooltip ? normalDate : ''">
        </span>
        {{rearLabel}}
      </template>
      <template v-if="renderType === 'text'">
        <h-input v-model="columnText"
                 :placeholder="column.placeholder"
                 :icon="column.icon"
                 :filterRE="column.filterRE"
                 class="canEdit"
                 @on-change="editinputChange"
                 @on-blur="editinputBlur"></h-input>
      </template>
      <template v-if="renderType === 'textArea'">
        <textarea :value="columnArea"
                  :placeholder="column.placeholder"
                  :rows="column.rows"
                  :class="areaClass"
                  @input="editAreaChange"
                  @blur="editAreaBlur"></textarea>
      </template>
      <template v-if="renderType === 'number'">
        <h-input v-model="columnNumber"
                 class="canEdit"></h-input>
      </template>
      <template v-if="renderType === 'money'">
        <Typefield :value="columnMoney"
                   ref="money"
                   :placeholder="column.placeholder"
                   :integerNum="column.integerNum || '10'"
                   :suffixNum="column.suffixNum"
                   :bigTips="column.bigTips || false"
                   :isround="column.isround || false"
                   :nonNegative="column.nonNegative"
                   :divided="column.divided"
                   :immeDivided="column.immeDivided"
                   @input="typefieldChange"
                   @on-blur="typefieldBlur"
                   transfer
                   class="canEdit"></Typefield>
      </template>
      <template v-if="renderType === 'card'">
        <Typefield v-model="columnCard"
                   type="cardNo"
                   class="canEdit"></Typefield>
      </template>
      <template v-if="renderType === 'select'">
        <h-select v-model="columnSelect"
                  ref="select"
                  :placeholder="column.placeholder"
                  :placement="column.placement"
                  :dropWidth="column.dropWidth"
                  :not-found-text="column.notFoundText"
                  :multiple="column.multiple || false"
                  :filterable="column.filterable||false"
                  :filterMethod="filterMethod()"
                  :remote="column.remote || false"
                  :remoteMethod="remoteMethod()"
                  :loading="column.loading"
                  :transfer="column.transfer"
                  :isString="column.multiple||false"
                  :label-in-value="column.multiple|| column.singleShowLabel || false"
                  :autoPlacement="column.autoPlacement === undefined ? true : column.autoPlacement"
                  @on-change="editselectChange"
                  class="canEdit">
          <h-option v-for="(item,i) in option"
                    :key="i"
                    :value="item.value"
                    :label="item.label">{{item.label}}</h-option>
        </h-select>
      </template>
      <template v-if="renderType === 'date'">
        <Date v-model="columnDate"
              ref="date"
              :type="column.dateType||'date'"
              :format="column.format||'yyyy-MM-dd'"
              :placeholder="column.placeholder"
              :placement="column.placement"
              :editable="column.editable"
              :showFormat="true"
              :transfer="column.transfer"
              :autoPlacement="column.autoPlacement === undefined ? true : column.autoPlacement"
              @on-change="editdateChange"
              class="canEdit"></Date>
      </template>
      <template v-if="renderType === 'time'">
        <h-time v-model="columnTime"
                ref="time"
                :type="column.timeType||'time'"
                :placement="column.placement"
                :format="column.format||'yyyy-MM-dd'"
                :placeholder="column.placeholder"
                :editable="column.editable"
                :steps="column.steps||[]"
                :transfer="column.transfer"
                class="canEdit"></h-time>
      </template>
      <template v-if="renderType === 'selectTree'">
        <SelectTree v-model="columnTree"
                    ref="tree"
                    :firstValue="firstTreeValue"
                    :data="baseData"
                    :placeholder="column.placeholder"
                    :showCheckbox="column.showCheckbox"
                    :checkStrictly="column.checkStrictly"
                    :clearable="true"
                    :filterable="true"
                    :transfer="column.transfer"
                    class="canEdit">
        </SelectTree>
      </template>
       <template v-if="renderType === 'cascader'">
        <Cascader v-model="columnCascader"
                  ref="cascader"
                  :data="cascaderOption"
                  :placeholder="column.placeholder"
                  :render-format="column.renderFormat"
                  :clearable="true"
                  :multiple="column.multiple || false"
                  :transfer="column.transfer"
                  :trigger="column.trigger"
                  class="canEdit">

        </Cascader>
      </template>
      <template v-if="renderType === 'expand' && !row._disableExpand">
        <div :class="expandCls"
             @click="toggleExpand($event)">
          <Icon name="enter"></Icon>
        </div>
      </template>
    </div>
    <Cell v-if="render&&renderType != 'expand'"
          :row="row"
          :column="column"
          :index="index"
          :render="column.render"></Cell>
    <transition name="fade">
      <div class="verify-tip verify-bottom"
           v-if="validateState === 'error'"
           ref="verifyTip">
        <div class="verify-tip-arrow"></div>
        <div class="verify-tip-inner">{{validateMessage}}</div>
      </div>
    </transition>
  </div>
</template>
<script>
import AsyncValidator from 'async-validator'
import Cell from './expand'
import Icon from '../Icon/Icon.vue'
import Checkbox from '../Checkbox/Checkbox.vue'
import hInput from '../Input'
import InputNumber from '../InputNumber/InputNumber.vue'
import Typefield from '../Typefield/Typefield.vue'
import hSelect from '../Select'
import SelectTree from '../SelectTree/SelectTree.vue'
import Date from '../DatePicker'
import hTime from '../TimePicker'
import Radio from '../Radio'
import Cascader from '../Cascader/index.js'
import clickoutside from '../../directives/clickoutside'
import {
  addClass,
  removeClass,
  findComponentsUpward,
  deepCopy,
  getYMD,
  getHMS,
  typeOf
} from '../../util/tools.js'
import Emitter from '../../mixins/emitter'

const hOption = hSelect.Option
const hOptionGroup = hSelect.OptionGroup

export default {
  name: 'GirdCell',
  mixins: [Emitter],
  directives: { clickoutside },
  components: {
    Icon,
    Checkbox,
    Cell,
    hInput,
    InputNumber,
    Typefield,
    hSelect,
    hOption,
    hOptionGroup,
    SelectTree,
    Date,
    hTime,
    Radio,
    Cascader
  },
  props: {
    prefixCls: String,
    row: Object,
    column: Object,
    parent: Object,
    naturalIndex: Number, // index of rebuildData
    columnIndex: Number,
    index: [Number, String], // _index of data
    checked: Boolean,
    // 单选选中
    radioChecked: Boolean,
    disabled: Boolean,
    expanded: Boolean,
    showEditInput: Boolean,
    typeName: String,
    option: Array,
    treeOption: Array,
    cascaderOption: Array,
    fixed: {
      type: [Boolean, String],
      default: false
    },
    height: Number
  },
  data() {
    return {
      renderType: '',
      normalDate: this.row[this.column.key],
      columnText: this.row[this.column.key],
      columnArea: this.row[this.column.key],
      columnNumber: this.row[this.column.key],
      columnMoney: this.row[this.column.key],
      columnCard: this.row[this.column.key],
      columnDate: this.row[this.column.key],
      columnTime: this.row[this.column.key],
      columnSelect: this.row[this.column.key],
      columnTree: '',
      columnCascader: this.row[this.column.key],
      firstTreeValue: this.row[this.column.key],
      uid: -1,
      context: this.parent.currentContext,
      showSlot: true,
      validateState: '',
      validateMessage: '',
      rule: null,
      baseData: [],
      render: false,
      hiddenOther: false,
      currentSelect: [], // 当前选中值
      selectedLabel: [], // 保存当前select label值
      isSelectTrans: true, //是否将多选value转为label显示，watch normalDate时防止二次执行watch操作
      rearLabel: null,
      preLabel: null
    }
  },
  computed: {
    renderSty() {
      let style = {}
      let typeWidth = this.column.typeWidth
      if (typeWidth) {
        style.width = this.render ? typeWidth + 'px' : '100%'
      } else {
        style.width = this.render ? '70' : '100%'
      }
      return style
    },
    classes() {
      return [
        `${this.prefixCls}-cell`,
        {
          [`${this.prefixCls}-hidden`]:
            !this.fixed &&
            this.column.fixed &&
            (this.column.fixed === 'left' || this.column.fixed === 'right'),
          [`${this.prefixCls}-cell-error`]: this.validateState === 'error',
          [`${this.prefixCls}-cell-with-expand`]: this.renderType === 'expand',
          [`${this.prefixCls}-cell-with-render`]: this.render && this.renderType != 'expand',
          [`${this.prefixCls}-cell-ellipsis-with-render`]: this.ellipsisAndRender
        }
      ]
    },
    innerClass() {
      return {
        [`${this.prefixCls}-cell-ellipsis`]: this.column.ellipsis || false
      }
    },
    expandCls() {
      return [
        `${this.prefixCls}-cell-expand`,
        {
          [`${this.prefixCls}-cell-expand-expanded`]: this.expanded
        }
      ]
    },
    areaClass() {
      return [
        'canEdit h-input',
        {
          ['h-input-disabled']: this.column.disabled,
          ['h-input-noresize']: !this.column.canResize
        }
      ]
    },
    ellipsisAndRender() {
      return this.column.ellipsis && this.render && this.renderType != 'expand'
    }
  },
  methods: {
    handleClose() {
      if (this.showEditInput || this.validateState == 'error') return
      if (
        this.column.type === 'index' ||
        this.column.type === 'selection' ||
        this.column.type === 'expand' ||
        this.column.type === 'radio'
      ) {
        this.renderType = this.column.type
      } else {
        this.renderType = 'normal'
      }
      this.showSlot = true
    },
    toggleSelect() {
      this.parent.toggleSelect(this.index)
    },
    toggleExpand(e) {
      if (this.typeName == 'groupTable') {
        this.parent.toggleExpandChild(this.index, e)
      } else {
        this.parent.toggleExpand(this.index, e)
      }
    },
    handleClick() {
      // 放置 Checkbox 冒泡
    },
    addBg() {
      if (this.checked) {
        addClass(this.$parent, `${this.prefixCls}-row-hover`)
      } else {
        removeClass(this.$parent, `${this.prefixCls}-row-hover`)
      }
    },
    save(str) {
      this.$nextTick(() => {
        var _parent = this.parent
        if (!_parent.cloneData || _parent.cloneData.length == 0) return
        switch (str) {
          case 'text':
            this.normalDate = this.columnText
            _parent.cloneData[this.index][this.column.key] = this.columnText
            break
          case 'textArea':
            this.normalDate = this.columnArea
            _parent.cloneData[this.index][this.column.key] = this.columnArea
            break
          case 'number':
            this.normalDate = this.columnNumber
            _parent.cloneData[this.index][this.column.key] = this.columnNumber
            this.syncRebuildData()
            break
          case 'money':
            this.normalDate = this.columnMoney
            _parent.cloneData[this.index][this.column.key] = this.columnMoney
            break
          case 'card':
            this.normalDate = this.columnCard
            _parent.cloneData[this.index][this.column.key] = this.columnCard
            this.syncRebuildData()
            break
          case 'select':
            if (this.column.multiple || this.column.singleShowLabel)
              this.isSelectTrans = true
            this.normalDate = this.columnSelect
            _parent.cloneData[this.index][this.column.key] = this.columnSelect
            this.syncRebuildData()
            break
          case 'date':
            this.normalDate = this.columnDate
            _parent.cloneData[this.index][this.column.key] = this.columnDate
            this.syncRebuildData()
            break
          case 'time':
            this.normalDate = this.columnTime
            _parent.cloneData[this.index][this.column.key] = this.columnTime
            this.syncRebuildData()
            break
          case 'selectTree':
            this.normalDate = this.columnTree
            if (!_parent.cloneData[this.index]) return
            _parent.cloneData[this.index][this.column.key] = this.columnTree
            this.syncRebuildData()
            break
          case 'cascader':
            this.normalDate = this.columnCascader
            // this.normalDate = this.$refs.cascader.displayRender // 类似于selectValToLabel
            _parent.cloneData[this.index][this.column.key] = this.columnCascader
            this.syncRebuildData()
            break
        }
        if (this.rule) {
          this.validate('blur')
        }
      })
    },
    dblclickCurrentCell(e) {
      if (this.typeName != 'groupTable') {
        e.stopPropagation()
      }
      if (this.showEditInput) return
      if (
        !this.column.type ||
        this.column.type === 'html' ||
        this.column.type === 'index' ||
        this.column.type === 'selection'
      ) {
        return false
      } else {
        this.showSlot = false
        this.renderType = this.column.type
        this.$nextTick(() => {
          var inputEl =
            this.$refs.cell.querySelector('input') ||
            this.$refs.cell.querySelector('textarea')
          if (!inputEl) return
          inputEl.focus()
        })
      }
    },
    getFilteredRule(trigger) {
      // rule 为对象或数组
      let rules = [].concat(this.rule)
      rules = rules.map(item => {
        if (item.test) {
          item.pattern = item.test
        }
        return item
      })

      return rules.filter(
        rule => !rule.trigger || rule.trigger.indexOf(trigger) !== -1
      )
    },
    validate(trigger, callback = function() {}) {
      const rules = this.getFilteredRule(trigger)
      if (!rules || rules.length === 0) {
        callback()
        return true
      }
      this.validateState = 'validating'
      let descriptor = {}
      descriptor['name'] = rules
      const validator = new AsyncValidator(descriptor)
      let model = {}
      model['name'] = this.normalDate
      validator.validate(model, { firstFields: true }, errors => {
        this.validateState = !errors ? 'success' : 'error'
        this.validateMessage = errors ? errors[0].message : ''
        callback(this.validateMessage)
      })
    },
    filterMethod() {
      if (this.column.filterMethod) {
        return this.column.filterMethod
      }
    },
    remoteMethod() {
      if (this.column.remoteMethod) {
        return this.column.remoteMethod
      }
    },
    editselectChange(val) {
      this.currentSelect = this.column.singleShowLabel ? [val] : val
      this.$emit('on-editselect-change', val, this.columnIndex, this.index)
    },
    editdateChange(val) {
      this.$emit('on-editdate-change', val, this.columnIndex, this.index)
    },
    editinputChange() {
      this.$emit(
        'on-editinput-change',
        this.columnText,
        this.columnIndex,
        this.index
      )
    },
    editinputBlur() {
      this.syncRebuildData()
      this.$emit(
        'on-editinput-blur',
        this.columnText,
        this.columnIndex,
        this.index
      )
    },
    editAreaChange(event) {
      let value = event.target.value
      if (this.column.filterRE) {
        value = value.replace(this.column.filterRE, '')
        event.target.value = value
      }
      this.columnArea = value
      this.$emit(
        'on-editarea-change',
        this.columnArea,
        this.columnIndex,
        this.index
      )
    },
    editAreaBlur() {
      this.syncRebuildData()
      this.$emit(
        'on-editarea-blur',
        this.columnArea,
        this.columnIndex,
        this.index
      )
    },
    setvisible() {
      ['select', 'date', 'time', 'tree'].forEach(item => {
        if (this.$refs[item] && this.$refs[item].visible) {
          this.$refs[item].visible = false
        }
      })
      if(this.$refs.money&&this.$refs.money.tipShow){
        this.$refs.money.tipShow = false
      }
    },
    strtoArr(val) {
      if (val == '' || val == ' ' || val == null || val == undefined) {
        return []
      } else if (val.length > 0 && val.indexOf(',') == -1) {
        return new Array(val)
      } else {
        return val.split(',')
      }
    },
    arrtoStr(val) {
      if (val.length == 0) {
        return ''
      } else {
        return val.join(',')
      }
    },
    initValToLabel() {
      // 支持单选显示
      if (
        (this.column.multiple || this.column.singleShowLabel) &&
        this.column.type == 'select' &&
        this.renderType == 'normal' &&
        this.option &&
        this.option.length > 0
      ) {
        this.selectedLabel = []
        let selectedArr = this.strtoArr(this.columnSelect)
        for (let i = 0; i < selectedArr.length; i++) {
          for (let j = 0; j < this.option.length; j++) {
            if (selectedArr[i] == this.option[j].value) {
              this.selectedLabel.push(this.option[j].label)
            }
          }
        }
        this.isSelectTrans = false
        this.normalDate =
          this.selectedLabel.length == 0 && this.normalDate
            ? this.normalDate
            : this.arrtoStr(this.selectedLabel)
      }
    },
    selectValToLabel() {
      // 多选情况下value与label的转换(显示label)
      //  支持单选
      if (
        (this.column.multiple || this.column.singleShowLabel) &&
        this.option &&
        this.option.length > 0 &&
        this.isSelectTrans &&
        this.column.type == 'select' &&
        this.renderType == 'normal'
      ) {
        // 多选情况下显示label
        this.selectedLabel = []
        for (let i = 0; i < this.currentSelect.length; i++) {
          this.selectedLabel.push(this.currentSelect[i].label)
        }
        this.isSelectTrans = false
        this.normalDate =
          this.selectedLabel.length == 0 && this.normalDate
            ? this.normalDate
            : this.arrtoStr(this.selectedLabel)
      }
    },
    typefieldChange(val) {
      if (this.column.divided) {
        let value = this.$refs.money.inputValue
        this.columnMoney = value
      } else {
        this.columnMoney = val
      }
    },
    typefieldBlur() {
      this.syncRebuildData()
      this.$emit(
        'on-typefield-blur',
        this.columnMoney,
        this.columnIndex,
        this.index
      )
    },
    /**
     * 同步单元格编辑内容到rebuildData
     */
    syncRebuildData() {
      const data = this.parent.rebuildData
      if(this.typeName === 'editGird') return
      if (this.row[this.column.key] === this.normalDate) return
      if (!Array.isArray(data) || data.length === 0) return
      const find = (rows, id) => {
        if (!Array.isArray(rows) || rows.length === 0) return null
        let matched = null
        rows.some(row => {
          if (row.id === id) {
            matched = row
          } else {
            matched = find(row.children, id)
          }
          return matched !== null
        })
        return matched
      }
      let row = find(data, this.row.id)
      if (row) {
        row[this.column.key] = this.normalDate
      }
    }
  },
  watch: {
    columnTree(val) {
      this.$emit('on-selecttree-change', val)
      this.save('selectTree')
    },
    columnTime() {
      this.save('time')
    },
    columnDate() {
      this.save('date')
    },
    columnSelect() {
      this.save('select')
    },
    columnCard() {
      this.save('card')
    },
    columnMoney(val) {
      this.$emit('on-typefield-change', val, this.columnIndex, this.index)
      this.save('money')
    },
    columnNumber() {
      this.save('number')
    },
    columnArea(val) {
      this.save('textArea')
    },
    columnText() {
      this.save('text')
    },
    columnCascader () {
      this.save('cascader')
    },
    validateState(val) {
      if (val == 'error') {
        this.$nextTick(() => {
          if (this.$refs.verifyTip) {
            let fyTip = this.$refs.verifyTip
            let canEdit = fyTip.parentNode.querySelectorAll('.canEdit')[0]
            let left =
              canEdit.offsetLeft -
              this.parent.$el.querySelector('.h-editgird-body').scrollLeft
            let top =
              canEdit.offsetTop +
              canEdit.getBoundingClientRect().height -
              this.parent.$el.querySelector('.h-editgird-body').scrollTop
            fyTip.style.left = left + 'px'
            fyTip.style.top = top + 'px'
            // 初始校验不通过，提示显示表格外部问题
            if (top >= this.height) {
              fyTip.style.display = 'none'
            }
          }
        })
      }
    },
    treeOption(val) {
      this.baseData = deepCopy(val)
    },
    renderType(val) {
      // 多选情况下value与label的转换(显示label)
      if (this.column.type == 'select') this.selectValToLabel()
    },
    option: {
      // option服务端传入，初始化无值
      handler(val) {
        if (val && val.length > 0) {
          this.initValToLabel()
        }
      },
      deep: true
    },
    row: {
      deep: true,
      handler(newRow) {
        const key = this.column.key
        const val = newRow[key]
        if (val !== this.normalDate) {
          this.normalDate = val
          this.columnText = val
          this.columnArea = val
          this.columnNumber = val
          this.columnMoney = val
          this.columnCard = val
          this.columnDate = val
          this.columnTime = val
          this.columnSelect = val
          this.columnTree = val
          this.columnCascader = val
        }
      }
    }
  },
  created() {
    if (!this.column.type || this.column.type === 'html') {
      this.renderType = 'normal'
    } else {
      if (
        !this.showEditInput &&
        this.column.type !== 'index' &&
        this.column.type !== 'selection' &&
        this.column.type !== 'expand' &&
        this.column.type !== 'radio'
      ) {
        this.renderType = 'normal'
      } else {
        this.renderType = this.column.type
      }
    }

    if (this.column.type === 'selectTree') {
      this.baseData = deepCopy(this.treeOption)
    }

    this.render = this.column.render ? true : false
    this.hiddenOther = this.column.hiddenOther ? true : false

    if (this.renderType !== 'normal' && this.column.rule) {
      if ((this.column.fixed === 'left' && this.$parent.$parent.fixed === 'left')
      || (this.column.fixed === 'right' && this.$parent.$parent.fixed === 'right')
      || (this.column.fixed !== 'left' && this.column.fixed !== 'right' && !this.$parent.$parent.fixed) ) {
        this.dispatch('EditGird', 'on-rule-cell-add', this)
      }
    }
  },
  mounted() {
    let index = this.index
    this.rule = this.column.rule
    if (this.column.rearlabel) {
      this.rearLabel = this.column.rearlabel(this.index) || null
    }
    if (this.column.prelabel) {
      this.preLabel = this.column.prelabel(this.index) || null
    }
    this.$on('close-visible', () => {
      this.setvisible()
    })
    // 注册全局事件供 editGrid 调用
    this.$on('validate', callback => {
      if (this.rule) this.validate('blur', callback)
    })
  },
  beforeDestroy() {
    if (this.renderType !== 'normal' && this.column.rule) {
      if ((this.column.fixed === 'left' && this.$parent.$parent.fixed === 'left')
      || (this.column.fixed === 'right' && this.$parent.$parent.fixed === 'right')
      || (this.column.fixed !== 'left' && this.column.fixed !== 'right' && !this.$parent.$parent.fixed) ) {
        this.dispatch('EditGird', 'on-rule-cell-remove', this)
      }
    }
  }
}
</script>
