<template>
  <!-- 二次弹框 -->
  <div class="pop-box">
    <h-msg-box v-model="popFlag" :escClose="false">
      <p slot="header" class="pop-head">
        <span class="pop-icon">
          <h-icon :name="popType"></h-icon>
        </span>
        {{ popTitle }}
      </p>
      <div class="env-content" v-if="moduleType !== 'delete' || (moduleType === 'delete' && popType === 'prompt' && deleteNum > 1)">{{ popTxt }}</div>
      <!-- 自定义删除类型 -->
      <div
        class="env-content"
        v-if="
          moduleType === 'delete' && popType === 'prompt' && deleteNum === 1
        "
      >
        是否删除
        <span class="del-name">{{ popTxt }}</span
        >{{ deleteExtend }}
      </div>
      <div
        class="pop-content"
        v-if="
          moduleType === 'delete' && popType !== 'prompt'
        "
      >
        {{ popTxt }}
        <span class="del-name">{{ deleteExtend }}</span>
      </div>
      <div class="msg-footer" slot="footer">
        <h-button @click="confirmCancel" v-if="popType === 'prompt'"
          >取消</h-button
        >
        <h-button type="primary" @click="popConfirm">{{
          moduleType === "delete" && popType === "prompt" ? "继续" : "确认"
        }}</h-button>
      </div>
    </h-msg-box>
  </div>
</template>
<script>
export default {
  name: "popBox",
  data() {
    return {};
  },
  props: {
    popFlag: {
      type: Boolean,
      default: false
    },
    popType: {
      // prompt,success,error
      type: String,
      default: "prompt"
    },
    moduleType: {
      // 区分删除delete
      type: String,
      default: ""
    },
    deleteNum: {
      // 配合moduleType=delete使用，区分1
      type: Number,
      default: 0
    },
    deleteExtend: {
      type: String,
      default: ""
    },
    popTitle: {
      type: String,
      default: "提示"
    },
    popTxt: {
      // 仅单选删除展示
      type: String,
      default: ""
    }
  },
  watch: {},
  methods: {
    popConfirm() {
      this.$emit("popConfirm", false);
    },
    confirmCancel() {
      this.$emit("popCancel", false);
    }
  },
  mounted() {}
};
</script>
