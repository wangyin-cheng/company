
 <style module="style" src="@configuration/index.css"></style>
<template>
  <div id="mergely">
    <h-row>
      <h-col span="12">
        <div>
          <input
            style="display: none;"
            ref="inputLeft"
            type="file"
            @change="handleChange($event, 'left')"
          />
          <h-button type="primary" @click="handleClick('inputLeft')">选择左边文件</h-button>

          <editor
            v-model="contentLeft"
            @init="editorInit"
            ref="aaa"
            lang="javascript"
            theme="iplastic"
            width="500"
            height="200"
          ></editor>
        </div>
      </h-col>
      <h-col span="12">
        <div>
          <input
            style="display: none;"
            ref="inputRight"
            type="file"
            @change="handleChange($event, 'right')"
          />
          <h-button type="primary" @click="handleClick('inputRight')">选择右边文件</h-button>

          <editor
            v-model="contentRight"
            @init="editorInit"
            ref="aaa"
            lang="javascript"
            theme="iplastic"
            width="500"
            height="200"
          ></editor>
        </div>
      </h-col>
    </h-row>
    <!-- <h-textdiff :leftValue="contentLeft" :rightValue="contentRight" ></h-textdiff> -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      leftValue: "",
      rightValue: "",
      contentLeft: "",
      contentRight: ""
    };
  },
  components: {
    editor: require("vue2-ace-editor")
  },
  methods: {
    // 点击事件
    handleClick(input) {
      this.$refs[input].click();
    },
    handleChange($event, valKey) {
      let that = this;
      let e = $event;
      if (e.target.files && e.target.files.length > 0) {
        let reader = new FileReader(); //读取文件的
        reader.readAsText(e.target.files[0], "utf-8"); //将文件读取为文本
        reader.onload = function(e) {
          //读取成功触发
          if (valKey == "left") {
            that.contentLeft = e.target.result;
            // hljs.initHighlightingOnLoad()
            console.log("valkey", typeof that.contentLeft);
          } else {
            that.contentRight = e.target.result;
          }
          if (that.contentLeft !== "" && that.contentRight !== "") {
          }
        };
      }
      valKey == "left"
        ? (this.$refs.inputLeft.value = null)
        : (this.$refs.inputRight.value = null);
    },
    editorInit: function() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/yaml");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/iplastic");
      require("brace/snippets/javascript"); //snippet
      // this.setHighlightActiveLine(true)
      // this.$refs.aaa.editor.setHighlightActiveLine(true);
      // this.$refs.aaa.editor.setShowFoldWidgets(true);
    }
  }
};
</script>
