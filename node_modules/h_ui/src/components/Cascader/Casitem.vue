<template>
  <li :class="classes">
    <check-box
      v-if="multiple"
      v-model="data._checked"
      :indeterminate="data._indeterminate"
      :disabled="data.disabled"
    ></check-box>
    {{ data.label }}
    <Icon v-if="showArrow" name="ios-arrow-right"></Icon>
    <Icon v-if="showLoading" class="h-load-loop" name="load-c"></Icon>
  </li>
</template>
<script>
import CheckBox from "../Checkbox/Checkbox";
import Icon from "../Icon/Icon.vue";
import { findInx } from "../../util/tools";
export default {
  name: "Casitem",
  components: { Icon, CheckBox },
  props: {
    data: Object,
    prefixCls: String,
    tmpItem: Object,
    multiple: Boolean
  },
  computed: {
    classes() {
      return [
        `${this.prefixCls}-menu-item`,
        {
          [`${this.prefixCls}-menu-item-active`]:
            this.multiple ? this.tmpItem.value === this.data.value && Array.isArray(this.data.children) : this.tmpItem.value === this.data.value,
          [`${this.prefixCls}-menu-item-disabled`]: this.data.disabled
        }
      ];
    },
    showArrow() {
      return (
        (this.data.children && this.data.children.length) ||
        ("loading" in this.data && !this.data.loading)
      );
    },
    showLoading() {
      return "loading" in this.data && this.data.loading;
    }
  }
};
</script>
