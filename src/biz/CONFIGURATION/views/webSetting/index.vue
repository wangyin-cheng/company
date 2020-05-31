<style module="style" src="@configuration/index.css"></style>
<template>
  <!-- 配置管理 -->
  <div class="web-pages web-setting">
    <!-- 面包屑 -->
    <h-breadcrumb>
      <h-breadcrumb-item class="bread-title" :href="aplicationPath" replace>应用管理</h-breadcrumb-item>
      <h-breadcrumb-item class="bread-current" :href="colonyPath">{{ aplicationName }}</h-breadcrumb-item>
      <h-breadcrumb-item class="bread-current">{{ colonyName }}</h-breadcrumb-item>
    </h-breadcrumb>
    <!-- 查询 -->
    <div class="setting-search">
      <h-form
        ref="setSearchForm"
        errorFocus
        onlyBlurRequire
        cols="4"
        class="setting-form"
        label-width="60"
        label-position="right"
      >
        <!-- 集群名称已固定，不可修改 -->
        <h-form-item label="集群名称">
          <h-select :clearable="false" disabled="false" v-model="searchItem.colonyName">
            <h-option>后端提供</h-option>
          </h-select>
        </h-form-item>
        <h-form-item label="状态" label-width="50">
          <h-select v-model="searchItem.status" :clearable="false">
            <h-option v-for="(item, i) in setStatus" :value="item" :key="i">{{ item }}</h-option>
          </h-select>
        </h-form-item>
        <h-form-item label="内容检索">
          <h-input v-model="searchItem.txt" multiple size="small" showTitle placeholder="请输入关键字"></h-input>
        </h-form-item>
        <h-form-item label-width="10">
          <h-button type="primary" @click="searchSubmitFunc">提交</h-button>
          <h-button type="ghost" @click="resetFunc" style="margin-left: 8px">重置</h-button>
        </h-form-item>
      </h-form>
    </div>
    <!-- 注意提示 -->
    <div class="warning">
      <span class="warn-icon">
        <h-icon name="prompt_fill"></h-icon>
      </span>
      注意: 本集群因删除而缺失的配置文件有：macs_addr.xml、macs_addr.xml，请通过【还原配置】进行补缺！
    </div>
    <!-- 操作按钮 -->
    <div class="oper-btn">
      <h-button type="primary" icon="android-add" @click="addProfile">新建配置</h-button>
      <h-button type="primary" @click="putProfile">上传文件</h-button>
      <h-button type="ghost">下载文件</h-button>
      <h-button type="gost" @click="delMore">批量删除</h-button>
      <h-button type="ghost" @click="restoreProfile">还原配置</h-button>
    </div>
    <div class="notice-bar">
      <div class="notice-lf">
        <h-icon name="ios-information"></h-icon>
        <div class="notice-txt">
          已选择
          <span class="notice-num">{{ countNum }}</span>项
          <span class="notice-clear" @click="clearFunc">清空</span>
        </div>
      </div>
    </div>
    <!-- 列表 -->
    <div class="com-table">
      <h-table
        border
        :columns="comTitle"
        :data="tableData"
        data-checked-prop
        @on-selection-change="selectChange"
      ></h-table>
    </div>
    <!-- 分页 -->
    <div class="com-page">
      <h-page :total="totalNum" show-elevator :page-size="pageSize" @on-change="changedata"></h-page>
    </div>
    <!-- 二次弹框 -->
    <PopBox
      :popFlag="secondFlag"
      :popType="secondType"
      :popTitle="secondTitle"
      :moduleType="operType"
      :popTxt="delName"
      :deleteNum="delNum"
      :deleteExtend="secondExtend"
      @popConfirm="confirmFunc"
      @popCancel="popCancelFunc"
    ></PopBox>
    <!-- 弹框(新建/上传/发布) -->
    <h-msgBox
      v-model="popEdit"
      :mask-closable="false"
      class-name="aplication-modal"
      :width="popWidth"
      @on-close="editClose"
    >
      <!-- 自定义头部 -->
      <p slot="header" class="aplication-head">
        <span v-if="popType === 'restore'">还原/补缺配置文件</span>
        <span
          v-if="popType !== 'set' && popType !== 'restore'"
        >{{ popType === "new" ? "新建" : "上传" }}配置文件</span>
        <span v-if="popType === 'set'">配置发布</span>
      </p>

      <!-- 字段说明 -->
      <div class="app-station" v-show="explainFlag">
        <div class="station-title">
          <div class="app-lf app-com">
            <h-icon name="ios-information-outl"></h-icon>
          </div>
          <div class="app-com">
            <span v-if="popType !== 'set'">功能说明</span>
            <span v-else>注意</span>
          </div>
          <div class="app-com app-rt" @click="closeExplain">
            <h-icon name="android-close"></h-icon>
          </div>
        </div>
        <div class="app-content" v-if="popType === 'new'">
          <p>·所有配置信息均是私有的，只能被所属集群和应用节点获取到。</p>
          <p>·目前支持的文件格式包含（xml、yml、yaml、json、txt、properties）。</p>
          <p>·新增的配置文件默认覆盖该应用下所有集群</p>
        </div>
        <div class="app-content" v-if="popType === 'put'">
          <p>·所有配置信息均是私有的，只能被所属集群和应用节点获取到。</p>
          <p>·目前支持的文件格式包含（xml、yml、yaml、json、txt等）。</p>
        </div>
        <div class="app-content" v-if="popType === 'set'">
          <p>只有发布过的配置才会被客户端获取到。并且只有编辑过的集群才会出现在发布集群列表中</p>
        </div>
      </div>
      <h-form
        ref="colonyForm"
        :label-width="151"
        errorFocus
        onlyBlurRequire
        cols="1"
        class="aplication-form"
      >
        <!-- 还原配置文件 -->
        <div v-if="popType === 'restore'" class="app-restoreProfile">
          <h-form-item label="配置文件" :required="false" label-width="80">
            <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
              <h-checkbox
                :indeterminate="indeterminate"
                :value="checkAll"
                @click.prevent.native="handleCheckAll"
              >全选</h-checkbox>
            </div>
            <h-checkbox-group v-model="checkAllGroup" @on-change="checkAllGroupChange">
              <h-checkbox v-for=" (item ,index) in checkboxOption" :key="index" :label="item"></h-checkbox>
            </h-checkbox-group>
          </h-form-item>
        </div>
        <!-- 新建配置文件 -->
        <div v-if="popType === 'new'" class="newPorfile">
          <h-form-item label="应用ID" :required="false">
            <h-input v-model="fileFrome.useId" multiple size="small" showTitle disabled></h-input>
          </h-form-item>
          <h-form-item label="文件名称" required class="new-file">
            <h-input v-model="fileFrome.fileName" multiple size="small" showTitle></h-input>
            <h-select v-model="fileFrome.fileType" :clearable="false">
              <h-option v-for="(item, t) in allFileType" :value="item" :key="t">{{ item }}</h-option>
            </h-select>
          </h-form-item>
          <h-form-item label="备注" :required="false">
            <h-input
              v-model="fileFrome.txt"
              type="textarea"
              multiple
              size="small"
              showTitle
              placeholder="初始化配置文件"
            ></h-input>
          </h-form-item>
        </div>
        <!-- 上传配置文件 -->
        <div v-if="popType === 'put'" class="putPorfile">
          <div class="putFileMain">
            <h-upload multiple type="drag" action="//jsonplaceholder.typicode.com/posts/">
              <div class="putMainUpload">
                <!-- <h-icon type="ios-cloud-upload" size="52" style="color: #3399ff"></h-icon> -->
                <h-icon
                  name="android-open.icon-android-open"
                  size="52"
                  style="color: #3399ff;width: 100px; height: 100px;"
                ></h-icon>
                <div>
                  <p>点击或将文件拖拽到这里上传</p>
                  <P class="uploadTypeP">仅支持xml、yml、yaml、json、txt、properties格式上传</P>
                </div>
              </div>
            </h-upload>
            <div class="putFileCheckbox">
              <p style>集群</p>
              <div class="checkboxMain">
                <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
                  <h-checkbox
                    :indeterminate="indeterminate"
                    :value="checkAll"
                    @click.prevent.native="handleCheckAll"
                  >全选</h-checkbox>
                </div>
                <h-checkbox-group v-model="checkAllGroup" @on-change="checkAllGroupChange">
                  <h-checkbox v-for=" (item ,index) in checkboxOption" :key="index" :label="item"></h-checkbox>
                </h-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <!-- 配置发布 -->
        <div v-if="popType  === 'set'" class="setPorfile">
          <div class="setPorfileScoll">
            <h-form-item label="版本号" :required="false" label-width="80">
              <h-input disabled :placeholder="publishNum"></h-input>
            </h-form-item>
            <h-form-item label="发布说明" :required="false" label-width="80">
              <h-input
                v-model="publishExplain"
                type="textarea"
                multiple
                size="small"
                rows="5"
                showTitle
                placeholder="1.登录时回包错误信息若包体包头均为空，error_info默认为“连接注册超时”； 
                      2.修复出现拒绝链接的macs 会不断链接，日志一直打印，下次重新请求到这个地址 ，会多一次重试链接，没有释放资源问题； 
                      3.验证重启Tomcat接口，是否重启成功查看日志。"
              ></h-input>
            </h-form-item>
            <h-form-item label="发布的集群" :required="false" label-width="80">
              <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
                <h-checkbox
                  :indeterminate="indeterminate"
                  :value="checkAll"
                  @click.prevent.native="handleCheckAll"
                >全选</h-checkbox>
              </div>
              <h-checkbox-group v-model="checkAllGroup" @on-change="checkAllGroupChange">
                <h-checkbox v-for=" (item ,index) in checkboxOption" :key="index" :label="item"></h-checkbox>
              </h-checkbox-group>
            </h-form-item>
            <h-form-item label-width="10">
              <h-tabs>
                <h-tab-pane label="发布的值">
                  <div class="publishEditor">
                    <editor
                      v-model="content"
                      @init="editorInit"
                      lang="html"
                      theme="chrome"
                      width="420"
                      height="200"
                    ></editor>
                  </div>
                </h-tab-pane>
                <h-tab-pane label="查看变更">
                  <div>
                    <h-simple-table
                      :data="publishData"
                      :columns="publishColumns"
                      border
                      height="100"
                      width="440"
                    ></h-simple-table>
                  </div>
                </h-tab-pane>
              </h-tabs>
            </h-form-item>
          </div>
        </div>
      </h-form>
      <!-- 底部按钮 -->
      <div class="msg-footer" slot="footer">
        <h-button @click="editClose">取消</h-button>
        <h-button type="primary" @click="editConfirm" v-if="popType === 'restore'">确认</h-button>
        <h-button
          type="primary"
          @click="editConfirm"
          v-else
        >{{popType !== 'set' ? popType === 'new'?'创建':'上传' : '发布'}}</h-button>
      </div>
    </h-msgBox>
  </div>
</template>
<script>
import baseInfo from "./param.js"; //假数据
import { deepClone } from "@commonMethod"; //深度克隆
import PopBox from "@configuration/components/PopBox"; //弹框组件
// var colonyPath = "/CONFIGURATION/views/webColony/index";

export default {
  data() {
    return {
      // 全选的参数
      indeterminate: true,
      checkAll: false,
      checkAllGroup: ["XXX集群"],
      checkboxOption: ["XXX集群", "YYY集群", "ZZZ集群"],
      secondType: "",
      secondTitle: "",
      secondFlag: false,
      operType: "", // 区分delete
      secondExtend: "", // 配合删除使用， 拓展文案
      clearTimeoutOne:null,
      delName: "",
      delNum: 0,
      countNum: 0, // 清空
      totalNum: 0, //分页总数
      pageSize: 5, //一页显示多少
      pageNum: 1, //页码
      comTitle: deepClone(baseInfo.comData.baseColumn),
      deleteData: [], //删除的数组
      tableData: [], //分页的数据
      tableList: [], //列表全部的数据
      aplicationName: decodeURIComponent(
        this.$route.query.aplicationName || ""
      ),
      // 弹框参数
      popEdit: false,
      explainFlag: true,
      popWidth: 497,
      popType: "",
      fileFrome: {
        useId: "12",
        fileName: "",
        fileType: "",
        txt: "",
        publishNum: "2-10-3",
        publishExplain: ""
      },
      allFileType: ["xml", "yaml", "yml", "json", "properties", "txt"],
      colonyName: decodeURIComponent(this.$route.query.colonyName || ""),
      setStatus: ["有修改", "正常", "已删除"], // 文件状态-search
      aplicationPath: "/CONFIGURATION/views/webApplication/index", // 应用管理
      colonyPath: "/CONFIGURATION/views/webColony/index", // 集群管理
      searchItem: deepClone(baseInfo.comData.searchItem), //deepClone 深度克隆
      content: "我是vue2-ace-editor",
      editorInit: function() {
        require("brace/ext/language_tools"); //language extension prerequsite...
        require("brace/mode/html");
        require("brace/mode/javascript"); //language
        require("brace/mode/less");
        require("brace/theme/chrome");
        require("brace/snippets/javascript"); //snippet
      },
      publishData: [],
      publishColumns: deepClone(baseInfo.comData.publishColumns)
    };
  },
  computed: {},
  components: {
    PopBox,
    editor: require("vue2-ace-editor")
  },
  mounted() {
    this.initPath();
    this.init();
  },
  methods: {
    initPath() {
      //  设置默认值
      const {
        aplicationName = "",
        aplicationId = "",
        colonyName = ""
      } = this.$route.query;

      // 初始化面包屑的路由
      this.colonyPath =
        this.colonyPath +
        "?aplicationId=" +
        aplicationId +
        "&aplicationName=" +
        aplicationName;
    },
    init() {
      this.initParam();
      this.initTable();
    },
    initParam() {
      this.geMainData();
      this.tableData = this.tableList.slice(0, this.pageSize);
      this.totalNum = this.tableList.length;
      this.countNum = this.rendeChecked();
      this.delNum = this.countNum;
      // 列表的表头
      this.comTitle = deepClone(baseInfo.comData.baseColumn);
      this.comTitle[11].render = (h, params) => {
        return h("div", [
          h(
            "Button",
            {
              props: {
                type: "text",
                size: "small"
              },
              style: {
                color: "#037DF3",
                background: "none",
                padding: "0 10px 0 0"
              },
              on: {
                click: () => {
                  this.publishProfile(params);
                }
              }
            },
            "发布"
          ),
          h(
            "Button",
            {
              props: {
                type: "text",
                size: "small"
              },
              style: {
                color: "#4686F2",
                background: "none",
                padding: "0 10px 0 0"
              },
              on: {
                click: () => {
                  this.rollBackFunc(params);
                }
              }
            },
            "回滚"
          ),
          h(
            "Button",
            {
              props: {
                type: "text",
                size: "small"
              },
              style: {
                color: "#4686F2",
                background: "none",
                padding: "0 10px 0 0"
              },
              on: {
                click: () => {
                  this.historyFunc(params);
                }
              }
            },
            "发布历史"
          ),
          h(
            "Button",
            {
              props: {
                type: "text",
                size: "small"
              },
              style: {
                color: "#4686F2",
                background: "none",
                padding: 0
              },
              on: {
                click: () => {
                  this.delFunc(params);
                }
              }
            },
            "删除"
          )
        ]);
      };
      
    },
    // 全选的配置
    handleCheckAll() {
      if (this.indeterminate) {
        this.checkAll = false;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;
      if (this.checkAll) {
        this.checkAllGroup = this.checkboxOption;
      } else {
        this.checkAllGroup = [];
      }
    },
    checkAllGroupChange(data) {
      if (data.length === 3) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (data.length > 0) {
        this.indeterminate = true;
        this.checkAll = false;
      } else {
        this.indeterminate = false;
        this.checkAll = false;
      }
    },
    // 重置按钮事件
    resetFunc() {
      this.searchItem = {};
      this.geMainData();
    },
    // 搜索的提交键
    searchSubmitFunc() {
      let { colonyName, status, txt } = this.searchItem;
      if (colonyName !== "" || status !== "" || txt !== "") {
        let that = this;
        if (status) {
          let arr = that.tableList.filter((item, index) => {
            if (item.status === status) {
              that.tableList.splice(index, 1);
              return true;
            }
          });

          that.tableList.unshift(...arr);
          that.changedata(this.pageNum);
        
        }
      } else {
        this.$hMessage.error({
          content: "集群名称，状态，内容至少选其一",
          duration: 4
        });
      }
    },
    // 新建配置文件
    addProfile() {
      this.popEdit = true;
      this.popType = "new";
      this.explainFlag = true;
    },
    // 上传文件
    putProfile() {
      this.popEdit = true;
      this.popType = "put";
      this.explainFlag = true;
    },
    // 发布
    publishProfile() {
      this.popEdit = true;
      this.popType = "set";
      this.explainFlag = true;
    },
    // 还原配置
    restoreProfile() {
      this.popEdit = true;
      this.popType = "restore";
      this.explainFlag = false;
      this.popWidth = "500";
    },
    // 回滚按钮事件
    rollBackFunc(a) {
      console.log(a);
    },
    // 发布历史
    historyFunc(a) {
      console.log(a);
    },
    // 弹框关闭（新增/上传）
    editClose() {
      this.popEdit = false;
      let form = "colonyForm";
      this.$refs[form].resetFields(); // 弹框重置
    },
    // 弹框中X点击
    closeExplain() {
      this.explainFlag = false;
    },
    // 确认
    editConfirm() {
      if (this.popType === "new") {
        alert("new");
        // 接口
      } else if (this.popType === "put") {
        // 接口
        alert("put");
      } else if (this.popType === "set") {
        //
        // 接口
        alert("set");
      }
      this.editClose();
    },
    // 单数据删除。
    delFunc(params) {
      let obj = this.tableData[params.index];
      if (obj._checked === "false") {
        this.$set(obj, "_checked", true);
        this.delNum++;
      }
      if (this.delNum == 1 && obj._checked == true) {
        this.deleteData.push(params.row);
        this.delMore();
      } else {
        this.$hMessage.error({
          content: "不可同时删除二个及以上",
          duration: 4
        });
      }
    },
    // 二次弹框close
    secondClose() {
      this.secondFlag = false;
      this.secondTitle = "";
      this.secondExtend = "";
    },
    // 二次弹框open
    secondOpen() {
      this.secondType = "prompt";
      this.secondFlag = true;
    },
    // 确认
    confirmFunc() {
      if (this.operType === "delete" && this.secondType === "prompt") {
        this.secondClose();
        // 接口删除(成功or失败)
        let that = this;
        that.clearTimeoutOne =  setTimeout(() => {
          that.secondOpen();
          that.confirmDelFunc("error"); // error,success
        }, 600);
      } else {
        if (this.operType === "delete" && this.secondType === "success") {
          this.initTable();
        } else if (this.operType === "delete" && this.secondType === "error") {
          this.initTable();
        }
        this.secondClose();
      }
    },
    // 删除，取消
    popCancelFunc() {
      this.initTable();
      this.secondClose();
    },
    // 点击继续
    confirmDelFunc(type) {
      this.secondType = type;
      this.secondTitle = type === "success" ? "删除成功" : "删除错误提示";
      if (this.delNum === 1) {
        this.secondExtend = type === "success" ? "删除成功" : "删除失败"; // 具体文案待定
      } else {
        // 批量删除
        this.delName = "";
        this.secondExtend =
          type === "success" ? "批量删除成功" : "批量删除失败"; // 具体文案待定
      }
    },
    // 批量删除
    delMore() {
      if (this.delNum === 0) {
        return;
      }
      this.secondTitle = "删除提示";
      this.operType = "delete";
      this.secondOpen();

      if (this.delNum === 1) {
        this.delName = this.deleteData[0].fileName || "test"; // 集群名称（字段待确认）
        this.secondExtend =
          "删除私有配置文件将导致客户端实例获取不到此配置，且页面会提示缺失该配置，确定要删除吗?";
      } else if (this.delNum > 1) {
        this.delName =
          "是否删除该" +
          this.countNum +
          "条记录，删除私有配置文件将导致客户端实例获取不到此配置，且页面会提示缺失该配置，确定要删除吗?"; // 批量删除文案待确认
      }
    },
    // 点击分页触发的事件。
    changedata(i) {
      this.tableData = this.tableList.slice(
        (i - 1) * this.pageSize,
        this.pageSize * i
      );
      this.pageNum = i;
      this.countNum = this.rendeChecked();
      this.delNum = this.countNum;
    },
    // 点击多选框触发的
    selectChange(selection) {
      this.countNum = selection.length;
      this.delNum = this.countNum;
      this.deleteData = selection;
    },
    // 查看有没有默认checke；
    rendeChecked() {
      let checkedArr = this.tableData.filter(item => {
        return item._checked === true;
      });
      this.deleteData.push(...checkedArr);
      return checkedArr.length;
    },
    //  点击清空
    clearFunc() {
      this.countNum = 0;
      this.tableData.map(item => {
        item._checked = "false";
      });
      this.changedata(this.pageNum);
    },
    initTable() {
      this.deleteData = [];
    },
    geMainData() {
      //进入页面的数据

      const test = [
        {
          fileName: "client_cfg ",
          fileType: "xml",
          status: "正常",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg ",
          fileType: "xml",
          status: "正常",
          instanceNum: 28,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg ",
          fileType: "xml",
          status: "正常",
          instanceNum: 25,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "已删除",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg ",
          fileType: "xml",
          status: "正常",
          instanceNum: 25,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "已删除",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg ",
          fileType: "xml",
          status: "正常",
          instanceNum: 25,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "已删除",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg ",
          fileType: "xml",
          status: "有修改",
          instanceNum: 23,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
          _checked: true
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          fileName: "client_cfg applicati",
          fileType: "json",
          status: "有修改",
          instanceNum: 24,
          versionNumber: "2-1-3",
          publish: "2020-5-22",
          appPerson: "lisi",
          changePerson: "wangtu",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        }
      ];
      const publishTest = [
        {
          varName: "stop",
          publishedValue: "08:50:10",
          untreated: "08:50:34",
          changePerson: "wangtu",
          update: "2016-09-21 08:50:08"
        },
        {
          varName: "stop",
          publishedValue: "08:50:10",
          untreated: "08:50:34",
          changePerson: "wangtu",
          update: "2016-09-21 08:50:08"
        },
        {
          varName: "stop",
          publishedValue: "08:50:10",
          untreated: "08:50:34",
          changePerson: "wangtu",
          update: "2016-09-21 08:50:08"
        }
      ];
      this.tableList = test;
      this.publishData = publishTest;
    }
  },
  destroyed() {
    clearInterval(this.clearTimeoutOne)
  }
};
</script>
<style lang="scss">
.warning {
  margin: 12px 0px;
}
.lightblue .h-btn-ghost {
  background: rgba(255, 255, 255, 1);
  border-radius: 2px;
  border: 1px solid rgba(70, 134, 242, 1);
}
// 弹框的样式
.lightblue .aplication-form {
  padding: 24px 0px 0px 0px;
}
// 新建配置文件
.newPorfile {
  padding: 0px 69px 1px 0;
}
// 上传文件
.h-upload {
  width: 240px;
  height: 120px;
  position: relative;
  margin: 0px auto;
  .lightblue .h-upload-drag {
    width: 240px;
    height: 120px;
    border-radius: 2px;
    border: 1px solid rgba(221, 221, 221, 1);
    .putMainUpload {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      i {
        width: 100px;
        height: 100px;
        display: block;
        font-size: 52px;
      }
      p {
        font-size: 16px;
      }
      .uploadTypeP {
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        line-height: 12px;
        font-size: 12px;
      }
    }
  }
}
.putFileMain {
  width: 100%;
  .putFileCheckbox {
    margin: 50px auto 0px;
    width: 260px;
    height: 100px;
    p {
      width: 50px;
      float: left;
      height: 100%;
    }
    .checkboxMain {
      width: calc(100% - 50px);
      float: left;
    }
  }
}
// 发布配置
.setPorfile {
  height: 300px;
  .setPorfileScoll {
    overflow-x: hidden;
    overflow-y: auto;
    color: #cccccc;
    font-size: 0.7rem;
    height: 100%;
  }
      .setPorfileScoll::-webkit-scrollbar {
    width: 2px;
  }
      .setPorfileScoll::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }
     .setPorfileScoll::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }
  .publishEditor {
    width: 430px;
    height: 103px;
    overflow-x: hidden;
    overflow-y: auto;
    color: #333333;
    font-size: 12px;
  }
      .publishEditor::-webkit-scrollbar {
    width: 2px;
  }
      .publishEditor::-webkit-scrollbar-thumb {
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }
     .publishEditor::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>