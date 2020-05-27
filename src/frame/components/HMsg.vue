<template>
  <div class="h-msg-center" @click="gotoMsgInBox">
    <h-icon name="xf-top-message" style="font-size: 24px;"></h-icon>
    <span id="msgNum"></span>
    <!--查看消息窗口-->
    <h-msg-box width="820" v-model="viewMsgWin" :mask-closable="false" ref="viewMsg">
      <p slot="header">
        <span>{{ currentMsgTitle }}</span>
      </p>
      <h-form :model="viewMsgForm" :label-width="116" ref="viewMsgForm" cols="1">
        <!--详情发件人-->
        <h-form-item :label="$t('m.i.emailBox.sender')" prop="sender">
          <h-input v-model="viewMsgForm.sendUserId" :disabled="true"></h-input>
        </h-form-item>
        <!--详情时间-->
        <h-form-item :label="$t('m.i.emailBox.sendTime')" prop="sendTime">
          <h-input v-model="viewMsgForm.sendTime" :disabled="true"></h-input>
        </h-form-item>
        <!--内容-->
        <h-form-item :label="$t('m.i.emailBox.content')" prop="content">
          <h-editor ref="topBarEditor"> </h-editor>
        </h-form-item>
      </h-form>
      <div slot="footer">
        <h-button type="primary" @click="viewMsgWin = !viewMsgWin">{{$t('m.i.common.close')}}</h-button>
      </div>
    </h-msg-box>
    <h-msg-box height="400" width="800" v-model="msgNoreadInfo" :title="$t('m.i.emailBox.unread')" :mask-closable="false" :footerHide="false">
      <h-table v-show="msgNoreadInfo" :columns="noReadColumns" :data="msgNoreadData" @on-row-click="viewNoReadInfo"></h-table>
      <div slot="footer">
        <h-button type="primary" @click="onMore">{{$t('m.i.common.more')}}</h-button>
      </div>
    </h-msg-box>
  </div>
</template>

<script>
import HEditor from '@frame/components/HEditor'
export default {
  name: 'HMsg',
  components: {
    HEditor
  },
  data () {
    return {
      timer: null,
      msgNoreadInfo: false,
      msgNoreadData: [],
      noReadColumns: [
        {
          title: this.$t('m.i.emailBox.messageTitle1'),
          key: 'msg_title'
        }
      ],
      viewMsgForm: {
        sendUserId: '',
        sendTime: '',
        content: ''
      },
      viewMsgWin: false,
      currentMsgTitle: ''
    }
  },
  methods: {
    unreadMsg () {
      let self = this
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let url = '/getInboxNoReadMsgList' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        url = url.toLowerCase()
      }
      this.$http.get(window.LOCAL_CONFIG.OMC_GSV + url)
        .then(res => {
          if (res) {
            var msgSpan = document.getElementById('msgNum')
            var total = res.data.total
            if (total > 0) {
              msgSpan.setAttribute('class', 'h-message-num')
              msgSpan.innerHTML = res.data.total
            } else {
              msgSpan.removeAttribute('class')
              msgSpan.innerHTML = ''
            }
            setTimeout(() => {
              self.unreadMsg()
            }, 15000)
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
          }
        })
    },
    gotoMsgInBox () {
      this.msgNoreadInfo = true
      let param = { pageSize: 10, pageNo: 1, isRead: '0' }
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let url = '/getInboxMsgListByPage' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        url = url.toLowerCase()
      }
      this.$http.post(window.LOCAL_CONFIG.OMC_GSV + url, param)
        .then(res => {
          if (res) {
            this.msgNoreadData = res.data.rows
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
          }
        })
    },
    viewNoReadInfo (arr) {
      let currentData = arr[0]
      let param = { msgIds: currentData.msg_id, isRead: 'true' }
      let isUrlLowercase = window.LOCAL_CONFIG.isUrlLowercase + ''
      let url = '/updateIsReadSataus' + '?time=' + new Date().getTime()
      if (isUrlLowercase === 'true') {
        url = url.toLowerCase()
      }
      this.$http.post(window.LOCAL_CONFIG.OMC_GSV + url, param)
        .then(res => {
          if (res) {
            let return_code = res.data.return_code
            if (return_code === '0') {
              this.currentMsgTitle = currentData.msg_title
              this.viewMsgForm.sendUserId = currentData.send_user_id
              this.viewMsgForm.sendTime = currentData.send_time
              this.$refs.topBarEditor.setDisabled(false)
              this.defaultMsg = currentData.content
              this.$refs.topBarEditor.setContent(currentData.content)
              this.viewMsgWin = true
              this.msgNoreadInfo = false
              this.unreadMsg()
            } else {
              this.$hMessage.error({content:this.$t('m.i.common.markFailed') + res.data.return_info,duration: 3,closable: true});
            }
          } else {
            this.$hMessage.error({content:this.$t('m.i.common.netError'),duration: 3,closable: true});
          }
        })
    },
    // 查看消息点击更多
    onMore () {
      this.$nextTick(() => {
        this.msgNoreadInfo = false
        this.$router.push('/bizMenu/bizMsgManager/bizEmailInbox')
      })
    }
  },
  created () {
    this.unreadMsg()
  }
}
</script>

<style></style>
