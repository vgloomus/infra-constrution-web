<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-17 09:44:03
 * @description: 两期对比详情
-->
<template>
  <div
    class="two-phases-comparison-edit"
    v-loading="loading"
    :element-loading-text="$t('saving')"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
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
        <el-button
          @click="goBack"
          icon="el-icon-arrow-left"
          class="top-btn"
        >{{$t('return')}}</el-button>
        <div class="menu">
          <EditInput
            v-model="name"
            :originalName.sync="originalName"
            :disable="disable"
          />
          <span
            class="date"
            v-if="gatherDate"
          >{{$t('collectDate')}}：{{ gatherDate }}</span>
        </div>
        <div class="top-menu-btn">
          <el-button
            @click="startCalculate"
            type="primary"
            :disabled="disable || calculateState < enumComputeStatus.COMPUTED_FAIL"
            v-if="comparisonId"
            class="top-btn"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('measurement.calculateFailed')"
              v-if="calculateState=== enumComputeStatus.COMPUTED_FAIL"
              placement="top"
            >
              <i class="el-icon-warning"></i>
            </el-tooltip>
            {{calculateName}}
          </el-button>
          <el-button
            @click="shareHandle"
            v-if="comparisonId"
            :disabled="disable || calculateState !== enumComputeStatus.COMPUTED_SUCCESS"
            :loading="shareLoading"
            class="top-btn"
          >{{$t('share')}}</el-button>
          <el-button
            type="primary"
            @click="save"
            :disabled="disable || shareLoading"
          >{{$t('save')}}</el-button>
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
              :key="renderKey"
              :treeProps="treeProps"
              :treeData="resultTree"
              :isDelete="false"
              :isEdit="false"
              :isFocus="false"
              :draggable="false"
              :isShowRegion="true"
              :isRegionResult="true"
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
    <SharedDialog
      :tree="[...layerTree, ...resultTree, ...templateTree]"
      :taskId="comparisonId"
      :homeView="homeView"
      :name="name"
      :type="2"
      :visible.sync="shareVisible"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { EnumTypes, EnumComputeStatus } from '@/common/enum'
import drawConfig from './chartConfig/comparisonsConfig'
import { addTemporaryScenes, restoreTemporaryScenes, updateScenes } from '@/api/common'
import {
  getNewCompareTree,
  saveNewCompare,
  saveNewCompareThumbnail,
  getComparisonCalculateResult,
  setComparisonCalculate,
  getPeriodsComparisonStatus,
  getPeriodsComparisonLayerTree,
  getRangeLine
} from '@/api/business'
import {
  addRandomKeys,
  findNodeListsWithType,
  setCheckedByKeys,
  replaceIdsByNames,
  getAllKeys
} from '@/utils/index'
import EditInput from '@/components/EditInput.vue'
import SceneComponent from '@/components/scene/index.vue'
import NoContent from '@/components/NoContent.vue'
import CustomTree from '@/components/CustomTree.vue'
import AreaInfoCard from './components/AreaInfoCard.vue'
import SharedDialog from './components/SharedDialog.vue'

export default {
  name: 'TwoPhasesComparisonEdit',
  components: {
    SceneComponent,
    NoContent,
    CustomTree,
    AreaInfoCard,
    SharedDialog,
    EditInput
  },
  data() {
    return {
      name: '',
      originalName: '',
      gatherDate: '',
      sceneId: '',
      pointActive: false, // 是否激活桩号
      sceneOptions: {},
      layerTree: [],
      resultTree: [],
      templateTree: [],
      chartOption: {},
      lines: [],
      comparisonId: '',
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
      renderKey: 0,
      loading: false,
      shareVisible: false,
      shareLoading: false,
      version: 0,
      isActive: false,
      curClickNode: null,
      homeView: null,
      // 计算状态
      calculateState: 0, // 0：未保存 1:计算中 2:计算失败 3:计算成功
      stateTimer: null
    }
  },
  created() {
    this.init()
  },
  computed: {
    enumComputeStatus: () => EnumComputeStatus,
    ...mapState(['projectId']),
    calculateName() {
      return this.calculateState < this.enumComputeStatus.COMPUTED_FAIL ? '计算中...' : '重新计算'
    }
  },
  beforeDestroy() {
    this.clearScene()
    window.clearTimeout(this.stateTimer)
  },
  mounted() {
    this.$refs.sceneComponentRef?.closeAside('right')
  },
  methods: {
    // 初始化
    init() {
      const { name, gatherDate, id = '', sceneId = '' } = this.$route.query
      this.name = name
      this.sceneId = sceneId
      this.originalName = name
      this.gatherDate = gatherDate
      this.comparisonId = id
      this.initData()
      window.clearTimeout(this.stateTimer)
    },
    // 解决虚拟树checked状态问题
    handleTreeChecked() {
      const allKey = this.$refs.layerTreeRef?.getCheckedKeys()
      const allResultKey = this.$refs.resultTreeRef?.getCheckedKeys()
      this.layerTree = setCheckedByKeys(this.layerTree, allKey)
      this.resultTree = setCheckedByKeys(this.resultTree, allResultKey)
    },
    // 保存
    save() {
      if (!this.name) {
        this.$message.error('对比任务名称不能为空')
        return
      }
      if (this.name?.length > 50) {
        this.$message.error('断面对比任务名称不能超过50个字符')
        return
      }
      // 解决虚拟树问题
      this.handleTreeChecked()
      const cameraStatus = window.bimInstance?.getCameraStatus()
      // 兼容分享，处理数据
      const params = {
        id: this.comparisonId,
        version: this.version,
        name: this.name,
        homeView: cameraStatus,
        catalogs: [...this.layerTree, ...this.templateTree, ...this.resultTree]
      }
      this.loading = true
      saveNewCompare(this.projectId, params)
        .then((res) => {
          this.comparisonId = res.data.id
          this.version = res.data.version
          this.originalName = this.name
          this.$message.success('保存成功')
          if (this.$route.query.type === 'add') {
            this.refreshTree()
            this.$router.replace({
              path: '/business/sectionComparisonEdit',
              query: {
                ...this.$route.query,
                type: 'edit',
                name: this.name,
                id: this.comparisonId
              }
            })
            // 新建保存触发轮询
            this.getCalculateStatus(true)
          }
          this.uploadThumbnail()
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 上传缩略图
    async uploadThumbnail() {
      const file = await this.$refs.sceneComponentRef.createSnapshot()
      const formData = new FormData()
      formData.append('file', file)
      saveNewCompareThumbnail(this.projectId, this.comparisonId, formData)
    },
    // 折叠
    collapseChange(slide) {
      this.slideWidth = slide
    },
    // 新建虚拟场景
    addScene(resources) {
      const params = {
        projectId: this.projectId,
        type: 6,
        resources
      }
      return addTemporaryScenes(params).then((res) => {
        return res.data
      })
    },
    // 图层列表
    getNewLayerList() {
      const params = {
        id: this.comparisonId
      }
      return getNewCompareTree(this.projectId, params).then((res) => {
        return res
      })
    },
    // 获取编辑图层
    getEditLayerList() {
      return getPeriodsComparisonLayerTree(this.projectId, this.comparisonId).then((res) => {
        return res
      })
    },
    // 刷新左侧树
    refreshTree() {
      this.getEditLayerList().then((layerRes) => {
        const resultTree = layerRes.filter((item) => item.type === EnumTypes.RESULT) || []
        const layerTree = layerRes.filter((item) => (item.type !== EnumTypes.RECEIPT_TEMPLATE && item.type !== EnumTypes.RESULT)) || []
        const templateTree = layerRes.filter((item) => item.type === EnumTypes.RECEIPT_TEMPLATE) || []
        // 只替换id,parentId,resource字段不刷新树
        replaceIdsByNames(this.layerTree, 0, layerTree)
        replaceIdsByNames(this.templateTree, 0, templateTree)
        replaceIdsByNames(this.resultTree, 0, resultTree)
      })
    },
    // 编辑收方初始化
    async initData() {
      // Promise.all([this.getEditLayerList(), this.getDetail(), this.getCalculateStatus(false)]).then(async ([layerRes, detailRes]) => {
      Promise.all([this.getEditLayerList(), this.getRangeLine(), this.getCalculateStatus(false)]).then(async ([layerRes, lineRes]) => {
        const layerTree = []
        const resultTree = []
        // 设计图层
        const design = layerRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)
        // 地形图层
        const terrain = layerRes?.find((item) => item.type === EnumTypes.BASE_MAP_LAYER)
        // 区域计算结果
        const result = layerRes?.find((item) => item.type === EnumTypes.REGION_LAYER)
        // 图纸
        if (design) {
          layerTree.push(design)
        }
        if (terrain) {
          terrain.name = '底图图层'
          layerTree.push(terrain)
        }
        if (result) {
          result.name = '地形对比结果'
          result?.children?.forEach(item => {
            item.parentArea = true
          })
          const regionIds = result?.children?.map((item) => item.id)
          const lines = lineRes || []
          // 用区域过滤范围线
          this.lines = lines.filter((item) => regionIds.includes(item.regionId))
          resultTree.push(result)
        }
        this.layerTree = addRandomKeys(layerTree, 'root', 'repeated')
        this.resultTree = addRandomKeys(resultTree)
        this.$nextTick(() => {
          const allKey = getAllKeys(this.layerTree, 'key')
          const allResultKey = getAllKeys(this.resultTree, 'key')
          this.$nextTick(() => {
            this.$refs.layerTreeRef?.setCheckedKeys(allKey)
            this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
          })
        })
        // 图纸
        const drawings = layerRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)?.children || []
        const resources = drawings.map((item) => {
          return {
            id: item.resource.layerId,
            name: item.name,
            modelId: item.resource.modelId,
            typeName: 'DrawingLayer',
            modelType: 'singleModel',
            isVisible: item.checked,
            layerConfig: {
              isGround: true
            }
          }
        })
        const params = {
          sceneId: this.sceneId,
          periodsComparisonId: this.comparisonId,
          resources
        }
        // 更新场景
        const newScenes = await updateScenes(this.projectId, params)
        this.sceneOptions = {
          sceneViewToken: newScenes.data,
          sceneId: this.sceneId,
          isTemplate: false,
          sceneAddedCallback: this.sceneAddedCallback
        }
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.nameInput) {
              this.$refs.nameInput.focus() // 确保输入框聚焦
            }
          }, 1000)
        })
      })
    },
    // 场景加载回调
    sceneAddedCallback() {
      this.disable = false
      // 查询收方成果
      setTimeout(() => {
        this.defaultSelect()
      }, 1000)
      const regionDrawData = this.mappingData(this.lines)
      console.log(regionDrawData, 'regionDrawData')
      window.bimInstance?.drawBoundaryPlanes(regionDrawData)
      const position = {
        lon: this.lines[0]?.gisCenter[0],
        lat: this.lines[0]?.gisCenter[1],
        alt: this.lines[0]?.gisCenter[2] + 1000
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
    },
    // 映射数据
    mappingData(data) {
      const result = []
      data.forEach((item) => {
        const { gisBoundary, gisCenter, regionId, regionTypeId, regionName } = item
        const obj = {
          name: regionName,
          id: regionId,
          type: regionTypeId,
          gisCenter: gisCenter,
          points: gisBoundary
        }
        result.push(obj)
      })
      return result
    },
    // 默认选中第一条
    defaultSelect() {
      if (this.calculateState < this.enumComputeStatus.COMPUTED_FAIL) return
      // const firstNode = this.resultTree[0]?.children?.[0]?.children?.[0]
      const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_STAKE)
      if (nodes[0]) {
        this.handleNodeClick(nodes[0])
        this.$refs.resultTreeRef?.setCurrentKey(nodes[0].key)
      }
    },
    // 查询范围线
    getRangeLine() {
      return getRangeLine(this.projectId).then((res) => {
        return res
      })
    },
    // 收方成果节点触发
    handleNodeClick(node) {
      this.isActive = true
      if (node.disabled) return
      if (node.type === EnumTypes.RESULT_STAKE) {
        // 清除gis断面
        this.clearSceneHandle()
        if (this.curClickNode?.id === node.id) return
        // if (this.calculateState === 3) return this.$message.warning('有部分任务计算失败！')
        if (this.calculateState === this.enumComputeStatus.COMPUTE_NOT_START) return this.$message.warning('请先保存，发起计算！')
        if (this.calculateState === this.enumComputeStatus.COMPUTING) return this.$message.warning('计算中，请稍后！')
        this.curClickNode = node
        // 查询接口
        const params = {
          stakeName: node.name
        }
        getComparisonCalculateResult(this.projectId, this.comparisonId, node.id, params).then((res) => {
          // 断面数据
          this.curPointData = res.data
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
        })
      } else if (node.type === EnumTypes.RESULT_REGION) {
        this.clearResultScene()
        // 区域
        const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_REGION)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          this.$refs.layerTreeRef.handleFocusNode({}, curNode)
        }
      }
    },
    // 重新计算
    startCalculate() {
      if (this.calculateState === this.enumComputeStatus.COMPUTED_FAIL) {
        this.$confirm('如果发起重新计算，计算结果将被重置，您确定要重新计算吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.startCalculateHandle()
        })
        return false
      }
      this.startCalculateHandle()
    },
    // 发起计算
    startCalculateHandle() {
      setComparisonCalculate(this.projectId, this.comparisonId).then((res) => {
        // 计算中
        this.$message.success('计算已发起')
        this.calculateState = this.enumComputeStatus.COMPUTING
        this.getCalculateStatus(true)
      })
    },
    // 查询计算结果
    getCalculateStatus(flag = false) {
      if (!this.comparisonId) return Promise.resolve()
      // 查询计算状态
      return getPeriodsComparisonStatus(this.projectId, this.comparisonId).then((res) => {
        if (res.data >= this.enumComputeStatus.COMPUTED_FAIL) {
          this.calculateState = res.data
          window.clearTimeout(this.stateTimer)
          this.stateTimer = null
          if (flag) {
            this.$message.success('计算完成')
            this.defaultSelect()
          }
        } else {
          this.calculateState = this.enumComputeStatus.COMPUTING
          this.stateTimer = setTimeout(() => {
            this.getCalculateStatus(true)
          }, 15000)
        }
      })
    },
    // 清理场景
    clearScene() {
      if (!this.sceneId) return
      const params = {
        sceneId: this.sceneId,
        bizId: this.comparisonId,
        type: 8
      }
      restoreTemporaryScenes(this.projectId, params)
    },
    // 分享
    shareHandle() {
      this.handleTreeChecked()
      this.homeView = window.bimInstance?.getCameraStatus()
      this.shareVisible = true
    },
    // 清理断面场景
    clearResultScene() {
      this.pointActive = false
      this.clearSceneHandle()
      this.$refs.sceneComponentRef?.closeAside('right')
    },
    // 清理场景线
    clearSceneHandle() {
      const ids = drawConfig.map((item) => item.extConfig.id)
      window.bimInstance?.clearDesignLine(ids)
    },
    // 返回列表页
    goBack() {
      this.$router.push({
        path: '/business/twoPhasesComparison'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .two-phases-comparison-edit {
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
    .el-icon-warning {
      color: #ff9900;
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
    }
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 46px;
      border-bottom: 1px solid $borderDefaultColor;
    }
    .top-btn {
      border: none;
    }
  }
</style>
