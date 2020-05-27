<style module="style" src="@configuration/index.css"></style>
<template>
  <div>
      <h-tabs>
        <h-tab-pane label='发布的值'>
        </h-tab-pane>
    </h-tabs>
    <br />
    <h-button type="primary" @click="fn('正常')">
          点击
    </h-button>
  </div>

</template>
<script>
export default {
  data(){
    return {
      content:'我是vue2-ace-editor',
      editorInit: function () {
            require('brace/ext/language_tools') //language extension prerequsite...
            require('brace/mode/html')                
            require('brace/mode/javascript')    //language
            require('brace/mode/less')
            require('brace/theme/chrome')
            require('brace/snippets/javascript') //snippet
        }
    }
  },
  components: {
        editor: require('vue2-ace-editor'),
    },
};
</script>