<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-03 13:52:40
 * @description: 分享页面
-->
<template>
  <div class="measurement-receiver-share">
    <SceneComponent
      :showFooter="false"
      :showRightMenu="true"
      :showLeftMenu="true"
      :options="sceneOptions"
      ref="sceneComponentRef"
      @collapseChange="collapseChange"
    >
      <template slot="title">
        <div></div>
      </template>
      <template slot="top-menu">
        <div class="name">{{ projectName }}</div>
        <div class="menu">
          <span
            class="date"
            v-if="startCollectDate"
          >{{ $t('collectDate')}}：{{ startCollectDate }} - {{ endCollectDate }}</span>
        </div>
        <div
          class="top-menu-btn"
          :disabled="disable"
        >
          <el-button
            @click="openDownloadDialog"
            v-if="resultTree.length > 0"
          >{{ $t('download')}}</el-button>
        </div>
      </template>
      <template slot="left">
        <div class="left-content">
          <div class="top">
            <CustomTree
              v-if="layerTree.length > 0"
              ref="layerTreeRef"
              :treeProps="treeProps"
              :isDelete="false"
              :isEdit="false"
              :isFocus="true"
              :draggable="false"
              :treeData="layerTree"
              :clearScene="clearResultScene"
              @handleCheckCallBack="handleCheckCallBack"
            />
            <no-content
              v-else
              :text="$t('measurement.noLayerData')"
            />
          </div>
          <div
            class="bottom"
            v-loading="resultTreeLoading"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            v-if="resultTree.length > 0"
          >
            <CustomTree
              v-if="resultTree.length"
              ref="resultTreeRef"
              :key="renderKey"
              :defaultExpandedKeys="defaultExpandedKeys"
              :defaultExpandAll="false"
              :treeProps="treeProps"
              :isDelete="false"
              :isEdit="false"
              :isFocus="false"
              :draggable="false"
              :treeData="resultTree"
              :loading="resultLoading"
              :nodeClick="handleNodeClick"
              :check="handleCheck"
              :checkChange="handleCheckChange"
            />
            <no-content
              v-else
              :text="$t('measurement.noMeasurementResult')"
            />
          </div>
        </div>
      </template>
      <template slot="right">
        <div class="right-content">
          <AreaInfoCard
            :info="curPointData"
            v-if="pointActive"
          />
        </div>
      </template>
    </SceneComponent>
    <ChartCollapse
      ref="chartRef"
      v-if="resultTree.length"
      :chartOption="chartOption"
      :isShowConfig="false"
      :isExpand="pointActive"
      :list="legendArr"
      :slideWidth="slideWidth"
    />
    <ShareDownLoadDialog
      :visible.sync="downloadVisible"
      :downLoading="downLoading"
      :downDrawingLoading="downDrawingLoading"
      @downloadShareLeger="downloadShareLeger"
      @shareDownloadDrawing="shareDownloadDrawing"
      @closeDialog="stopPolling"
    />
  </div>
</template>
<script>
import moment from 'moment'
import { EnumTypes } from '@/common/enum'
import meshMixins from '@/mixins/meshMixins'
import drawMixins from '@/mixins/drawMixins'
import drawConfig from './chartConfig/taskConfig'
import { getReceiveShareDetail, downloadShareLeger, downloadShareDrawing, getShareCalculateResult, getShareMeshData } from '@/api/business'
import { addRandomKeys, collectNonLeafKeys, findKeysByVal, findNodeListsWithType, loadOBJFile } from '@/utils/index'
import SceneComponent from '@/components/scene/index.vue'
import NoContent from '@/components/NoContent.vue'
import CustomTree from '@/components/CustomTree.vue'
import ChartCollapse from './components/ChartCollapse.vue'
import AreaInfoCard from './components/AreaInfoCard.vue'
import ShareDownLoadDialog from './components/ShareDownLoadDialog.vue'

export default {
  name: 'MeasurementReceiverShare',
  components: {
    SceneComponent,
    NoContent,
    CustomTree,
    ChartCollapse,
    AreaInfoCard,
    ShareDownLoadDialog
  },
  mixins: [meshMixins, drawMixins],
  data() {
    return {
      sceneId: '',
      pointActive: false, // 是否激活桩号
      sceneOptions: {},
      resultLoading: true,
      pointList: [],
      layerTree: [],
      resultTree: [],
      chartOption: {},
      taskId: '',
      disable: true,
      treeProps: {
        children: 'children',
        label: 'name'
      },
      slideWidth: {
        left: 300,
        right: 300
      },
      startCollectDate: '',
      endCollectDate: '',
      curPointData: null,
      renderKey: 0,
      resultTreeLoading: false,
      loading: false,
      projectName: '',
      downloadVisible: false,
      downLoading: false,
      downDrawingLoading: false,
      pollingInterval: null,
      curClickNode: null,
      angle: 0,
      otherTree: [],
      meshData: []
    }
  },
  created() {
    const { shareCode } = this.$route.query
    this.shareCode = shareCode
    this.shareInit()
  },
  mounted() {
    this.$refs.sceneComponentRef?.closeAside('right')
  },
  methods: {
    // 折叠
    collapseChange(slide) {
      this.slideWidth = slide
    },
    // 分享数据
    getReceiveShareDetail() {
      return getReceiveShareDetail(this.shareCode).then((res) => {
        return res
      })
    },
    // 打开下载弹窗
    openDownloadDialog() {
      this.downloadVisible = true
    },
    // 下载台账
    async downloadShareLeger() {
      this.downLoading = true
      try {
        const data = (await downloadShareLeger(this.shareCode)) || ''
        if (data) {
          // window.location.href = data
          this.downLoading = false
          window.open(data, '_blank')
        }
        this.$message.success('下载成功')
      } catch (error) {
        this.$message.error('下载失败')
        this.downLoading = false
        console.error('下载失败', error)
      }
    },
    // 下载图纸
    async shareDownloadDrawing() {
      this.downDrawingLoading = true
      this.startPolling()
    },
    // 轮询查询图纸的data
    async pollDownloadShareDrawing() {
      try {
        const data = (await downloadShareDrawing(this.shareCode, 2)) || ''
        if (data) {
          window.location.href = data
          this.downDrawingLoading = false
          this.stopPolling()
        } else {
          this.startPolling()
        }
      } catch (error) {
        this.$message.error('下载失败')
        this.downDrawingLoading = false
        this.stopPolling()
      }
    },
    // 开始轮询
    startPolling() {
      this.pollingTimeout = setTimeout(() => {
        this.pollDownloadShareDrawing()
      }, 3000) // 每3秒轮询一次
    },
    // 停止轮询
    stopPolling() {
      if (this.pollingTimeout) {
        clearTimeout(this.pollingTimeout)
        this.pollingTimeout = null
      }
    },
    // 根据收方结果过滤显示
    filterCheckedNode(areaList, resultPointList) {
      areaList.forEach((item) => {
        if (item.children && item.children[0]?.type === EnumTypes.AREA) {
          this.filterCheckedNode(item.children, resultPointList)
        } else {
          item.children?.forEach((area) => {
            area?.children?.forEach((point) => {
              if (resultPointList?.includes(point?.resource?.gisCoordinate)) {
                point.checked = true
              } else {
                point.checked = false
              }
            })
          })
        }
      })
    },
    // 分享收方初始化
    async shareInit() {
      const layerRes = await this.getReceiveShareDetail()
      this.projectName = layerRes?.name || ''
      this.taskId = layerRes?.taskId
      // 采集日期
      this.startCollectDate = moment(layerRes?.collectStartDate).format('YYYY-MM-DD')
      this.endCollectDate = moment(layerRes?.collectEndDate).format('YYYY-MM-DD')

      // 收方模板
      const template = layerRes?.catalogs?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
      // 中心线
      const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
      // 区域
      const areaList = template?.children?.filter((item) => item.type === EnumTypes.AREA) || []
      const resultTree = layerRes?.catalogs?.filter((item) => item.type === EnumTypes.RESULT) || []
      const otherTree = layerRes?.catalogs?.filter((item) => item.type !== EnumTypes.RESULT) || []
      this.otherTree = otherTree
      const resultPointList = findNodeListsWithType(resultTree, EnumTypes.RESULT_STAKE)?.map((item) => item.resource?.gisCoordinate) || []
      // 递归过滤桩号
      this.filterCheckedNode(areaList, resultPointList)
      // 场景
      this.sceneOptions = {
        sceneViewToken: layerRes?.viewToken,
        sceneId: layerRes?.sceneId,
        roadLineList,
        areaList,
        isTemplate: false,
        tagNodeClick: this.tagNodeClick,
        sceneAddedCallback: this.sceneAddedCallback
      }
      this.layerTree = otherTree.filter((item) => item.type !== EnumTypes.RECEIPT_TEMPLATE) || []
      this.layerTree = addRandomKeys(this.layerTree, 'root', 'repeated')
      // 收房成果type 为 EnumTypes.RESULT
      if (resultTree?.[0]?.children?.length) {
        this.resultTree = addRandomKeys(resultTree)
        this.defaultExpandedKeys = collectNonLeafKeys(resultTree)
      }
      this.$nextTick(() => {
        const allKey = findKeysByVal(this.layerTree, 'checked', true)
        const allResultKey = findKeysByVal(this.resultTree, 'checked', true)
        this.$nextTick(() => {
          this.$refs.layerTreeRef?.setCheckedKeys(allKey)
          this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
        })
      })
    },
    // 场景加载回调
    sceneAddedCallback() {
      this.disable = false
      this.getMeshData()
    },

    // 收方成果节点触发
    handleNodeClick(node) {
      if (node.disabled) return
      if (node.type === EnumTypes.RESULT_STAKE) {
        if (this.curClickNode?.id === node.id) return
        // 清除gis断面
        this.clearSceneHandle()
        this.curClickNode = node
        getShareCalculateResult(this.shareCode, node.id).then((res) => {
          // 断面数据
          this.curPointData = JSON.parse(res)
          this.pointActive = true
          this.$refs.sceneComponentRef?.openAside('right')
          this.drawHandle(node, this.otherTree, drawConfig)
        })
      } else if (node.type === EnumTypes.RESULT_REGION) {
        this.pointActive = false
        this.$refs.sceneComponentRef?.closeAside('right')
        // 区域
        const nodes = findNodeListsWithType(this.layerTree, EnumTypes.AREA)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          this.$refs.layerTreeRef.handleFocusNode({}, curNode)
        }
      }
    },
    // 节点点选
    handleCheck(node, obj) {
      if (node.type === EnumTypes.RESULT_STAKE) {
        // 桩点
        const nodes = findNodeListsWithType(this.otherTree, EnumTypes.PILE_NUMBER)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          curNode.checked = node.checked
          this.$refs.layerTreeRef.handleCheck(curNode, {})
          setTimeout(() => {
            this.$refs.layerTreeRef.setChecked(curNode.key, node.checked)
          }, 300)
        }
      } else if (node.type === EnumTypes.RESULT_REGION) {
        // 区域
        const nodes = findNodeListsWithType(this.otherTree, EnumTypes.AREA)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          curNode.checked = node.checked
          this.$refs.layerTreeRef.handleCheck(curNode, {})
          setTimeout(() => {
            this.$refs.layerTreeRef.setChecked(curNode.key, node.checked, true)
          }, 300)
        }
      }
    },
    // 点选回调
    handleCheckCallBack(node) {
      if (node.type === EnumTypes.PILE_NUMBER) {
        // 桩点
        const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_STAKE)
        const curNode = nodes.find((item) => item.name === node.name && item.resource.gisCoordinate === node.resource.gisCoordinate)
        if (curNode) {
          this.$refs.resultTreeRef.setChecked(curNode.key, node.checked)
        }
      } else if (node.type === EnumTypes.AREA) {
        const nodes = findNodeListsWithType(this.resultTree, EnumTypes.AREA)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          this.$refs.resultTreeRef.setChecked(curNode.key, node.checked, true)
        }
      }
    },
    // 节点点选
    handleCheckChange(node, isChecked, isIndeterminate) {
      node.checked = isChecked
    },
    // 清理断面场景
    clearResultScene() {
      this.pointActive = false
      this.clearSceneHandle()
    },
    // 清理场景线
    clearSceneHandle() {
      const ids = drawConfig.map((item) => item.extConfig.id)
      window.bimInstance?.clearDesignLine(ids)
    },
    // 获取所有mesh数据
    getMeshData() {
      getShareMeshData(this.shareCode).then(res => {
        this.meshData = res || []
        const len = this.meshData.length
        const requestList = []
        if (len) {
          for (let i = 0; i < len; i++) {
            const url = this.meshData[i].resourceUrl
            requestList.push(loadOBJFile(url))
          }
          Promise.all(requestList).then((r) => {
            const list = r || []
            list.forEach((item, index) => {
              this.meshData[index].resourceData = item
            })
            const areaNames = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_REGION).map(item => item.name)
            const meshData = this.meshData.filter(item => areaNames.includes(item.regionName))
            this.$nextTick(() => {
              this.drawMesh(meshData, true)
            })
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .measurement-receiver-share {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    .left-content {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      .top {
        height: calc(50% - 5px);
        overflow-y: auto;
        background: #2e343e;
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 10px;
      }
      .bottom {
        height: calc(50% - 5px);
        overflow-y: auto;
        background: #2e343e;
        border-radius: 6px;
        padding: 8px;
      }
    }
    .right-content {
      height: 100%;
      width: 100%;
      overflow-y: auto;
    }
    .match-btn {
      width: 100%;
      margin-top: 15px;
    }

    .name {
      font-size: 16px;
      color: #fff;
      margin-left: 20px;
    }
    .menu {
      display: flex;
      align-items: center;

      .date {
        display: inline-block;
        position: absolute;
        top: 60px;
        left: 360px;
        z-index: 2;
        width: 248px;
        height: 24px;
        border-radius: 4px;
        text-align: center;
        color: $buttonDefaultColor;
        background: rgba(0, 0, 0, 0.7);
      }
    }
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 46px;
      border-bottom: 1px solid $borderDefaultColor;
    }
    .el-alert {
      margin-bottom: 10px;
    }
  }
</style>
