<!--
 * @author: lvzj
 * @Date: 2024-11-21 13:37:46
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-13 15:07:19
 * @description: 区域管理
-->
<template>
  <div
    class="regional-management"
    v-loading="loading"
    :element-loading-text="$t('saving')"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <SceneComponent
      :showFooter="false"
      :showRightMenu="true"
      :showLeftMenu="true"
      :showHeader="false"
      :options="sceneOptions"
      ref="sceneComponentRef"
      @collapseChange="collapseChange"
      @update-toolbar-position="updateToolbarPosition"
    >
      <template slot="title">
        <el-button
          :disabled="disable"
          type="text"
          @click="handleAdd"
        >
          <i class="icon-add"></i>
        </el-button>
      </template>
      <template slot="left">
        <div
          v-loading="disable"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          class="left-content"
        >
          <CustomTree
            v-if="tree.length > 0"
            ref="treeRef"
            :isFocus="true"
            :isFocusRegion="true"
            :nodeClick="handleNodeClick"
            :treeData="tree"
            :isShowRegion="true"
            :treeProps="treeProps"
            @focusRegion="handleFocusRegion"
            @handleCheckCallBack="handleCheckCallBack"
          />
          <no-content
            v-loading="disable"
            element-loading-background="rgba(0, 0, 0, 0.8)"
            v-else
            :text="$t('noData')"
          />
        </div>
      </template>
      <template slot="right">
        <div class="right-content">
          <RegionAreaSubInfoCard
            v-if="pointActive && info && info.subItemName"
            :info="info"
            :rangeLineData="rangeLineData"
            @focus="handleFocusArea"
          />
          <RegionAreaInfoCard
            v-else-if="pointActive && info"
            :info="info"
            :rangeLineData="rangeLineData"
            @saveSuccess="saveLineSuccess"
            @focus="handleFocusArea"
          />
          <no-content
            v-else
            :text="$t('measurement.clickSectionComparisonData')"
          />
        </div>
      </template>
    </SceneComponent>
    <Legends
      class="legends"
      :style="{ right: toolbarRightPosition + 50 + 'px' }"
    ></Legends>
    <AddRegionalDialog
      :visible.sync="addVisible"
      @saveSuccess="saveSuccess"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { EnumTypes } from '@/common/enum'
import {
  getRegionsData,
  getRegionsScene,
  getDrawingList,
  getRegionInfo
} from '@/api/projectSetting'
import { getRangeLine } from '@/api/business'
import {
  addRandomKeys,
  getAllKeys
} from '@/utils/index'
import SceneComponent from '@/components/scene/index.vue'
import NoContent from '@/components/NoContent.vue'
import CustomTree from '@/components/CustomTree.vue'
import AddRegionalDialog from './components/AddRegionalDialog.vue'
import RegionAreaInfoCard from './components/RegionAreaInfoCard.vue'
import RegionAreaSubInfoCard from './components/RegionAreaSubInfoCard.vue'
import Legends from '@/views/projectSetting/components/Legends.vue'

export default {
  name: 'MeasurementReceiverEdit',
  components: {
    SceneComponent,
    NoContent,
    CustomTree,
    AddRegionalDialog,
    RegionAreaInfoCard,
    RegionAreaSubInfoCard,
    Legends
  },
  data() {
    return {
      sceneId: '',
      pointActive: false,
      sceneOptions: {},
      tree: [],
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
      focusNode: null,
      loading: false,
      isTemporaryScenes: true,
      isActive: false,
      curClickNode: null,
      addVisible: false,
      info: {},
      currentNode: null,
      rangeLineData: [],
      drawLine: [],
      toolbarRightPosition: 342
    }
  },
  created() {
    this.init()
  },
  computed: {
    ...mapState(['projectId'])
  },
  beforeDestroy() {
    window.clearTimeout(this.stateTimer)
  },
  mounted() {
    this.$refs.sceneComponentRef?.closeAside('right')
  },
  methods: {
    // 初始化
    async init() {
      Promise.all([this.getScene(), this.initRegionalTree()]).then(([sceneRes, receiptRes]) => {
        this.sceneId = sceneRes.sceneId
        const drawing = receiptRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)
        const region = receiptRes?.find((item) => item.type === EnumTypes.REGION_LAYER)
        this.sceneOptions = {
          sceneViewToken: sceneRes.viewToken,
          sceneAddedCallback: this.sceneAddedCallback
        }
        if (region) {
          this.tree.push(region)
        }
        if (drawing) {
          this.tree.push(drawing)
        }
        this.tree = addRandomKeys(this.tree)
        const allKey = getAllKeys(this.tree, 'key')
        this.$nextTick(() => {
          this.$refs.treeRef?.setCheckedKeys(allKey)
        })
      })
    },
    saveSuccess() {
      this.disable = true
      this.tree = []
      this.sceneOptions = {}
      this.info = {}
      this.$refs.sceneComponentRef?.clear()
      this.init()
    },
    // 新增区域线
    saveLineSuccess(fileName) {
      this.getRangeLine().then((res) => {
        const data = this.mappingData(res || [])
        const newData = data.filter(item => item.fileName === fileName)
        window.bimInstance?.drawBoundaryPlanes(newData)
        // 找到当前上传的文件
        const currentFile = res.find(boundary => boundary.fileName === fileName)
        if (!currentFile?.gisCenter) return

        const position = {
          lon: currentFile.gisCenter[0],
          lat: currentFile.gisCenter[1],
          alt: currentFile.gisCenter[2] + 200
        }
        const cameraStatus = {
          position: position,
          orientation: {
            pitch: -Math.PI / 2,
            yaw: 0,
            roll: 0
          }
        }
        window.bimInstance?.setCameraStatus(cameraStatus)
      })
    },
    // 获取区域树
    initRegionalTree() {
      return getRegionsData(this.projectId).then((res) => {
        return res
      })
    },
    // 获取场景
    getScene() {
      return getRegionsScene(this.projectId).then((res) => {
        return res
      })
    },
    // 获取图纸设计图层
    getDrawings() {
      return getDrawingList(this.projectId).then((res) => {
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
      setTimeout(() => {
        window.bimInstance?.focusToLayer('extLayerId')
      }, 2000)
      this.drawRangeScope()
    },
    // 节点触发
    handleNodeClick(node) {
      if (node.type !== EnumTypes.AREA) return
      this.isActive = true
      this.pointActive = true
      this.$refs.sceneComponentRef?.openAside('right')
      this.currentNode = node
      if (node.type) {
        this.getRegionParams(this.projectId, node.id)
      }
      this.handleFocusRegion(node)
      // this.getRangeLine().then(res => {
      //   this.rangeLineData = res
      //   // 删除单个范围线重新上传后要重新绘制，首先需要拿到最新的范围线数据，避免点击节点不出现背景色
      //   const nodes = this.tree[0]?.children || []
      //   const list = nodes.filter(item => {
      //     return item.id === node.id && item.checked
      //   })
      //   const mapData = this.mappingData(list)
      //   window.bimInstance?.drawBoundaryPlanes(mapData, node.id)
      // }).catch(error => {
      //   console.error('获取范围线失败', error)
      // })
    },
    // 添加区域
    handleAdd() {
      this.addVisible = true
    },
    // 获取区域参数
    getRegionParams(projectId, regionId) {
      getRegionInfo(projectId, regionId).then((res) => {
        this.info = res
      })
    },
    // 聚焦区域
    handleFocusArea() {
      const node = this.currentNode
      const mid = Math.floor(node.children.length / 2)
      const middle = node.children[mid]

      if (!middle?.resource?.gisCoordinate) return
      const cameraStatus = this.computedCameraStatus(middle)

      window.bimInstance?.focusStalePoint(node.children)
      window.bimInstance?.setCameraStatus(cameraStatus)
    },
    computedCameraStatus(node, height = 1000) {
      const gisCoordinate = JSON.parse(node.resource.gisCoordinate)
      const position = { lon: gisCoordinate[0], lat: gisCoordinate[1], alt: gisCoordinate[2] + height }
      const cameraStatus = {
        orientation: {
          pitch: -Math.PI / 2,
          yaw: 0,
          roll: 0
        },
        position: position
      }
      return cameraStatus
    },
    // 查询范围线
    getRangeLine() {
      return getRangeLine(this.projectId).then(res => {
        this.rangeLineData = res
        return res
      }).catch(error => {
        this.$message.error('查询失败')
        throw error
      })
    },
    // 绘制范围面
    drawRangeScope() {
      this.getRangeLine().then(res => {
        this.drawLine = this.mappingData(res || [])
        if (!this.drawLine.length) return
        window.bimInstance?.drawBoundaryPlanes(this.drawLine)
        const position = {
          lon: res[0]?.gisCenter[0],
          lat: res[0]?.gisCenter[1],
          alt: res[0]?.gisCenter[2] + 10
        }
        const cameraStatus = {
          position: position,
          orientation: {
            pitch: -Math.PI / 2,
            yaw: 0,
            roll: 0
          }
        }
        window.bimInstance?.setCameraStatus(cameraStatus)
      }).catch(error => {
        console.error('获取范围线失败', error)
      })
    },
    // 映射数据
    mappingData(data) {
      const result = []
      data.forEach(item => {
        const { gisBoundary, gisCenter, regionId, regionTypeId, regionName, fileName } = item
        const obj = {
          name: regionName,
          id: regionId,
          type: regionTypeId,
          gisCenter: gisCenter,
          fileName,
          points: gisBoundary
        }
        result.push(obj)
      })
      return result
    },
    updateToolbarPosition(position) {
      this.toolbarRightPosition = position
    },
    handleFocusRegion(node) {
      const cur = this.rangeLineData.find(item => item.regionId === node.id)
      if (!cur) return
      const gisCenter = cur?.gisCenter
      const position = {
        lon: gisCenter[0],
        lat: gisCenter[1],
        alt: gisCenter[2] + 1200
      }
      const cameraStatus = {
        position: position,
        orientation: {
          pitch: -Math.PI / 2,
          yaw: 0,
          roll: 0
        }
      }
      window.bimInstance?.setCameraStatus(cameraStatus)
      if (this.focusNode) {
        window.bimInstance?.focusLabelById(`boundary_mesh_${this.focusNode.id}`)
      }
      window.bimInstance?.focusLabelById(`boundary_mesh_${node.id}`, true)
      this.focusNode = node
    },
    handleCheckCallBack(node) {
      if (+node.parentId === 0) {
        const cur = this.rangeLineData.find(item => item.regionId === node.id)
        if (!cur) return
        const name = `boundary_mesh_${cur.regionId}`
        const checked = node.checked
        if (checked) {
          window.bimInstance?.showExtByName([name])
        } else {
          window.bimInstance?.hideExtByName([name])
        }
      }
    }
  }

}
</script>
<style lang="scss" scoped>
  .regional-management {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
    .legends {
      position: absolute;
      bottom: 11px;
    }
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
  }
</style>
