<style module="style" src="@configuration/index.css"></style>
<template>
  <!-- 集群管理 -->
  <div class="web-pages web-colony">
    <!-- 面包屑 -->
    <h-breadcrumb>
      <h-breadcrumb-item class="bread-title" :href="aplicationPath" replace
        >应用管理</h-breadcrumb-item
      >
      <h-breadcrumb-item class="bread-current">
        {{ aplicationName }}
      </h-breadcrumb-item>
    </h-breadcrumb>
    <div class="warning">
      <span class="warn-icon">
        <h-icon name="prompt_fill"></h-icon>
      </span>
      注意:属于某集群的实例只会使用该集群（当前页面）的配置。
    </div>
    <div class="oper-btn">
      <h-button type="primary" icon="android-add" @click="addFunc"
        >新建集群</h-button
      >
      <h-button type="gost" @click="delMore">批量删除</h-button>
      <h-button type="primary" icon="android-add" @click="addSetFunc"
        >新建配置</h-button
      >
    </div>
    <div class="notice-bar">
      <div class="notice-lf">
        <h-icon name="ios-information"></h-icon>
        <div class="notice-txt">
          已选择
          <span class="notice-num">{{ countNum }}</span
          >项
          <span class="notice-clear" @click="clearFunc">清空</span>
        </div>
      </div>
    </div>
    <!-- 表格 -->
    <div class="com-table">
      <h-table
        border
        :columns="comTitle"
        :data="tableData"
        @on-selection-change="selectChange"
      ></h-table>
    </div>
    <div class="com-page">
      <h-page :total="totalNum" show-sizer show-elevator></h-page>
    </div>
    <!-- 弹框(add/edit) -->
    <h-msgBox
      v-model="popEdit"
      :mask-closable="false"
      class-name="aplication-modal"
      :width="popWidth"
      @on-close="editClose"
    >
      <p slot="header" class="aplication-head">
        <span v-if="popType !== 'set'"
          >{{ popType === "new" ? "新建" : "复制" }}集群</span
        >
        <span v-if="popType === 'set'">新建配置文件</span>
      </p>
      <!-- 字段说明 -->
      <div class="app-station" v-show="explainFlag">
        <div class="station-title">
          <div class="app-lf app-com">
            <h-icon name="ios-information-outl"></h-icon>
          </div>
          <div class="app-com">
            <span>功能说明</span>
          </div>
          <div class="app-com app-rt" @click="closeExplain">
            <h-icon name="android-close"></h-icon>
          </div>
        </div>
        <div class="app-content" v-if="popType === 'new'">
          <p>
            ·通过添加集群，可以管理单个应用在不同的集群（如不同机房）使用不同的配置。
          </p>
          <p>
            ·对于投资赢家应用，只需选择同步节点完成配置文件信息录入。其他应用则需要手动录入。
          </p>
        </div>
        <div class="app-content" v-if="popType === 'copy'">
          <p>·通过集群的复制，减少初始化过程中的重复工作量。</p>
          <p>
            ·复制操作只复制集群已发布的配置，复制内容包含配置列表和文件内容。
          </p>
        </div>
        <div class="app-content" v-if="popType === 'set'">
          <p>·所有配置信息均是私有的，只能被所属集群和应用节点获取到。</p>
          <p>
            ·目前支持的文件格式包含（xml、yml、yaml、json、txt、properties）。
          </p>
          <p>·新增的配置文件默认覆盖该应用下所有集群。</p>
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
        <div v-if="popType !== 'set'">
          <div v-for="(item, i) in editTitle" :key="i">
            <h-form-item
              :label="item"
              :required="false"
              v-if="i >= 0 && i <= 1"
            >
              <h-input
                v-model="editItem[i]"
                multiple
                size="small"
                showTitle
                :placeholder="placeholderTitle[i]"
                v-if="i >= 0 && i <= 1"
              ></h-input>
            </h-form-item>
            <h-form-item :label="item" required v-if="i > 1 && i <= 3">
              <h-input
                v-model="editItem[i]"
                multiple
                size="small"
                showTitle
                :placeholder="placeholderTitle[i]"
              ></h-input>
            </h-form-item>
            <h-form-item
              :label="item"
              required
              v-if="i > 3 && popType === 'new' && false"
            >
              <h-select v-model="editItem[i]" :clearable="false">
                <h-option v-for="(s, i) in editItem[i]" :value="s" :key="i">
                  {{ s }}
                </h-option>
              </h-select>
              <!-- 配置文件 -->
              <div
                class="file-all colony-file"
                v-if="i === 5 && popType === 'new'"
              >
                <h-checkbox
                  :indeterminate="indeterminateColony"
                  :value="checkAllColony"
                  @click.prevent.native="colonyCheckAll"
                  >全选</h-checkbox
                >
                <h-checkbox-group
                  verticalv-model="checkAllColony"
                  @on-change="checkAllColonyChange"
                >
                  <h-checkbox
                    :label="file"
                    v-for="(file, k) in fileColony"
                    :key="k"
                  ></h-checkbox>
                </h-checkbox-group>
              </div>
            </h-form-item>
          </div>
        </div>
        <div v-if="popType === 'set'">
          <h-form-item
              label="应用ID"
              :required="false"
            >
              <h-input
                v-model="setItem.appId"
                multiple
                size="small"
                showTitle
                disabled
              ></h-input>
            </h-form-item>
            <h-form-item
              label="文件名称"
              required
              class="new-file"
            >
              <h-input
                v-model="setItem.fileName"
                multiple
                size="small"
                showTitle
              ></h-input>
              <h-select v-model="setItem.fileType" :clearable="false">
                <h-option v-for="(item, t) in allFileType" :value="item" :key="t">{{ item }}</h-option>
              </h-select>
            </h-form-item>
            <h-form-item
              label="应用ID"
              :required="false"
            >
            <h-input
                v-model="setItem.txt"
                type="textarea"
                multiple
                size="small"
                showTitle
                placeholder="初始化配置文件"
              ></h-input>
            </h-form-item>
        </div>
      </h-form>
      <div class="msg-footer" slot="footer">
        <h-button @click="editClose">取消</h-button>
        <h-button type="primary" @click="editConfirm">{{popType === 'set' ? '创建' : '确定'}}</h-button>
      </div>
    </h-msgBox>
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
  </div>
</template>
<script>
import baseInfo from "./param.js";
import { deepClone } from "@commonMethod";
import PopBox from "@configuration/components/PopBox";
export default {
  data() {
    return {
      aplicationId: this.$route.query.aplicationId || "",
      aplicationName: decodeURIComponent(
        this.$route.query.aplicationName || ""
      ),
      aplicationPath: "/CONFIGURATION/views/webApplication/index",
      countNum: 0, // 批量删除
      delNum: 0,
      deleteData: [],
      comTitle: deepClone(baseInfo.comData.baseColumn),
      tableData: [],
      totalNum: 0,
      popEdit: false,
      popWidth: 497,
      popType: "new",
      explainFlag: true,
      editTitle: [
        "应用ID",
        "部署环境",
        "集群ID",
        "集群名称",
        "同步节点",
        "配置文件"
      ],
      editItem: ["", "", "", "", "", ""], // 修改权限-负责人
      placeholderTitle: [
        "",
        "",
        "请输入集群id",
        "请输入集群名称",
        "请选择同步节点"
      ],
      fileColony: [], // 配置文件集
      checkAllColony: [],
      indeterminateColony: true,
      checkAllColony: false,
      secondFlag: false,
      secondType: "",
      secondTitle: "",
      operType: "", // 区分delete
      secondExtend: "", // 配合删除使用， 拓展文案
      delName: "",
      setItem: deepClone(baseInfo.comData.setItem),
      allFileType: ['xml', 'yaml', 'yml', 'json', 'properties', 'txt']
    };
  },
  computed: {
    editRequire(i) {
      return true;
      // return i > 2 ? true : false;
    }
  },
  components: {
    PopBox
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initParam();
      this.initTable();
    },
    initParam() {
      this.popEdit = false; // false
      this.secondFlag = false; // false
      this.comTitle = deepClone(baseInfo.comData.baseColumn);
      this.comTitle[9].render = (h, params) => {
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
                padding: "0 15px 0 0"
              },
              on: {
                click: () => {
                  this.delFunc(params);
                }
              }
            },
            "删除"
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
                  this.copyFunc(params);
                }
              }
            },
            "复制"
          )
        ]);
      };
      this.comTitle[1].render = (h, params) => {
        return h('div', [
          h(
            'div',
            {
              props: {
                type: 'text',
                size: 'small'
              },
              style: {
                color: '#037DF3',
                background: 'none',
                cursor:'pointer'
              },
              on: {
                click: () => {
                  this.toSetting(params)
                }
              }
            },
            '' + params.row.colonyName
          )
        ])
      }
    },
    initTable(i) {
     
      this.countNum = 0;
      this.delNum = 0;
      this.deleteData = [];
      this.totalNum = 0;

      if (!i) {
        this.geMainData();
      }
    },
    geMainData() {
      // test
      let test = [
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",
       
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08",

        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        },
        {
          colonyName: "xxx机房-灰度",
          colonyId: "oss_shanghai_cmcc",
          appId: "macs",
          enviroment: "PROD",
          fileNum: "12",
          appPerson: "zhangsan",
          create: "2016-09-21 08:50:08",
          update: "2016-09-21 08:50:08"
        }
      ];
      this.tableData = test;
    },
    // 弹框打开（新增/编辑）
    editOpen() {
      this.explainFlag = true;
      this.popEdit = true;
    },
    // 弹框关闭（新增/编辑）
    editClose() {
      this.popEdit = false;
      let form = "colonyForm";
      this.$refs[form].resetFields(); // 弹框重置
    },
    // 新建集群
    addFunc() {
      this.popType = "new";
      this.getFileFunc(); // 获取配置文件
    },
    // 复制集群
    copyFunc() {
      this.popType = 'copy';
      this.editOpen();
    },
    closeExplain() {
      this.explainFlag = false;
    },
    // 配置文件
    getFileFunc() {
      let test = ["client_cfg_xml", "client_cfg_xml", "client_cfg_xml"];
      this.fileColony = test;
      setTimeout(() => {
        this.editOpen();
      }, 500);
    },
    // 配置文件，全选
    colonyCheckAll() {
      this.checkAllColony = this.indeterminateColony ? false : !this.checkAll;
      this.indeterminateColony = false;
      this.checkAllColony = this.checkAllColony ? this.fileColony : [];
    },
    // 配置文件，select
    checkAllColonyChange(data) {
      if (data.length === this.fileColony.length) {
        // 全选
        this.indeterminateColony = false;
        this.checkAllColony = true;
      } else if (data.length > 0) {
        this.indeterminateColony = true;
        this.checkAllColony = false;
      } else {
        this.indeterminateColony = false;
        this.checkAllColony = false;
      }
    },
    // 确认
    editConfirm() {
      if (this.popType === "new") {
        // 接口
      } else if (this.popType === "copy") {
        // 接口
      } else if (this.popType === 'set') { // 新增的配置文件默认会覆盖到该应用的所有集群
        // 接口
      }
      this.editClose();
    },
    // select删除
    selectChange(i) {
      this.deleteData = i;
      this.countNum = i.length;
      this.delNum = i.length;
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
    // 单选删除
    delFunc(i) {
      this.deleteData = [];
      this.deleteData.push(i.row);
      this.delNum = 1;
      this.delMore();
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
        this.delName = this.deleteData[0].colonyName || "test"; // 集群名称（字段待确认）
        this.secondExtend =
          "这条集群记录，删除后所管理的实例无法获取新配置信息，你还要继续吗？";
      } else if (this.delNum > 1) {
        this.delName =
          "是否删除该" +
          this.countNum +
          "条记录，删除后所管理的实例无法获取新配置信息，你还要继续吗？"; // 批量删除文案待确认
      }
    },
    // 确认
    confirmFunc() {
      if (this.operType === "delete" && this.secondType === "prompt") {
        this.secondClose();
        // 接口删除(成功or失败)
        let that = this;
        setTimeout(() => {
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
    // 删除，继续
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
    // 删除，取消
    popCancelFunc() {
      this.initTable();
      this.secondClose();
    },
    clearFunc() {
      this.initTable();
    },
    // 新建配置文件
    addSetFunc() {
      this.popType = 'set';
      this.editOpen();
    },
    toSetting(i) { // 应用-配置管理
      console.log(i)
      this.$router.push({path: '/CONFIGURATION/views/webSetting/index', 
      query: {'colonyId': i.row.colonyId,'colonyName': encodeURIComponent(i.row.colonyName), aplicationName: encodeURIComponent(this.aplicationName), aplicationId: this.aplicationId}});
    },
  }
};
</script>
