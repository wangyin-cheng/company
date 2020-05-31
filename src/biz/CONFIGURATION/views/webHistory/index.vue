 
 <style module="style" src="@configuration/index.css"></style>
 <template>
    <div style="position: relative; height: 100%; background:white" >
        <h-table border  
        :columns="comColumns" 
        :data="tableData"
        ></h-table>
        <div style="overflow: hidden; ">
            <div style="margin:20px 30px; float: right;" >
                <h-page :total="tableTotal" show-elevator 
                :page-size="pageSize"
                @on-change="pageChangedata"
                ></h-page>
            </div>
        </div>
        <!-- 详细 -->
        
        <h-drawer v-model="vsiibleDetails" class-name="h-ui-123"
        transfer= "false" 
        scrollable = "true"
        inner width="400" title="详细" 
        :styles="styles" >
            <pre class='hljs'>
                <code id="historyCode">
                     import baseInfo from "./param.js"; 
                     import baseInfo from "./param.js"; 
                     import baseInfo from "./param.js"; 
                </code>
            </pre>
         </h-drawer>
         
         <!-- 弹框 -->
         <h-msgBox
            v-model="popEdit"
            :mask-closable="false"
            class-name="aplication-modal"
            :width="popWidth"
            @on-close="editClose"
        >
             <p slot="header" class="aplication-head">
                <span>修改配置应用集群</span>
             </p>
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
                    <div class="app-content" >
                        <p>·修改后配置默认应用到当前集群。</p>
                        <p>·如需应用覆盖到其他集群，请全选或者多选 </p>
                    </div>
        
            </div>
            <!-- 多选按钮 -->
                <h-form
                    ref="colonyForm"
                    errorFocus
                    onlyBlurRequire
                    cols="1"
                    class="aplication-form"
                >
                       <h-form-item label="覆盖集群" :required="false" label-width="80">
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
                </h-form>
                  <!-- 底部按钮 -->
            <div class="msg-footer" slot="footer">
                <h-button @click="editClose">取消</h-button>
                <h-button type="primary" @click="editConfirm"> 确认</h-button>
            </div>
         </h-msgBox>
    </div>
</template>
<style lang="scss" scoped>
    .hljs{
        display: flex !important;
    }
    #historyCode{
        margin-left: -100px;
        
    }
</style>
<script>
import baseInfo from "./param.js"; 
import { deepClone } from "@commonMethod";
import PopBox from "@configuration/components/PopBox";
import hljs from 'highlight.js'
import 'highlight.js/styles/googlecode.css' //样式文件

export default {
    data(){
        return{
            html:'import baseInfo from "./param.js"; ',
            tableData:[],
            tableList:[],
            comColumns: deepClone(baseInfo.comData.baseColumn),
            tableTotal: 2,
            pageIndex: 1,
            pageSize: 1,
            vsiibleDetails: false , //详情的显示隐藏
            styles: {
                    height: 'calc(100% - 40px)',
                    paddingBottom: '53px',
            },
            contents: "import 'highlight.js/styles/googlecode.css' //样式文件",
            popWidth:500,
            popEdit: false, //显示隐藏弹框
            explainFlag: false, 
            // 全选的参数 
            indeterminate: true,
            checkAll: false,
            checkAllGroup: ["XXX集群"],
            checkboxOption: ["XXX集群", "YYY集群", "ZZZ集群"],
        }
    },
    mounted() {
    this.init();
   },
    components: {
       
    },
    methods:{
        // 初始化
        init() {
            this.initParam()
        },
        // 初始化数据
        initParam () {
            this.getMainData()
            this.tableData = this.tableList.slice(0, this.pageSize);
            this.comColumns = deepClone(baseInfo.comData.baseColumn);
            this.comColumns[8].render = (h, params) => {
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
                    this.detailsFunc(params);
                    }
                }
                },
                "详细"
            )]);};
            this.comColumns[3].render = (h, params) => {
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
                        this.amendColonyName(params)
                        }
                    }
                    },
                    '111' 
                )
                ])
            }
        },
        // 分页发生改变触发的事件
        pageChangedata(i) {
             this.tableData = this.tableList.slice(
                    (i - 1) * this.pageSize,
                    this.pageSize * i
                );
        },
        // 获取列表数据。
        getMainData () {
            const  test = [
                {
                    versionNumber: '1-2-3',
                    status: "回滚",
                    useId: '12',
                    colonyName: 'colonyName',
                    Profile: 'Profile',
                    appPerson: 'appPerson',
                    create: 'create',
                    update: 'update',
                },
                 {
                    versionNumber: '1-2-3',
                    status: "普通发布",
                    useId: '13',
                    colonyName: 'colonyName',
                    Profile: 'Profile',
                    appPerson: 'appPerson',
                    create: 'create',
                    update: 'update',
                }
            ]
            this.tableList = test;
        },
        // 详情点击事件
        detailsFunc() {
        let historyCode = document.querySelector('#historyCode')
        historyCode.innerHTML = this.contents
         this.vsiibleDetails = true;
         this.highlightDom();
        
        },
        // 高亮插件
        highlightDom() {
              let blocks = document.querySelectorAll('.hljs');
              blocks.forEach((block)=>{
                hljs.highlightBlock(block)
            })
       },
    //    取消触发事件
       editClose () {
            this.popEdit = false;
            this.explainFlag = false;
       },
    //    
        closeExplain() {
        this.explainFlag = false;
        },
        // 点击确认按钮
        editConfirm() {
            // 等待接口把值传过去
            this.editClose();
        },
        // 修改集群名称
        amendColonyName (){
              this.popEdit = true;
            this.explainFlag = true;
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
    }
}
</script>