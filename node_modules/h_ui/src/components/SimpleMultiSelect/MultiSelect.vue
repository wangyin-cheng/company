<template>
  <div
    ref="container"
    v-click-outside="{trigger: 'mousedown', handler: onClickOutside}"
    :class="containerClass"
    @keydown="onContainerKeyDown"
  >
    <!-- 可视区域 -->
    <div ref="display" :title="title" :class="displayClass">
      <!-- 搜索输入框 -->
      <input
        ref="input"
        v-model="magicString"
        type="text"
        search="multiSelect"
        :tabindex="tabindex"
        :disabled="disabled"
        :readonly="readonly || !editable"
        :placeholder="placeholder || t('i.select.placeholder')"
        :class="[prefixCls + '-input']"
        style="width:100%"
        @focus="onInputFocus"
        @blur="onInputBlur"
        @keyup="onInputKeyup"
        @keydown="onInputKeydown"
        @paste="onInputPaste"
      />
      <!-- 下拉箭头图标 -->
      <Icon ref="arrowb" name="unfold" :class="[prefixCls + '-arrow']" @click.native.stop="onArrowClick"></Icon>
    </div>
    <!-- 下拉面板 -->
    <drop
      ref="dropdown"
      v-transfer-dom
      :show="isDropdownVisible"
      :animated="animated"
      :dropWidth="dropWidth"
      :maxDropWidth="maxDropWidth"
      :placement="placement"
      :autoPlacement="autoPlacement"
      :data-transfer="transfer"
      :widthAdaption="widthAdaption"
      :class="dropClass"
    >
      <div ref="content" :class="[`${prefixCls}-dropdown-noline-content`]">
        <div ref="blockWrapper" id="blockWrapper" :class="[prefixCls + '-dropdown-list']">
          <slot></slot>
        </div>
        <div v-show="loading" :class="[prefixCls + '-block-loading']">{{ loadingText || t('i.select.loading') }}</div>
      </div>
    </drop>
  </div>
</template>

<script>
import Emitter from "../../mixins/emitter";
import Locale from "../../mixins/locale";
import { SimpleMultiSelectApi } from "./Api";
import ClickOutside from "../../directives/clickoutside";
import TransferDom from "../../directives/transfer-dom";
import Drop from "./Dropdown.vue";
import Icon from "../Icon/Icon.vue";
import _ from "../..//util";
export default {
  components: { Drop, Icon },
  directives: { ClickOutside, TransferDom },
  mixins: [Emitter, Locale, SimpleMultiSelectApi],
  data() {
    return {
      prefixCls: "h-selectTable",
      isDropdownVisible: false, // 下拉面板是否处于可视状态
      selectedRecords: [], // 已选记录集合
      magicString: "", // 神奇的字符串，输入框的绑定，已选记录的快览，搜索的关键字
      model: [] // 组件双向绑定的值
    };
  },
  computed: {
    containerClass() {
      return [
        `${this.prefixCls}`,
        `${this.prefixCls}-multiple`,
        {
          [`${this.prefixCls}-visible`]: this.isDropdownVisible,
          [`${this.prefixCls}-disabled`]: this.disabled,
          [`${this.prefixCls}-readonly`]: this.readonly,
          [`${this.prefixCls}-editable`]: !this.editable
        }
      ];
    },
    displayClass() {
      return [`${this.prefixCls}-selection`];
    },
    dropClass() {
      return {
        ["h-select-dropdown-transfer"]: this.transfer,
        [this.prefixCls + "-multiple"]: this.transfer,
        ["h-auto-complete"]: true
      };
    },
    title() {
      if (this.tooltip === "") {
        // multiline titles implement
        // O45 给出的标准是每 48 个字符换行，不过不能出现同一个编号被分隔在两行的场景
        if (this.magicString.length <= 48) return this.magicString;
        else {
          let lastBrIndex = 0;
          let title = "";
          for (let index = 48; index < this.magicString.length; index++) {
            const char = this.magicString.charAt(index);
            if (char !== ",") continue;
            else if (index - lastBrIndex >= 48) {
              title += lastBrIndex > 0 ? "\n" : "";
              title += this.magicString.slice(lastBrIndex, index + 1);
              lastBrIndex = index + 1;
            }
          }
          title += "\n" + this.magicString.slice(lastBrIndex);
          return title;
        }
      } else {
        return this.tooltip;
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (typeof newVal === "string") {
          newVal = newVal === "" ? [] : newVal.split(",");
        }
        this.model = newVal;
      }
    },
    model(newVal) {
      if (this.blockVm) {
        const selectedRecords = [];
        for (const value of newVal) {
          const matched = this.blockVm.blockData.filter(item => item.value === value);
          if (matched.length) {
            for (const blockRecord of matched) {
              if (selectedRecords.some(item => item.label === blockRecord.label && item.value === blockRecord.value)) {
                continue; // make sure there are no repeated selected record
              }
              selectedRecords.push(blockRecord);
            }
          }
        }

        this.selectedRecords = selectedRecords.map(item => {
          return _.deepCloneAs(item, ["label", "value", ...this.blockVm.showCol]);
        });
      } else {
        // if block is not ready, mostly happens at the very start
        // and under this circumstance, event on-ready or on-data-change will work
      }
    },
    selectedRecords(newVal) {
      this.$emit("input", newVal.map(item => item.value).join());
      this.$emit("on-change", this.labelInValue ? newVal.map(({ label, value }) => ({ label, value })) : newVal.map(item => item.value).join());
      this.blockVm.blockData.forEach(({ _index, label, value }) => {
        this.blockVm.$set(this.blockVm.blockData[_index], "selected", newVal.some(item => item.label === label && item.value === value));
      });

      this.$nextTick(() => {
        if (this.isInputting) return false;
        else {
          this.magicString = newVal.map(item => item.label).join();
        }
      });
    },
    magicString(newVal) {
      if (this.isKeyDown) {
        const { keyboardEvent: e } = this;
        if (!_.isKeyMatch(e, "Esc") && !_.isKeyMatch(e, "Enter")) {
          this.isDropdownVisible = true;
        }
        if (_.isKeyMatch(e, "Space") || (_.isKeyMatch(e, "A") && e.ctrlKey) || (_.isKeyMatch(e, "D") && e.ctrlKey)) _.noop();
        else {
          this.isInputting = true; // switch on input status, this is a big difference
        }
        this.isKeyDown = false; // switch off key down status
      }

      if (this.isInputting) {
        if (this.remote && this.remoteMethod) {
          const { selectedRecords: originalSelectedRecords, keyword: originalKeyword } = this.resolveMagicString();
          this.selectedRecords = originalSelectedRecords;
          this.remoteMethod(originalKeyword === null ? "" : originalKeyword, () => {
            this.$nextTick(() => {
              const { selectedRecords, keyword } = this.resolveMagicString();
              this.selectedRecords = selectedRecords;
              this.$nextTick(() => {
                this.$emit("on-query-change", originalKeyword === null ? "" : originalKeyword);
                if (this.clipboardEvent && this.clipboardEvent.type === "paste") {
                  this.clipboardEvent = null;
                } else {
                  this.blockVm.onQuery(keyword === null ? "" : keyword);
                }
              });
            });
          });
        } else {
          const { selectedRecords, keyword } = this.resolveMagicString();
          this.selectedRecords = selectedRecords;
          this.$nextTick(() => {
            this.$emit("on-query-change", keyword === null ? "" : keyword);
            if (this.clipboardEvent && this.clipboardEvent.type === "paste") {
              this.clipboardEvent = null;
            } else {
              this.blockVm.onQuery(keyword === null ? "" : keyword);
            }
          });
        }
      }
    },
    isDropdownVisible(newVal) {
      this.$emit("on-drop-change", newVal);
      this.dropVisible = newVal; // 仅供外部调用，兼容老版本
      if (newVal) {
        this.$refs.input.focus();
      } else {
        const { magicString: originalMagicString } = this;
        this.blockVm && this.blockVm.reset(); // reset block vm
        this.isKeyDown = false; // switch off key down status
        this.isInputting = false; // switch off input status
        this.keyboardEvent = null; // reset keyboard event
        this.$emit("on-query-change", "");
        if (this.remote && this.remoteMethod) {
          this.remoteMethod("", () => {
            this.$nextTick(() => {
              this.magicString = this.selectedRecords.map(item => item.label).join();
              this.blockVm.onQuery();
              this.$nextTick(() => {
                this.$refs.input.select();
              });
            });
          });
        } else {
          this.magicString = this.selectedRecords.map(item => item.label).join();
          this.blockVm.onQuery();
          this.$nextTick(() => {
            this.$refs.input.select();
          });
        }
      }
    }
  },
  methods: {
    onClickOutside() {
      this.isDropdownVisible = false;
    },
    onContainerKeyDown(e) {
      this.isKeyDown = true; // switch on key down status
      this.keyboardEvent = e; // cache current keyboard event

      if (this.isDropdownVisible) {
        if (_.isKeyMatch(e, "Esc") || _.isKeyMatch(e, "Enter")) {
          this.isDropdownVisible = false;

          // 处理与 MsgBox 的 Esc 事件冲突，处理地并不够好
          this.dispatch("Msgbox", "on-esc-real-close", false);
          setTimeout(() => {
            this.dispatch("Msgbox", "on-esc-real-close", true);
          }, 0);
        } else if (this.blockVm) {
          if (_.isKeyMatch(e, "Up")) {
            e.preventDefault();
            this.blockVm.highlight("prev");
          } else if (_.isKeyMatch(e, "Down")) {
            e.preventDefault();
            this.blockVm.highlight("next");
          } else if (_.isKeyMatch(e, "Space")) {
            e.preventDefault();
            this.blockVm.highlight("click");
          } else if (_.isKeyMatch(e, "A") && e.ctrlKey) {
            e.preventDefault();
            this.toggleSelect(true);
          } else if (_.isKeyMatch(e, "D") && e.ctrlKey) {
            e.preventDefault();
            this.toggleSelect(false);
          }
        }
      }
    },
    onInputFocus(e) {
      this.dispatch("FormItem", "on-form-focus");
      this.$emit("on-focus");
      this.$emit("on-input-focus");
      this.$refs.input.select();
    },
    onInputBlur() {
      this.dispatch("FormItem", "on-form-blur");
      this.$emit("on-blur");
    },
    onInputKeyup(e) {
      this.$emit("on-keyup", this.magicString, e);
    },
    onInputKeydown(e) {
      this.$emit("on-keydown", this.magicString, e);
    },
    onInputPaste(e) {
      this.clipboardEvent = e; // cache current clipboard event
      this.$emit("on-paste", { oldval: this.magicString, newval: e.clipboardData.getData("text/plain") });
    },
    onArrowClick() {
      if (this.disabled || this.readonly || !this.editable) return false;
      else {
        this.isDropdownVisible = !this.isDropdownVisible;
      }
    },

    /**
     * @description 魔法字符串的解析逻辑
     * @returns {Object} { selectedRecords, model, keyword }
     */
    resolveMagicString() {
      const splitMagicString = this.magicString === "" ? [] : this.magicString.split(",");
      let selectedRecords = [],
        model = [],
        keyword = null;

      if (splitMagicString.length > 0) {
        for (const label of splitMagicString) {
          const matched = this.blockVm.blockData.filter(item => item.label === label);
          if (matched.length > 0) {
            for (const blockRecord of matched) {
              if (selectedRecords.some(item => item.label === blockRecord.label && item.value === blockRecord.value)) {
                continue; // make sure there are no repeated selected record
              }
              selectedRecords.push(blockRecord);
              model.push(blockRecord.value);
            }
          }
        }

        keyword = splitMagicString[splitMagicString.length - 1]; // only consider the last split magic string
      }

      return {
        splitMagicString,
        selectedRecords: selectedRecords.map(item => _.deepCloneAs(item, ["label", "value", ...this.blockVm.showCol])),
        model,
        keyword
      };
    }
  },
  created() {
    this.$on("on-ready", (blockVm, records) => {
      this.blockVm = blockVm; // block instance
      this.isKeyDown = false; // switch off key down status
      this.isInputting = false; // switch off input status
      this.keyboardEvent = null; // reset keyboard event
      this.selectedRecords = records.filter(({ value }) => this.model.includes(value));
    });
    this.$on("on-data-change", (blockVm, records) => {
      this.selectedRecords = records.filter(({ value }) => this.model.includes(value));
    });
    this.$on("on-selected", (blockVm, record) => {
      if (this.selectedRecords.some(item => item.label === record.label && item.value === record.value)) return false;
      else {
        this.isKeyDown = false;
        this.isInputting = false;
        this.keyboardEvent = null;
        this.selectedRecords.push(record);
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      }
    });
    this.$on("on-cancel-selected", (blockVm, record) => {
      this.isKeyDown = false;
      this.isInputting = false;
      this.keyboardEvent = null;
      this.selectedRecords = this.selectedRecords.filter(item => item.label !== record.label && item.value !== record.value);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    });
  }
};
</script>