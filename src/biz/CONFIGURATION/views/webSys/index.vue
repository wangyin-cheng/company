<style module="style" src="@configuration/index.css"></style>
<template>
  <!-- 系统管理 -->
  <div class="web-pages web-sys" :class="style.sys">
    <h-tabs class="sys-content" :animated="false" :value="tabValue" @on-click="changeTab">
      <!-- 用户权限 -->
      <h-tab-pane label="用户权限" name="tab1">
        <div>
          <h-button type="primary">同步用户</h-button>
        </div>
        <div class="notice-bar" :class="style.notice">
          <div class="notice-lf">
            <h-icon name="prompt"></h-icon>
            <div class="notice-txt">
              已选择
              <span class="notice-num">{{ userNum }}</span>项
            </div>
          </div>
        </div>
        <!-- 表格 -->
        <div class="user-table">
          <h-table border :columns="userColumn" :data="userData"></h-table>
        </div>
      </h-tab-pane>
      <!-- 部门管理 -->
      <h-tab-pane label="部门管理" name="tab2">
        <div class="department">
          <h-button type="primary" @click="addDepartment">
            <h-icon name="android-add"></h-icon>新建部门
          </h-button>
          <h-button type="ghost" @click="delMore">批量删除</h-button>
        </div>
        <div class="notice-bar" :class="style.notice">
          <div class="notice-lf">
            <h-icon name="ios-information"></h-icon>
            <div class="notice-txt">
              已选择
              <span class="notice-num">{{ departmentCountNum }}</span>项
            </div>
          </div>
        </div>
        <!-- 表格 -->
        <div class="user-table">
          <h-table
            border
            :columns="departmentColumn"
            :data="departmentData"
            @on-selection-change="departmentSelectChange"
          ></h-table>
        </div>
        <div style="margin-top: 15px;">
          <h-page
            :total="pageTotal"
            show-elevator
            @on-change="departmentPageChange"
            style="float: right"
          ></h-page>
        </div>
      </h-tab-pane>
      <!-- 环境配置 -->
      <h-tab-pane label="环境配置" name="tab3">
        <div class="environment-title">环境：</div>
        <div class="environment">
          <h-radio-group v-model="checkEnvironment">
            <h-radio
              :label="env | environmentTitle"
              v-for="(env, i) in envRealEnvironment"
              :key="i"
            ></h-radio>
          </h-radio-group>
        </div>
        <div class="enviroment-bot">
          <h-button type="primary" @click="saveEnvironment">保存</h-button>
          <h-button type="gost">取消</h-button>
        </div>
      </h-tab-pane>
    </h-tabs>
    <!-- user弹框 -->
    <h-msgBox
      v-model="popEdit"
      :mask-closable="false"
      class-name="sys-center-modal"
      width="497"
      @on-close="sysCancel"
    >
      <p
        slot="header"
        class="user-head"
      >{{ popType === "new" ? "新建" : "编辑" }}{{ editTitle[tabIndex] }}</p>
      <div class="edit-user">
        <div class="user-err" v-if="popErr">
          <span class="err-lf">
            <h-icon name="delete_fill"></h-icon>
          </span>
          报错提示
          <span class="user-close" @click="closeErr">
            <h-icon name="close"></h-icon>
          </span>
        </div>
        <h-form
          ref="userForm"
          :model="userItem"
          errorFocus
          onlyBlurRequire
          cols="1"
          class="user-form"
          v-if="tabIndex === 0"
        >
          <h-form-item prop="edit1">
            <h-row>
              <h-col span="12" class="txt-right user-lf">部门id:</h-col>
              <h-col span="12">{{ userItem.id }}</h-col>
            </h-row>
            <h-row>
              <h-col span="12" class="txt-right user-lf">超级管理员</h-col>
              <h-col span="12">
                <h-radio-group v-model="userItem.isSuper">
                  <h-radio label="是"></h-radio>
                  <h-radio label="否"></h-radio>
                </h-radio-group>
              </h-col>
            </h-row>
          </h-form-item>
        </h-form>
        <h-form
          ref="departmentForm"
          :model="departmentItem"
          :label-width="151"
          errorFocus
          onlyBlurRequire
          class="department-form"
          v-if="tabIndex === 1"
        >
          <!-- <h-form-item label="部门id" prop="select1">
            <h-input v-model="departmentItem.id" multiple size="small" showTitle ref="departmentId"></h-input>
          </h-form-item>-->
          <h-form-item label="部门id" prop="id" required>
            <h-input v-model="departmentItem.id" placeholder="请输入部门名称首个小字母"></h-input>
          </h-form-item>
          <h-form-item label="部门名称" prop="name" required>
            <h-input v-model="departmentItem.name" placeholder="请输入部门中文名称"></h-input>
          </h-form-item>
        </h-form>
      </div>
      <div class="msg-footer" slot="footer">
        <h-button @click="sysCancel">取消</h-button>
        <h-button type="primary" @click="userChange">确认</h-button>
      </div>
    </h-msgBox>
    <!-- 二次弹框 -->
    <PopBox
      :popFlag="secondFlag"
      :popType="secondType"
      :popTitle="secondTitle"
      :moduleType="operType"
      :popTxt="delName"
      :deleteNum="departmentDelNum"
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
var tabArr = ["tab1", "tab2", "tab3"];
var userStatus = ["可用", "弃用"];
var superType = ["否", "是"];
var popArr = [
  "是否对选择的配置支持环境进行修改？",
  "配置中心可支持的环境列表已修改！",
  "配置中心可支持的环境列表修改失败！"
];
export default {
  components: {
    PopBox
  },
  data() {
    return {
      baseRICUrl: window.CONFIGURATION_CONFIG.OMC_GSV, //操作员中心服务的url;
      baseUserUrl: window.CONFIGURATION_CONFIG.CONFIGURATION_HOME, //配置中心接口
      pageIndex: 0,
      pageSize: 10,
      pageTotal: 0,
      tabIndex: 0,
      tabValue: tabArr[0],
      userNum: 0, // 选中统计
      userColumn: deepClone(baseInfo.sysData.userColumn),
      userData: [],
      userItem: deepClone(baseInfo.sysData.userItem), // 编辑
      departmentColumn: deepClone(baseInfo.sysData.departmentColumn),
      departmentData: [],
      departmentDeleteData: [], // 删除数据,deleteData
      deleteTxt: "",
      checkEnvironment: "",
      // environmentTitle: [],
      envRealEnvironment: [],
      popEdit: false,
      popErr: false, // 报错
      departmentEdit: false,
      departmentItem: deepClone(baseInfo.sysData.departmentItem), // 编辑
      popType: "new",
      editTitle: ["用户权限", "部门"],
      secondFlag: false, // 二次弹框
      popTitle: [
        "确认提示",
        "保存成功",
        "保存失败",
        "删除提示",
        "删除成功",
        "删除错误提示"
      ],
      secondFlag: false,
      secondType: "", // prompt,success,error
      secondTitle: "",
      operType: "", // 区分delete
      secondExtend: "", // 配合删除使用， 拓展文案
      delName: "",
      departmentCountNum: 0, // 批量删除
      departmentDelNum: 0 // 批量or单选
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initParam();
      this.initTable("param");
    },
    initParam() {
      this.userColumn[5].render = (h, params) => {
        return h("div", [
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
                  this.userEditOpen(params);
                }
              }
            },
            "编辑"
          )
        ]);
      };
      this.departmentColumn[3].render = (h, params) => {
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
                  this.delDepartmentFunc(params);
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
                  this.departmentEditFunc(params);
                }
              }
            },
            "编辑"
          )
        ]);
      };
      this.popEdit = false;
      this.popErr = false;
      this.secondFlag = false;
      this.tabIndex = 0;
      this.changeTab(tabArr[this.tabIndex]);
      this.departmentEdit = false;
      this.popType = "edit";
    },
    initTable(i) {
      this.departmentCountNum = 0;
      this.departmentDelNum = 0;
      this.departmentDeleteData = [];
      // 重新获取数据
      if (!i) {
        this.initDepartment();
      }
    },
    initDepartment() {
      this.tabIndex = 1;
      this.popType = "new";
      this.getDepartment();
    },
    changeTab(i) {
      this.initTable("param");
      this.tabValue = i;
      if (i === tabArr[0]) {
        // 用户权限
        this.tabIndex = 0;
        this.popType = "edit";
        this.getUserInfo();
      } else if (i === tabArr[1]) {
        // 部门权限
        this.initDepartment();
      } else if (i === tabArr[2]) {
        // 环境配置
        this.tabIndex = 2;
        this.popType = "edit";
        this.getEnviroment();
      }
    },
    // 用户权限信息
    getUserInfo() {
      // test
      this.userData = [
        {
          index: 1,
          name: "admin",
          email: "",
          isSuper: false, // 超级管理员，1是0否
          super: superType[0],
          status: userStatus[0],
          operate: ""
        },
        {
          index: 2,
          name: "admin1",
          email: "",
          isSuper: true,
          super: superType[1],
          status: userStatus[0],
          operate: ""
        }
      ];
      // 请求用户获取数据。
      ucpFetch.post(this.baseRICUrl + "/getUserListByPage").then(res => {
        if (res.status === 200) {
          res.data.rows.map(item => {
            if (item.user_status === "0") {
              item.user_status = "可用";
            } else {
              item.user_status = "不可用";
            }
            if (item.user_type === "0") {
              item.user_type = "是";
            } else {
              item.user_type = "否";
            }
          });
          this.userData = res.data.rows;
        } else {
          this.$hMessage.error("获取角色列表失败");
        }
      });
    },
    // 弹框打开(新增/编辑)
    editOpen() {
      this.popErr = false;
      this.popEdit = true;
    },
    // 弹框关闭（新增/编辑）
    editClose() {
      this.popErr = false;
      this.popEdit = false;
      let form = this.tabIndex === 0 ? "userForm" : "departmentForm";
      this.$refs[form].resetFields(); // 弹框重置
    },
    // 弹框报错关闭
    closeErr() {
      this.popErr = false;
    },
    // 编辑用户权限
    userEditOpen(i) {
      this.popType = "edit";
      this.userItem.id = i.row.name || "";
      let flag = i.row.isSuper || false;
      this.userItem.isSuper = flag ? superType[1] : superType[0]; // 是否超级管理员
      this.editOpen();
    },
    // 用户弹框关闭
    sysCancel() {
      this.editClose();
      this.userItem = deepClone(baseInfo.sysData.userItem);
      this.departmentItem = deepClone(baseInfo.sysData.departmentItem);
    },
    // 用户edit确认
    userChange() {
      // 提交
      // 提交确认新建
      if (true) {
        let params = {
          org_id: this.departmentItem.id,
          org_name: this.departmentItem.name
        };
        ucpFetch.post(this.baseUserUrl + "/org/updateOrg", params).then(res => {
          console.log(res);
          // this.departmentData.map((item) => {
          //    if( res.data.body.org_id == item.data.body.org_id){

          //    }
          // })
        });
      }
      this.editClose();
      console.log(this.departmentItem.id);
    },
    // 部门的分页
    departmentPageChange(i) {
      this.pageIndex = i;
      this.getDepartment();
    },
    // 部门权限
    getDepartment() {
      // test
      let parmas = {
        page_index: this.pageIndex,
        page_size: this.pageSize
      };
      ucpFetch.post(this.baseUserUrl + "/org/list", parmas).then(res => {
        if (res.data.error_no === 0) {
          this.pageTotal = res.data.body.total;
          this.departmentData = res.data.body.result;
        }
      });
    },
    // 新建部门
    addDepartment() {
      this.popType = "new";
      this.editOpen();
      this.departmentItem = deepClone(baseInfo.sysData.departmentItem);
    },
    // 打开编辑部门弹框
    departmentEditFunc(i) {
      this.popType = "eidt";
      this.departmentItem.id = i.row.org_id || "";
      this.departmentItem.name = i.row.org_name || "";
      this.editOpen();
    },
    // select删除
    departmentSelectChange(i) {
      this.departmentDeleteData = i;
      this.departmentCountNum = i.length;
      this.departmentDelNum = i.length;
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
    delDepartmentFunc(i) {
      this.departmentDeleteData = [];
      this.departmentDeleteData.push(i.row);
      this.departmentDelNum = 1;
      this.delMore();
    },
    // 部门批量删除
    delMore() {
      if (this.departmentDelNum === 0) {
        return;
      }
      this.secondTitle = "删除提示";
      this.operType = "delete";
      this.secondOpen();
      if (this.departmentDelNum === 1) {
        this.delName = this.departmentDeleteData[0].org_id || "test"; // 集群名称（字段待确认）
        this.secondExtend = "这条记录，删除后无法恢复，你还要继续吗？";
      } else if (this.departmentDelNum > 1) {
        this.delName =
          "请确认是否批量删除该部门信息，共" + this.departmentCountNum + "条?";
      }
    },
    // 继续/确认
    confirmFunc() {
      if (this.operType === "delete" && this.secondType === "prompt") {
        this.secondClose();
        // 接口删除(成功or失败)
        // let params = {
        //   org_ids :[],
        // }
       let params = { org_ids :[] };
        this.departmentDeleteData.map(item => {
          params.org_ids.push(item.org_id);
        });
        // let params = { org_ids: '123', a: 'a'};
        
        ucpFetch
          .post(this.baseUserUrl + "/org/removeOrg", params, {
            headers: {
              "Content-Type": "application/json; charset=UTF-8"
            },
            transformRequest: [
              function (data) {
                data = JSON.stringify(data)
                return data
              }
            ]
          })
          .then(res => {
            // console.log(44444,res)
            // this.getDepartment()
            // console.log("getDepartment",this.departmentData)
          });

        // let that = this;
        // setTimeout(() => {
        //   that.secondOpen();
        //   that.confirmDelFunc('error'); // error,success
        // }, 600);
      } else {
        if (this.operType === "delete") {
          if (this.secondType === "success") {
            this.initTable();
          } else {
            this.initTable(); // this.initTable('param'); 清空不生效
          }
        }
        if (this.secondTitle === "确认提示") {
          let params = {
            env: ""
          };
          switch (this.checkEnvironment) {
            case "开发环境":
              params.env = "dev";
              break;
            case "测试环境":
              params.env = "test";
              break;
            case "准接入环境":
              params.env = "uat";
              break;
            case "生产环境":
              params.env = "pro";
              break;
          }
          ucpFetch
            .post(this.baseUserUrl + "/env/updateEnv", params)
            .then(res => {
              if (res.data.error_no === 0) {
                this.$hMessage.info({
                  content: "保存成功",
                  duration: 3
                });
              } else {
                this.$hMessage.error({
                  content: "保存失败",
                  duration: 3
                });
              }
            });
        }
        this.secondClose();
      }
    },
    // 删除，继续
    confirmDelFunc(type) {
      this.secondType = type;
      this.secondTitle = type === "success" ? "删除成功" : "删除错误提示";
      if (this.departmentDelNum === 1) {
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
      this.initTable("param");
      this.secondClose();
    },
    // 环境设置
    getEnviroment() {
      ucpFetch.post(this.baseUserUrl + "/env/getEnv").then(res => {
        if (res.data.error_no === 0) {
          this.envRealEnvironment = res.data.body.envs;
          switch (res.data.body.result) {
            case "dev":
              this.checkEnvironment = "开发环境";
              break;
            case "test":
              this.checkEnvironment = "测试环境";
              break;
            case "uat":
              this.checkEnvironment = "准接入环境";
              break;
            case "pro":
              this.checkEnvironment = "生产环境";
              break;
          }
        }
      });
    },
    // 保存环境
    saveEnvironment() {
      // 二次确认
      this.secondFlag = true;
      this.secondType = "prompt";
      this.secondTitle = "确认提示";
      this.delName = popArr[0];
    }
  },
  filters: {
    environmentTitle(env) {
      switch (env) {
        case "dev":
          return "开发环境";
          break;
        case "test":
          return "测试环境";
          break;
        case "uat":
          return "准接入环境";
          break;
        case "pro":
          return "生产环境";
          break;
      }
    }
  }
};
</script>