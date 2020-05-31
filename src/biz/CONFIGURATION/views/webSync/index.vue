<style module="style" src="@configuration/index.css"></style>
<template>
    <div>
        <div class="webSyncColony">
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
                        <p>·通过同步配置功能，可以使多个集群间的配置保持一致。</p>
                        <p>·需要注意的是，同步完之后需要手动发布后才会对应用生效。 </p>
                    </div>
                </div>
         </div>
        <div class="webSyncMain">
            <div class="targetColonyList">
                <h-tree :data="syncBaseData" show-checkbox ></h-tree>
            </div>
            <div class="syncConfigInfor">

            </div>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            explainFlag: true,
            syncBaseData: [{
                    expand: true,
                     checked: true,
                    title: '目标集群列表',
                    children: [{
                        title: 'XX集群',
                        expand: true,
                        children: [{
                            expand: true,
                            checked: true,
                            title: 'XX机房',
                        }, {
                            title: 'XX机房',
                            checked: true,
                        }]
                    }]
                }]
        }
    },
}
</script>
<style lang="scss" scoped>
    .webSyncColony{
        padding: 10px;
    }
</style>