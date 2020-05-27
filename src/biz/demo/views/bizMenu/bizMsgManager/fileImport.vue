<template>
<div>
    <h-upload
       ref="upload2"
       name="file"
       multiple
       action="http://127.0.0.1:8080/fileImport/getFileAbsolutePath.json"
       :with-credentials="true"
       :on-progress="handleProgress"
       :on-success="uploadSuccess"
       :on-error="uploadError"
       :on-preview="clickLink"
       :on-remove="handleRemove">
       <h-button type="ghost" icon="ios-cloud-upload-outline">请选择要导入的文件</h-button>
    </h-upload>
    <h-button type="primary" @click="importData" :disabled="disabled">开始导入</h-button>
    <h-row>
        <h-col span="12">
            {{fileData}}
        </h-col>
    </h-row>
</div>
</template>
<script>
import {post} from '@/api/bizApi/commonUtil'
export default {
  data () {
    return {
      disabled: true,
      fileName: '',
      fileData: ''
    }
  },
  methods: {
    handleProgress () {
      this.$hMessage.loading({
        content: '正在处理...'
      })
    },
    uploadSuccess (file) {
      // this.$hMessage.success('已上传成功'),
      // console.log(file)
      if (file) {
        this.fileName = file.filePaths
        this.disabled = false
        // todo 需要提交到后台的在这里实现
      }
    },
    uploadError (file) {
      this.$hMessage.error(file.name + '上传失败')
    },
    clickLink (file) {
      this.$hNotice.info({
        title: '点击上传文件事件',
        desc: '点击已上传的文件链接时的事件'
      }),
      console.log(file.response)
    },
    handleRemove (file) {
      this.$hMessage.success(file.name + '已移除')
    },
    clearFiles () {
      this.$hMessage.info('文件列表清空方法调用')
      this.$refs.upload2.clearFiles()
    },
    importData () {
      this.$http.post({fileName: this.fileName}, 'http://127.0.0.1:8080/fileImport/getFileData.json', {fileName: this.fileName}).then(res => {
        if (res && res.data) {
          this.fileData = res.data
          // todo 需要提交到后台的在这里实现
        }
      }).catch(error => {
        this.$hMessage.error(this.$t('m.i.common.addFailed'))
      })
    }
  }
}
</script>
