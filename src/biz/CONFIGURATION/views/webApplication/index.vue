<style module="style" src="@configuration/index.css"></style>
<template>
  <!-- 应用管理 -->
  <div class="web-pages web-applications">
    <div class="top-bar">
      <h-button type="primary" icon="android-add" @click="addFunc">新建应用</h-button>
      <h-button type="gost" @click="delMore">批量删除</h-button>
    </div>
    <div class="notice-bar" :class="style.notice">
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
    <div class="user-table">
      <h-table
        border
        :columns="comTitle"
        :data="tableData"
        @on-select="selectOne"
        @on-select-all="selectAll"
        @on-selection-change="apSelectChange"
        @on-select-cancel="selectCancel"
      ></h-table>
    </div>
    <!-- 弹框(add/edit) -->
    <h-msgBox v-model="popEdit"
      :mask-closable="false"
      class-name="aplication-modal"
      :width="popWidth"
      @on-close="editClose">
      <p slot="header" class="aplication-head">
        <span v-if="popType !== 'init' && popType !== 'rights'">{{ popType === "new" ? "新建" : "编辑" }}应用</span>
        <span v-if="popType === 'init'">配置文件初始化</span>
        <span v-if="popType === 'rights'">修改应用管理权限</span>
      </p>
      <!-- 字段说明 -->
      <div class="app-station" v-show="explainFlag">
        <div class="station-title">
          <div class="app-lf app-com">
            <h-icon name="ios-information-outl"></h-icon>
          </div>
          <div class="app-com"><span>{{popType !== 'init' && popType !== 'rights' ? '字段' : '功能'}}说明</span></div>
          <div class="app-com app-rt" @click="closeExplain"><h-icon name="android-close"></h-icon></div>
        </div>
        <div class="app-content" v-if="popType !== 'init' && popType !== 'rights'">应用负责人默认具有项目管理员权限</div>
        <div class="app-content" v-if="popType === 'init'">
          <p>·同步节点是指配置文件拉去的节点。</p>
          <p>·配置文件是该应用支持的配置管理的文件清单。</p>
        </div>
        <div class="app-content" v-if="popType === 'rights'">
          <p>·应用负责人可以查看、修改、发布、管理集群/配置文件。</p>
          <p>·应用负责人不可删除应用，可以同时制定多个用户为负责人。</p>
        </div>
      </div>
      <h-form
          ref="aplicationForm"
          :model="editItem"
          :label-width="151" 
          errorFocus
          onlyBlurRequire
          cols="1"
          class="aplication-form"
          v-if="popType !== 'init' && popType !== 'rights'"
        >
          <h-form-item :label="item" prop="edit1" required v-for="(item, i) in editTitle" :key="i">
              <h-input v-model="editItem[i]"
                       multiple
                       size="small"
                       showTitle
                       :placeholder="placeholderTitle[i]"
                       v-if="i > 0 && i < 3"
              >
              </h-input>
              <h-select v-model="editItem[i]" :clearable="false" v-if="i === 0 || i > 2">
                <h-option v-for="(s, i) in editItem[i]" :value="s" :key="i">{{ s }}</h-option>
              </h-select>
            </h-form-item>
        </h-form>
        <!-- 配置文件初始化 -->
        <h-form
          ref="aplicationInitForm"
          :model="initItem"
          :label-width="77"
          errorFocus
          onlyBlurRequire
          cols="1"
          class="aplication-form init-form"
          v-if="popType === 'init'"
        >
          <h-form-item label="配置文件" required class="aplication-file">
            <div class="file-all">
              <h-checkbox
              :indeterminate="indeterminate"
              :value="checkAll"
              @click.prevent.native="handleCheckAll">全选</h-checkbox>
            </div>
            <h-checkbox-group v-model="checkAllGroup" @on-change="checkAllGroupChange">
              <h-checkbox :label="items" v-for="(items, j) in fileGroup" :key="j"></h-checkbox>
            </h-checkbox-group>
          </h-form-item>
          <div class="aplication-set">
            <h-form-item :label="t" required v-for="(t, k) in setTitle" :key="k" :class="{set1: k === 0, set2: k === 1, set3: k === 2}">
              <h-input v-model="setData[k]"
                       multiple
                       size="small"
                       showTitle
                       :placeholder="placeholderTitle[k + 1]"
                       v-if="k < setTitle.length - 1"
              >
              </h-input>
              <h-select v-model="setData[k]" :clearable="false" v-if="k === setTitle.length - 1">
                <h-option v-for="(p, z) in allPoint" :value="p" :key="z">{{ p }}</h-option>
              </h-select>
            </h-form-item>
            <div class="point-add">
               <h-button type="primary" @click="addPointFunc">添加</h-button>
            </div>
          </div>
        </h-form>
        <div class="file-table" v-if="popType === 'init'">
          <!-- 配置文件初始化表格 -->
            <h-table
              border
              :columns="initTitle"
              :data="initFileData"
            ></h-table>
        </div>
        <!-- 权限管理 -->
        <h-form
          ref="rightForm"
          :model="rightItem"
          :label-width="151" 
          errorFocus
          onlyBlurRequire
          cols="1"
          class="aplication-form"
          v-if="popType === 'rights'"
        >
          <h-form-item label="应用负责人" required>
              <h-select v-model="rightItem" :clearable="false">
                <h-option v-for="(r, z) in rightData" :value="r" :key="z">{{ r }}</h-option>
              </h-select>
            </h-form-item>
        </h-form>
        <div class="msg-footer" slot="footer">
          <h-button @click="editClose">取消</h-button>
          <h-button type="primary" @click="editConfirm">{{popType === 'init'? '发布' : '确定'}}</h-button>
        </div>
    </h-msgBox>
    <!-- 二次弹框 -->
    <PopBox :popFlag="secondFlag" :popType="secondType" 
    :popTitle="secondTitle" :moduleType="operType" 
    :popTxt="delName" :deleteNum="delNum"
    :deleteExtend="secondExtend" @popConfirm="confirmFunc" @popCancel="popCancelFunc"></PopBox>
  </div>
</template>
<script>
import baseInfo from "./param.js";
import { deepClone } from "@commonMethod";
import param from './param.js';
import PopBox from '@configuration/components/PopBox'
export default {
  components: {
    PopBox
  },
  data() {
    return {
      isSuper: false,
      countNum: 0, // 批量删除
      delNum: 0,
      deleteData: [], // 删除项
      popWidth: 497,
      comTitle: deepClone(baseInfo.comData.baseColumn),
      tableData: [],
      popEdit: false, // 新增编辑
      popType: 'new', // new,edit,init
      editTitle: ['应用类型', '应用ID', '应用名称', '部门名称', '应用负责人'],
      editItem: [],
      placeholderTitle: ['', '请输入应用英文名称', '请输入应用中文含义', '', ''],
      fileData: [],
      initItem: [],
      indeterminate: true,
      checkAll: false,
      checkAllGroup: [],
      fileGroup: [], // 配置文件，all
      setTitle: ['集群ID', '集群名称', '同步节点'],
      setData: ['', '', []],
      setPlaceholder: ['', '', ''],
      allPoint: ['192.168.172.122'], // all节点
      initTitle: deepClone(baseInfo.comData.initColumn),
      initFileData: [],
      rightItem: '', // 应用负责人（权限）
      rightData: [],
      explainFlag: true,
      secondFlag: false, // 二次弹框
      secondType: '',
      secondTitle: '',
      operType: '', // 区分delete
      secondExtend: '', // 配合删除使用， 拓展文案
      delName: ''
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      // 登录信息判断是否是超管（字段待提供）
      this.isSuper = true; // false

      this.initParam();
      this.initTable();
      this.getMainData();
    },
    initParam() {
      // 数据初始化
      this.comTitle = deepClone(baseInfo.comData.baseColumn)
      this.comTitle[2].render = (h, params) => {
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
                  this.toColony(params)
                }
              }
            },
            '' + params.row.aplicationName
          )
        ])
      }
      this.comTitle[8].render = (h, params) => {
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
                  this.editRightsFunc(params);
                }
              }
            },
            "修改权限"
          )
        ]);
      };
      this.popEdit = false; // false
      this.popType = 'new'; // new
      // 配置文件初始化表头
      this.initTitle[3].render = (h, params) => {
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
                padding: "0 15px 0 0"
              },
              on: {
                click: () => {
                  this.delInitFunc(params);
                }
              }
            },
            "删除"
          )
        ]);
      }
    },
    initTable(i) {
      this.countNum = 0;
      this.delNum = 0;
      this.deleteData = [];
      this.totalNum = 0;
      if (!i) {
        this.getMainData();
      }
    },
    getMainData() {
      // test
      let arr = [
        {
          aplicationId: 'macs10',
          aplicationName: 'macs',
          departmentId: 'wjb',
          departmentName: '网金部',
          responsePerson: 'zhangsan ',
          create: '2016-09-21 08:50:08',
          update: '2016-09-21 08:50:08'
        },
        {
          aplicationId: 'macs10',
          aplicationName: 'macs',
          departmentId: 'wjb',
          departmentName: '网金部',
          responsePerson: 'zhangsan ',
          create: '2016-09-21 08:50:08',
          update: '2016-09-21 08:50:08'
        },
        {
          aplicationId: 'macs10',
          aplicationName: 'macs',
          departmentId: 'wjb',
          departmentName: '网金部',
          responsePerson: 'zhangsan ',
          create: '2016-09-21 08:50:08',
          update: '2016-09-21 08:50:08'
        }
      ];
      this.tableData = arr;
    },
    // 弹框打开（新增/编辑）
    editOpen() {
      this.explainFlag = true;
      this.popEdit = true;
    },
    // 弹框关闭（新增/编辑）
    editClose() {
      this.popEdit = false;
      let form = this.popType === 'init' ? 'aplicationInitForm' : 'aplicationForm';
      if (this.popType === 'rights') {
        form = 'rightForm';
      }
      this.$refs[form].resetFields(); // 弹框重置
    },
    // 新建应用open
    addFunc() {
      this.popType = 'new';
      this.popWidth = 497;
      this.editOpen();
    },
    // 新建应用save
    editConfirm() {
      if (this.popType !== 'init') {
        this.editSave();
      } else {
        this.editClose();
      }
    },
    editSave() {
      // 保存接口（待添加）
      this.editClose();
      setTimeout(() => {
        if (this.popType === 'new') { // 配置文件初始化open
          this.popType = 'init';
          this.popWidth = 637;
          this.editOpen();
          // 获取配置文件
          this.geInitFile();
          // 获取集群列表
          this.getInitList();
        }
      }, 300);
    },
    // 获取配置文件
    geInitFile() {
      // test
      let test = ['client_cfg_xml', 'uc_date.json', 'home_date.json', 'trade.xml'];
      this.fileGroup = test
    },
    // 配置文件，全选
    handleCheckAll() {
      this.checkAll = this.indeterminate ? false : !this.checkAll;
      this.indeterminate = false;
      this.checkAllGroup = this.checkAll ? this.fileGroup : [];
    },
    // 配置文件，select
    checkAllGroupChange(data) {
      if (data.length === this.fileGroup.length) { // 全选
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
    // 获取配置文件列表
    getInitList() {
      // test
      let test = [
        {
          initId: 'macs_cente_cucc',
          initName: '中心机房联通',
          initPoint: '192.168.172.122'
        }
      ];
      this.initFileData = test;
    },
    // 配置文件table删除
    delInitFunc(i) {
      // 删除当前item
    },
    // 新增节点
    addPointFunc() {
      // 添加setData[2]
    },
    // 应用权限管理
    editRightsFunc() {
      // 注意：仅超管可修改，应用负责人不可修改
      this.canOpen('rights'); // 添加弹框提示(样式待确认test)
      this.popType = 'rights';
      this.popWidth = 497;
      this.editOpen();
    },
    closeExplain() {
      this.explainFlag = false;
    },
    toColony(i) { // 应用-集群
      this.$router.push({path: '/CONFIGURATION/views/webColony/index', 
      query: {'aplicationId': i.row.aplicationId,'aplicationName': encodeURIComponent(i.row.aplicationName)}});
    },
    // 多选
    apSelectChange(i) {
      this.deleteData = i;
      this.countNum = i.length;
      this.delNum = i.length;
    },
    // 二次弹框close
    secondClose() {
      this.secondFlag = false;
      this.secondTitle = '';
      this.secondExtend = '';
    },
    // 权限判断是否可操作
    canOpen(type) { // 需判断是否是超级管理，超管：有权限；应用负责人：无权限，同时错误提示（应用负责人无权限删除应用）
      if (!this.isSuper) {
        let txt = '';
        // 弹框样式(样式待确认test)
        if (type === 'rights') {
          txt = '应用负责人无权限修改应用管理权限';
        } else if (type === 'delete') {
          txt = '应用负责人无权限删除应用';
        }
        return;
      }
    },
    // 二次弹框open
    secondOpen() {
      // 需判断是否是超级管理，超管：有权限；应用负责人：无权限，同时错误提示（应用负责人无权限删除应用）
      this.canOpen('delete');
      this.secondType = 'prompt';
      this.secondFlag = true;
    },
    // 单选删除
    delFunc(i) {
      this.delNum = 1;
      this.deleteData = [i.row];
      this.delMore();
    },
    // 批量删除
    delMore(type) {
      this.canOpen('delete');
      if (this.delNum === 0) {
        return;
      }
      this.secondTitle = '删除提示';
      this.operType = 'delete';
      this.secondOpen();
      
      if (this.delNum === 1) {
        this.delName = this.deleteData[0].aplicationName || 'test'; // 集群名称（字段待确认）
        this.secondExtend = '这条应用记录，删除后实例无法获取新配置信息，你还要继续吗？';
      } else if (this.delNum > 1) {
        this.delName = '是否删除该' + this.delNum + '条记录，删除后实例无法获取新配置信息，你还要继续吗？'; // 批量删除文案
        this.secondExtend = '';
      }
    },
    // 确认
    confirmFunc() {
      if (this.operType === 'delete' && this.secondType === 'prompt') {
        this.secondClose();
        // 接口删除(成功or失败)
        let that = this;
        setTimeout(() => {
          that.secondOpen();
          that.confirmDelFunc('error'); // error,success
        }, 600);
      } else {
        if (this.operType === 'delete' && this.secondType === 'success') {
            this.initTable();
          } else if (this.operType === 'delete' && this.secondType === 'error') {
            this.initTable();
          }
        this.secondClose();
      }
    },
    // 删除，继续
    confirmDelFunc(type) {
      this.secondType = type;
      this.secondTitle = type === 'success' ? '删除成功' : '删除错误提示';
      if (this.countNum === 1) {
        this.secondExtend = type === 'success' ? '删除成功' : '删除失败'; // 具体文案待定
      } else { // 批量删除
        this.delName = type === 'success' ? '批量删除成功' : '批量删除失败'; // 具体文案待定
        this.secondExtend = '';
      }
    },
    // 删除，取消
    popCancelFunc() {
      this.initTable();
      this.secondClose();
    },
    clearFunc() {
      this.initTable();
    }
  }
};
</script>
