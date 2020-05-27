<template>
  <span>
    <ul v-if="data && data.length" :class="[prefixCls + '-menu']">
      <Casitem
        v-for="(item, i) in data"
        :key="i"
        :prefix-cls="prefixCls"
        :data="item"
        :tmp-item="tmpItem"
        :multiple="multiple"
        @click.native.stop="handleClickItem(item, $event)"
        @mouseenter.native.stop="handleHoverItem(item)"
      ></Casitem>
    </ul>
    <Caspanel
      v-if="sublist && sublist.length"
      :multiple="multiple"
      :prefix-cls="prefixCls"
      :data="sublist"
      :disabled="disabled"
      :trigger="trigger"
      :change-on-select="changeOnSelect"
    ></Caspanel>
  </span>
</template>
<script>
import Casitem from "./Casitem.vue";
import Emitter from "../../mixins/emitter";
import { findComponentsUpward, findComponentDownward, findInx } from "../../util/tools";

let key = 1;

export default {
  name: "Caspanel",
  mixins: [Emitter],
  components: { Casitem },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    disabled: Boolean,
    changeOnSelect: Boolean,
    trigger: String,
    prefixCls: String,
    multiple: Boolean
  },
  data() {
    return {
      tmpItem: {},
      result: [],
      sublist: []
    };
  },
  watch: {
    data() {
      this.sublist = [];
    }
  },
  methods: {
    handleCheck(item) {
      let checked;
      checked = !item._checked && !item._indeterminate;
      item._checked = checked;
      item._indeterminate = false;
      this.updateCheckDown(item, checked);
      if (this.$parent.$options.name === 'Caspanel') {
        this.$parent.updateCheck();
      }
    },
    updateCheck() {
      if (!this.tmpItem) return;
      let checked;
      let indeterminate;
      let index = findInx(this.data, d => d.value == this.tmpItem.value);
      if (index > -1) {
        const item = this.data[index];
        const children = item.children;
      for (let i = 0; i < children.length; i++) {
        checked = children[i]._checked;
        if (
          i < children.length - 1 &&
          children[i]._checked != children[i + 1]._checked
        ) {
          indeterminate = true;
          break;
        }
        if (children[i]._indeterminate) {
          indeterminate = true;
          break;
        }
      }
      if (indeterminate) {
        item._checked = false;
        item._indeterminate = true;
      } else {
        item._checked = checked;
        item._indeterminate = false;
      }
      if (this.$parent.$options.name === 'Caspanel') {
        this.$parent.updateCheck();
      }
      }
    },
    updateCheckDown(item, checked) {
      const children = item.children;
      if (children && children.length > 0) {
        const travel = siblings => {
          siblings.forEach(sibling => {
            const _children = sibling.children;
            sibling._checked = checked;
            sibling._indeterminate = false;
            if (Array.isArray(_children)) {
              travel(_children);
            }
          });
        };
        travel(children);
      }
    },
    handleClickItem(item, event) {
      if (this.trigger !== "click" && item.children && !this.multiple) return;
      // 勾选选项
      let target = event.target;
      // 事件是否由多选框触发
      let check = false;
      if (
        !item.disabled && ((target.tagName === "INPUT" &&
        target.attributes.type.value === "checkbox") || !item.children)
      ) {
        check = true;
        this.handleCheck(item);
      }
      this.handleTriggerItem(item, false, true, check);
    },
    handleHoverItem(item) {
      if (this.trigger !== "hover" || !item.children) return;
      this.handleTriggerItem(item, false, true);
    },
    handleTriggerItem(item, fromInit = false, fromUser = false, check = false) {
      if (item.disabled) return;

      if (item.loading !== undefined && !item.children.length) {
        const cascader = findComponentsUpward(this, "Cascader");
        if (cascader && cascader.loadData) {
          cascader.loadData(item, () => {
            // todo
            if (fromUser) {
              cascader.isLoadedChildren = true;
            }
            if (item.children.length) {
              this.handleTriggerItem(item);
            }
          });
          return;
        }
      }

      // return value back recursion  // 向上递归，设置临时选中值（并非真实选中）
      const backItem = this.getBaseItem(item);
      this.tmpItem = backItem;
      this.emitUpdate([backItem]);
      if (item.children && item.children.length) {
        this.sublist = item.children;
        this.dispatch("Cascader", "on-result-change", {
          lastValue: this.multiple && check ? true : false,
          changeOnSelect: this.changeOnSelect,
          fromInit: fromInit
        });
        // #1553
        if (this.changeOnSelect) {
          const Caspanel = findComponentDownward(this, "Caspanel");
          if (Caspanel) {
            Caspanel.$emit("on-clear", true);
          }
        }
      } else {
        this.sublist = [];
        this.dispatch("Cascader", "on-result-change", {
          lastValue: true,
          changeOnSelect: this.changeOnSelect,
          fromInit: fromInit
        });
      }
    },
    updateResult(item) {
      this.result = [this.tmpItem].concat(item);
      this.emitUpdate(this.result);
    },
    getBaseItem(item) {
      let backItem = Object.assign({}, item);
      if (backItem.children) {
        delete backItem.children;
        delete backItem._checked;
        delete backItem._indeterminate;
      }
      return backItem;
    },
    emitUpdate(result) {
      if (this.$parent.$options.name === "Caspanel") {
        this.$parent.updateResult(result);
      } else {
        this.$parent.$parent.updateResult(result);
      }
    }
  },
  mounted() {
    this.$on("on-find-selected", params => {
      const val = params.value;
      let value = [...val];
      for (let i = 0; i < value.length; i++) {
        for (let j = 0; j < this.data.length; j++) {
          if (value[i] === this.data[j].value) {
            this.handleTriggerItem(this.data[j], true);
            value.splice(0, 1);
            this.$nextTick(() => {
              this.broadcast("Caspanel", "on-find-selected", {
                value: value
              });
            });
            return false;
          }
        }
      }
    });
    // deep for #1553
    this.$on("on-clear", (deep = false) => {
      this.sublist = [];
      this.tmpItem = {};
      if (deep) {
        const Caspanel = findComponentDownward(this, "Caspanel");
        if (Caspanel) {
          Caspanel.$emit("on-clear", true);
        }
      }
    });
  }
};
</script>
