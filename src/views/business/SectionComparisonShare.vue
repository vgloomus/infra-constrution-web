<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-25 10:18:29
 * @description: 断面对比分享
-->
<template>
  <div class="section-comparison-share">
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
        <div class="menu">
          <div class="name">{{ projectName }}</div>
          <span
            class="date"
            v-if="gatherDate"
          >{{$t('collectDate')}}：{{ gatherDate }}</span>
        </div>
        <div class="top-menu-btn">
          <el-button
            @click="downloadVisible = true"
            :disabled="disable"
            class="top-btn"
          >{{$t('download')}}</el-button>
        </div>

      </template>
      <template slot="left">
        <div
          v-loading="disable"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          class="left-content"
        >
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
            />
            <no-content
              v-else
              :text="$t('measurement.noLayerData')"
            />
          </div>
          <div
            class="bottom"
            element-loading-background="rgba(0, 0, 0, 0.8)"
          >
            <CustomTree
              v-if="resultTree.length"
              ref="resultTreeRef"
              :treeProps="treeProps"
              :isDelete="false"
              :isEdit="false"
              :isFocus="false"
              :draggable="false"
              :treeData="resultTree"
              :nodeClick="handleNodeClick"
            />
            <no-content
              v-else
              :text="$t('measurement.noSectionComparisonData')"
            />
          </div>
        </div>
      </template>
      <template slot="right">
        <div class="right-content">
          <AreaInfoCard
            :info="curPointData"
            :type="2"
            v-if="pointActive"
          />
          <no-content
            v-else
            :text="$t('measurement.clickSectionComparisonData')"
          />
        </div>
      </template>
    </SceneComponent>
    <ChartCollapse
      v-if="isActive"
      ref="chartRef"
      :chartOption="chartOption"
      :isExpand="pointActive"
      :slideWidth="slideWidth"
      :isShowConfig="false"
      :list="legendArr"
      :loading="chartLoading"
    />
    <ShareDownLoadDialog
      :visible.sync="downloadVisible"
      :downLoading="downLoading"
      :downDrawingLoading="downDrawingLoading"
      :type="2"
      @downloadShareLeger="downloadShareLeger"
      @shareDownloadDrawing="shareDownloadDrawing"
      @closeDialog="stopPolling"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { EnumTypes } from '@/common/enum'
import moment from 'moment'
import meshMixins from '@/mixins/meshMixins'
import drawMixins from '@/mixins/drawMixins'
import drawConfig from './chartConfig/comparisonsConfig'
import {
  getShareCalculateResult,
  getShareMeshData,
  shareComparisonData,
  downloadShareDrawing,
  downloadShareLeger
} from '@/api/business'
import {
  addRandomKeys,
  findNodeListsWithType,
  findKeysByVal,
  loadOBJFile,
  collectNonLeafKeys
} from '@/utils/index'
import SceneComponent from '@/components/scene/index.vue'
import NoContent from '@/components/NoContent.vue'
import CustomTree from '@/components/CustomTree.vue'
import ChartCollapse from './components/ChartCollapse.vue'
import AreaInfoCard from './components/AreaInfoCard.vue'
import ShareDownLoadDialog from './components/ShareDownLoadDialog.vue'

export default {
  name: 'MeasurementReceiverEdit',
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
      shareCode: '',
      projectName: '',
      gatherDate: '',
      sceneId: '',
      preTaskId: '',
      postTaskId: '',
      pointActive: false, // 是否激活桩号
      sceneOptions: {},
      layerTree: [],
      resultTree: [],
      chartOption: {},
      stackComparisonId: '',
      disable: true,
      treeProps: {
        children: 'children',
        label: 'name'
      },
      slideWidth: {
        left: 300,
        right: 300
      },
      curPointData: null,
      downLoading: false,
      downloadVisible: false,
      isActive: false,
      curClickNode: null,
      chartLoading: false,
      downDrawingLoading: false,
      angle: 0,
      isRight: false,
      otherTree: [],
      meshData: []
    }
  },
  created() {
    const { shareCode } = this.$route.query
    this.shareCode = shareCode
    this.init()
  },
  computed: {
    ...mapState(['projectId'])
  },
  mounted() {
    // this.$refs.sceneComponentRef?.closeAside('right')
  },
  methods: {
    // 分享初始化
    async init() {
      const layerRes = await this.getReceiveShareDetail()
      const { postTerrainCollectionEndDate, postTerrainCollectionStartDate, preTerrainCollectionEndDate, preTerrainCollectionStartDate } = layerRes
      const dates = [postTerrainCollectionEndDate, postTerrainCollectionStartDate, preTerrainCollectionEndDate, preTerrainCollectionStartDate].sort()
      this.projectName = layerRes?.name || ''
      this.stackComparisonId = layerRes?.stackComparisonId
      // 采集日期
      const startCollectDate = moment(dates[0]).format('YYYY-MM-DD')
      const endCollectDate = moment(dates[dates.length - 1]).format('YYYY-MM-DD')
      this.gatherDate = `${startCollectDate} - ${endCollectDate}`
      // 收方模板
      const layerAllTree = layerRes?.catalogs || []
      const template = layerAllTree?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
      // 中心线
      const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
      // 区域
      const resultTree = layerAllTree?.filter((item) => item.type === EnumTypes.RESULT) || []
      const areaList = resultTree[0]?.children || []
      this.sceneOptions = {
        sceneViewToken: layerRes?.viewToken,
        sceneId: layerRes?.sceneId,
        roadLineList,
        areaList,
        isTemplate: false,
        tagNodeClick: this.tagNodeClick,
        sceneAddedCallback: this.sceneAddedCallback
      }
      this.layerTree = layerAllTree.filter((item) => item.type !== EnumTypes.RESULT && item.type !== EnumTypes.RECEIPT_TEMPLATE) || []
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
    // 分享数据
    getReceiveShareDetail() {
      return shareComparisonData(this.shareCode).then((res) => {
        return res
      })
    },
    // 折叠
    collapseChange(slide) {
      this.slideWidth = slide
    },
    // 场景加载回调
    sceneAddedCallback() {
      this.disable = false
      this.getMeshData()
      this.defaultSelect()
    },
    // 收方成果节点触发
    handleNodeClick(node) {
      this.isActive = true
      if (node.disabled) return
      if (node.type === EnumTypes.RESULT_STAKE) {
        // 清除gis断面
        this.clearSceneHandle()
        if (this.chartLoading) return
        if (this.curClickNode?.id === node.id) return
        this.curClickNode = node
        // 查询接口
        getShareCalculateResult(this.shareCode, node.id).then((res) => {
          // 断面数据
          this.curPointData = JSON.parse(res)
          console.log('断面数据', this.curPointData)
          if (!this.curPointData) {
            this.pointActive = false
            this.$refs.sceneComponentRef?.closeAside('right')
            return this.$message.warning('该断面计算失败！')
          }
          this.pointActive = true
          this.$refs.sceneComponentRef?.openAside('right')
          this.$nextTick(() => {
            this.drawHandle(node, this.resultTree, drawConfig, EnumTypes.RESULT_STAKE)
          })
        }).catch(() => {
          this.chartLoading = false
        })
      } else if (node.type === EnumTypes.RESULT_REGION) {
        this.clearResultScene()
        this.$refs.sceneComponentRef?.closeAside('right')
        // 区域
        const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_REGION)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          this.$refs.layerTreeRef.handleFocusNode({}, curNode)
        }
      }
    },
    // 清理断面场景
    clearResultScene() {
      this.pointActive = false
      this.$refs.sceneComponentRef?.closeAside('right')
      this.clearSceneHandle()
    },
    // 清理场景线
    clearSceneHandle() {
      const ids = drawConfig.map((item) => item.extConfig.id)
      window.bimInstance?.clearDesignLine(ids)
    },
    // 默认选中第一条
    defaultSelect() {
      // const firstNode = this.resultTree[0]?.children?.[0]?.children?.[0]
      const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_STAKE)
      if (nodes.length) {
        this.handleNodeClick(nodes[0])
        this.$refs.resultTreeRef?.setCurrentKey(nodes[0].key)
      }
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
            r.forEach((item, index) => {
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
    },
    // 下载台账
    async downloadShareLeger() {
      this.downLoading = true
      try {
        const data = (await downloadShareLeger(this.shareCode)) || ''
        if (data) {
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
      this.pollDownloadShareDrawing()
    },
    // 轮询查询图纸的data
    async pollDownloadShareDrawing() {
      try {
        const data = (await downloadShareDrawing(this.shareCode, 6)) || ''
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
    }
  }
}
</script>
<style lang="scss" scoped>
  .section-comparison-share {
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
        height: 49%;
        overflow-y: auto;
        background: #2e343e;
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 2%;
      }
      .bottom {
        height: 49%;
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
    .btn-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .menu {
      display: flex;
      align-items: center;
      .date {
        display: inline-block;
        position: absolute;
        top: 60px;
        left: 310px;
        z-index: 2;
        width: 248px;
        height: 24px;
        border-radius: 4px;
        text-align: center;
        color: $buttonDefaultColor;
        background: rgba(0, 0, 0, 0.7);
      }
      .top-btn {
        background-color: transparent;
      }
    }
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 46px;
      border-bottom: 1px solid $borderDefaultColor;
    }
  }
</style>
