<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-03 16:24:56
 * @description: 测量收方编辑
-->
<template>
  <div
    class="measurement-receiver-edit"
    v-loading="loading"
    :element-loading-text="$t('loading')"
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
          class="top-btn"
          icon="el-icon-arrow-left"
        >{{ $t('return')}}</el-button>
        <div class="menu">
          <EditInput
            :disable="disable"
            :originalName.sync="originalName"
            v-model="name"
          />
          <span
            class="date"
            v-if="startCollectDate"
          > {{ $t('collectDate') }}：{{ startCollectDate }} - {{ endCollectDate }}</span>
        </div>
        <div class="top-menu-btn">
          <!-- <el-button
            @click="downLine"
            :disabled="disable"
            v-show="isAllowDown"
            class="top-btn"
          >画线</el-button> -->
          <el-button
            @click="openDownloadDialog"
            :disabled="disable"
            v-show="isAllowDown"
            class="top-btn"
          >{{ $t('download') }}</el-button>
          <el-button
            @click="shareHandle"
            v-if="taskId"
            :disabled="disable"
            :loading="shareLoading"
            class="top-btn"
          >{{ $t('share') }}</el-button>
          <el-button
            type="primary"
            @click="save"
            :disabled="disable || shareLoading || computeLoading"
          >{{ $t('save') }}</el-button>
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
              :computedGisCoordinate="computedGisCoordinate"
              @handleCheckCallBack="handleCheckCallBack"
              @focusRockSoilBoundary="focusRockSoilBoundary"
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
              @onQueryResult="onQueryResult"
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
          <div v-show="!pointActive">
            <StepsCard :step="step" />
            <el-alert
              v-if="step === 0 && !error"
              :title="$t('measurement.participateCalculation')"
              type="warning"
              show-icon
            ></el-alert>
            <el-alert
              v-if="error"
              :title="$t('measurement.matchFailed')"
              type="error"
            ></el-alert>
            <ModelCard
              v-show="(step < 2 && !error) || matchModels.length > 0"
              v-for="(item, index) in matchModels"
              :key="index"
              :name="item.name"
              :list="item.pointList"
              :active="activeModelName"
              @onActive="onModelActive"
            />
            <div class="btn-group">
              <el-button
                @click="matchTerrain"
                v-if="step !== 1"
                :type="step === 2 ? 'default' : 'primary'"
                :loading="matchLoading"
                :disabled="disable || computeLoading"
                class="match-btn"
              >{{ matchName }}</el-button>
              <el-button
                v-if="step > 0"
                @click="computedResult(computeName === $t('measurement.reCompute'))"
                type="primary"
                :loading="computeLoading"
                :disabled="disable"
                class="match-btn"
              >{{ computeName }}</el-button>
            </div>
          </div>
          <AreaInfoCard
            :info="curPointData"
            v-if="pointActive"
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
      :settings="settings"
      :isShowConfig="false"
      :loading="chartLoading"
      :list="legendArr"
      @onReduceConfig="onReduceConfig"
      @onSaveConfig="onSaveConfig"
    />
    <SharedDialog
      :tree="[...layerTree, ...resultTree]"
      :taskId="taskId"
      :homeView="homeView"
      :name="name"
      :type="1"
      :visible.sync="shareVisible"
    />
    <DownLoadDialog
      :taskId="taskId"
      :visible.sync="downloadVisible"
      @resultDownload="resultDownload"
      :downLoading="downLoading"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import moment from 'moment'
import { EnumTypes } from '@/common/enum'
import { cloneDeep } from 'lodash'
import meshMixins from '@/mixins/meshMixins'
import drawMixins from '@/mixins/drawMixins'
import goBackMixins from '@/mixins/goBackMixins'
import drawConfig from './chartConfig/taskConfig'
import { addTemporaryScenes, restoreTemporaryScenes, updateScenes } from '@/api/common'
import {
  getReceiveLayerList,
  getReceiveDetail,
  getModelList,
  getTerrainBoundary,
  getStakeSection,
  saveReceive,
  uploadReceive,
  getCalculateStatus,
  startCalculate,
  getCalculateResult,
  getStakeByArea,
  getReceiveResultExcel,
  simplifyReceive,
  getTaskSetting,
  saveTaskSetting,
  getAllMeshData
} from '@/api/business'
import {
  addRandomKeys,
  getAllKeys,
  findNodeListsWithType,
  addRandomKeysAndProps,
  findKeysByVal,
  collectNonLeafKeys,
  setCheckedByKeys,
  replaceIdsByNames,
  translateCoordinates,
  loadOBJFile,
  isPointInPolygonHandle,
  sortTreeByTypeAndName,
  flatMultiLayerArea
} from '@/utils/index'
import EditInput from '@/components/EditInput.vue'
import SceneComponent from '@/components/scene/index.vue'
import NoContent from '@/components/NoContent.vue'
import StepsCard from './components/StepsCard.vue'
import ModelCard from './components/ModelCard.vue'
import CustomTree from '@/components/CustomTree.vue'
import ChartCollapse from './components/ChartCollapse.vue'
import AreaInfoCard from './components/AreaInfoCard.vue'
import SharedDialog from './components/SharedDialog.vue'
import DownLoadDialog from './components/DownLoadDialog.vue'

export default {
  name: 'MeasurementReceiverEdit',
  components: {
    SceneComponent,
    NoContent,
    StepsCard,
    ModelCard,
    CustomTree,
    ChartCollapse,
    AreaInfoCard,
    SharedDialog,
    DownLoadDialog,
    EditInput
  },
  mixins: [meshMixins, drawMixins, goBackMixins],
  data() {
    return {
      name: '',
      originalName: '',
      sceneId: '',
      step: 0, // 0:地形匹配 1:计算 2:计算完成
      error: false, // 是否匹配失败
      pointActive: false, // 是否激活桩号
      sceneOptions: {},
      resultLoading: true,
      pointList: [],
      layerTree: [],
      resultTree: [],
      chartOption: {},
      taskId: '',
      disable: true,
      statusEnum: {
        1: '待处理',
        2: '计算中',
        3: '计算成功',
        4: '计算失败'
      },
      treeProps: {
        children: 'children',
        label: 'name'
      },
      slideWidth: {
        left: 300,
        right: 300
      },
      stateTimer: null,
      startCollectDate: '',
      endCollectDate: '',
      computeLoading: false,
      matchLoading: false,
      models: [], // 地形模型 不重复
      matchModels: [], // 匹配模型
      pointSectionList: [], // 桩号截面
      curPointData: null,
      renderKey: 0,
      resultTreeLoading: false,
      activeModelName: '',
      loading: false,
      downLoading: false,
      shareVisible: false,
      shareLoading: false,
      downloadVisible: false,
      version: 0,
      isTemporaryScenes: true,
      isActive: false,
      settings: null, // 断面设置
      curClickNode: null,
      chartLoading: false,
      homeView: null,
      angle: 0,
      isRight: false,
      meshData: []
    }
  },
  created() {
    this.init()
    // this?.$microAppRouter?.beforeLeave(this.pageBeforeLeave)
  },
  computed: {
    ...mapState(['projectId']),
    computeName() {
      if (this.computeLoading) {
        return '计算中...'
      } else {
        return this.step === 1 ? '开始计算' : '重新计算'
      }
    },
    matchName() {
      if (this.matchLoading) {
        return '匹配中...'
      } else {
        return this.step === 0 && !this.error ? '开始匹配' : '重新匹配'
      }
    },
    isAllowDown() {
      // return this.resultTree.length > 0 && this.resultTree[0]?.children?.some((item) => item.status === 3 || item.children?.length > 0)
      // 拍平区域
      if (this.resultTree?.length > 0 && this.resultTree[0].children.length > 0) {
        const list = flatMultiLayerArea(this.resultTree[0].children, [EnumTypes.RESULT_REGION])
        return list.some((item) => item.status === 3 || item.children?.length > 0)
      } else {
        return false
      }
    }
  },
  beforeDestroy() {
    this.clearScene()
    window.clearTimeout(this.stateTimer)
  },
  methods: {
    // 初始化
    init() {
      const { type, id = '', name = '' } = this.$route.query
      this.taskId = id
      this.name = name
      this.originalName = name
      if (type === 'add') {
        this.newInit()
      } else if (type === 'edit') {
        this.editInit()
      }
      this.isTemporaryScenes = !id
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
    save(flag = true) {
      if (!this.name) {
        this.$message.error('任务名称不能为空')
        return Promise.reject(this.name)
      }
      this.handleTreeChecked()
      const cameraStatus = window.bimInstance?.getCameraStatus()
      // 兼容分享，处理数据
      const params = {
        id: this.taskId,
        version: this.version,
        name: this.name,
        homeView: cameraStatus,
        collectStartDate: moment(this.startCollectDate).valueOf(),
        collectEndDate: moment(this.endCollectDate + ' 23:59:59').valueOf(),
        catalogs: [...this.layerTree, ...this.resultTree]
      }
      if (flag) {
        this.loading = true
      }
      return saveReceive(this.projectId, params)
        .then((res) => {
          if (!this.taskId) {
            // 新建保存刷新左侧树
            this.refreshTree(res.data.id)
          }
          this.taskId = res.data.id
          this.version = res.data.version
          if (flag) {
            this.$message.success('保存成功')
          }
          if (this.$route.query.type === 'add') {
            this.$router.replace({
              path: '/business/measurementReceiverEdit',
              query: {
                ...this.$route.query,
                type: 'edit',
                id: this.taskId
              }
            })
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
      uploadReceive(this.projectId, this.taskId, formData)
    },
    // 折叠
    collapseChange(slide) {
      this.slideWidth = slide
    },
    // 新建虚拟场景
    addScene(resources) {
      const params = {
        projectId: this.projectId,
        type: 2,
        resources
      }
      return addTemporaryScenes(params).then((res) => {
        return res.data
      })
    },
    // 获取地形边缘线
    getTerrainEdge(models) {
      const terrainModels = models.filter((item) => {
        return item?.resource?.repeated === false && item.type === EnumTypes.TERRAIN_MODEL && item?.resource?.terrainId
      })
      const params = terrainModels.map((item) => {
        return {
          imageId: item.resource.imageId,
          terrainId: item.resource.terrainId
        }
      })
      this.models = terrainModels.map((item) => {
        return {
          imageId: item.resource.imageId,
          terrainId: item.resource.terrainId,
          name: item.name,
          type: item.type,
          layerId: item.resource.layerId,
          localBoundary: [],
          pointList: []
        }
      })
      getTerrainBoundary(this.projectId, params).then((res) => {
        const boundaryList = res.data || []
        // 将数据映射到models
        this.models.forEach((model) => {
          const boundary = boundaryList.find((item) => item.terrainId === model.terrainId)
          if (boundary) {
            model.localBoundary = boundary.localBoundary || []
          }
        })
      })
    },
    // 获取所有桩点界面
    getAllStake() {
      const params = this.taskId ? { taskId: this.taskId } : {}
      getStakeSection(this.projectId, params).then((res) => {
        this.pointSectionList = res || []
      })
    },
    // 图层列表
    getLayerList(id = '') {
      const params = id || this.taskId ? { taskId: id || this.taskId } : {}
      return getReceiveLayerList(this.projectId, params).then((res) => {
        return res
      })
    },
    // 模型
    getModelList() {
      const { start, end } = this.$route.query
      const params = {
        startDate: moment(start).valueOf(),
        endDate: moment(end + ' 23:59:59').valueOf()
      }
      return getModelList(this.projectId, params).then((res) => {
        return res.data
      })
    },
    // 映射models数据
    mappingModelsData(models) {
      return models.map((item) => {
        return {
          id: item.resource.layerId,
          name: item.name,
          modelId: item.resource.modelId,
          typeName: 'TilesetLayer',
          modelType: 'singleModel',
          isVisible: item.checked
        }
      })
    },
    // 映射图纸数据
    mappingDrawingsData(drawings) {
      return drawings.map((item) => {
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
    },
    // 新建收方初始化
    async newInit() {
      Promise.all([this.getLayerList(), this.getModelList()]).then(async ([layerRes, modelRes]) => {
        this.layerTree.push(...layerRes, modelRes?.catalog)
        this.layerTree = addRandomKeys(this.layerTree, 'root', 'repeated')
        this.$nextTick(() => {
          const allKey = findKeysByVal(this.layerTree, 'checked', true)
          this.$nextTick(() => {
            this.$refs.layerTreeRef?.setCheckedKeys(allKey)
          })
        })
        // 图纸
        const drawings = layerRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)?.children || []
        const resources = []
        const drawingsResources = this.mappingDrawingsData(drawings)
        // 采集日期
        this.startCollectDate = moment(modelRes.startCollectDate).format('YYYY-MM-DD')
        this.endCollectDate = moment(modelRes.endCollectDate).format('YYYY-MM-DD')
        // 模型
        const models = modelRes?.catalog?.children || []
        const noRepeatModels = models.filter((item) => !item?.resource?.repeated)
        const modelResources = this.mappingModelsData(noRepeatModels)
        resources.push(...drawingsResources, ...modelResources)
        // 收方模板
        const template = layerRes?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
        // 中心线
        const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
        // 区域
        const areaList = template?.children?.filter((item) => item.type === EnumTypes.AREA) || []
        // 新建虚拟场景
        const sceneRes = await this.addScene(resources)
        this.sceneId = sceneRes.sceneId
        this.sceneOptions = {
          sceneViewToken: sceneRes.viewToken,
          roadLineList,
          areaList,
          isTemplate: false,
          tagNodeClick: this.tagNodeClick,
          sceneAddedCallback: this.sceneAddedCallback
        }
        // 获取地形边界线
        this.getTerrainEdge(models)
      })
      // 获取所有桩点截面
      this.getAllStake()
    },
    // 编辑收方初始化
    async editInit() {
      Promise.all([this.getLayerList(), this.getDetail()]).then(async ([layerRes, detailRes]) => {
        this.sceneId = detailRes.sceneId
        this.version = detailRes.version
        this.name = detailRes.name
        this.originalName = detailRes.name
        // 收方模板
        const template = layerRes?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
        // 中心线
        const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
        // 区域
        const areaList = template?.children?.filter((item) => item.type === EnumTypes.AREA) || []
        // 图纸
        const drawings = layerRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)?.children || []
        const resources = []
        const drawingsResources = this.mappingDrawingsData(drawings)
        // 获取地形边界线
        const models = layerRes.find((item) => item.type === EnumTypes.BASE_MAP_LAYER)?.children || []
        const noRepeatModels = models.filter((item) => !item?.resource?.repeated)
        const modelResources = this.mappingModelsData(noRepeatModels)
        resources.push(...drawingsResources, ...modelResources)
        const params = {
          sceneId: detailRes.sceneId,
          taskId: this.taskId,
          resources
        }
        // 更新场景
        const newScenes = await updateScenes(this.projectId, params)
        this.sceneOptions = {
          sceneViewToken: newScenes.data,
          sceneId: detailRes.sceneId,
          roadLineList,
          areaList,
          isTemplate: false,
          tagNodeClick: this.tagNodeClick,
          sceneAddedCallback: this.sceneAddedCallback
        }
        // 采集日期
        this.startCollectDate = moment(detailRes.collectStartDate).format('YYYY-MM-DD')
        this.endCollectDate = moment(detailRes.collectEndDate).format('YYYY-MM-DD')
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.$refs.nameInput) {
              this.$refs.nameInput.focus() // 确保输入框聚焦
            }
          }, 1000)
        })
        this.taskId = detailRes.id
        // 图层
        const resultTree = layerRes.filter((item) => item.type === EnumTypes.RESULT) || []
        const otherTree = layerRes.filter((item) => item.type !== EnumTypes.RESULT) || []
        const layerTree = []
        layerTree.push(...otherTree)
        sortTreeByTypeAndName(layerTree, EnumTypes.SECTION_DATA)
        this.layerTree = addRandomKeys(layerTree, 'root', 'repeated')
        // 收房成果
        if (resultTree?.[0]?.children?.length) {
          this.resultTree = addRandomKeys(resultTree)
          this.defaultExpandedKeys = collectNonLeafKeys(resultTree)
          // 有收方成果直接第三步
          this.step = 2
          // 如果状态还有未完成的轮询成果状态
          this.getStatus()
        }
        this.getTerrainEdge(models)
        this.$nextTick(() => {
          const allKey = findKeysByVal(this.layerTree, 'checked', true)
          const allResultKey = findKeysByVal(this.resultTree, 'checked', true)
          this.$nextTick(() => {
            this.$refs.layerTreeRef?.setCheckedKeys(allKey)
            this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
          })
        })
      })
      // 获取所有桩点截面
      this.getAllStake()
    },
    // 刷新左侧树
    refreshTree(id) {
      this.getLayerList(id).then((layerRes) => {
        const resultTree = layerRes.filter((item) => item.type === EnumTypes.RESULT) || []
        const otherTree = layerRes.filter((item) => item.type !== EnumTypes.RESULT) || []
        // 只替换id,parentId,resource字段不刷新树
        replaceIdsByNames(this.layerTree, 0, otherTree)
        replaceIdsByNames(this.resultTree, 0, resultTree)
        // console.log('layerTree', this.layerTree)
        // this.layerTree = addRandomKeys(otherTree, 'root', 'repeated')
        // if (resultTree?.[0]?.children?.length) {
        //   this.resultTree = addRandomKeys(resultTree)
        // }
        // this.$nextTick(() => {
        //   const allKey = findKeysByVal(this.layerTree, 'checked', true)
        //   const allResultKey = findKeysByVal(this.resultTree, 'checked', true)
        //   setTimeout(() => {
        //     this.$refs.layerTreeRef?.setCheckedKeys(allKey)
        //     this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
        //   }, 300)
        // })
      })
    },
    // 计算后获取树
    getCalculateTree() {
      this.resultTreeLoading = true
      return this.getLayerList()
        .then((res) => {
          const resultTree = res.filter((item) => item.type === EnumTypes.RESULT) || []
          // 收房成果
          this.resultTree = addRandomKeysAndProps(resultTree, '', EnumTypes.RESULT_REGION, true)
          console.log('resultTree', this.resultTree)
          this.defaultExpandedKeys = [this.resultTree[0].children ? this.resultTree[0].children[0].key : this.resultTree[0].key]
          // this.defaultExpandedKeys = collectNonLeafKeys(this.resultTree)
          this.$nextTick(() => {
            const allResultKey = getAllKeys(this.resultTree, 'key')
            this.$nextTick(() => {
              this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
            })
          })
          return this.resultTree
        })
        .finally(() => {
          this.resultTreeLoading = false
        })
    },
    // 递归赋值
    addStatusForTree(areaList, sItem, status, regionId) {
      areaList.forEach((item) => {
        console.log('item', item.id, regionId)
        if (item.id === regionId) {
          if (item.resource) {
            item.resource.status = status
          } else {
            item.resource = { status }
          }
          item.percentage = sItem.percentage
          item.disabled = true
          if (item.resource.status > 2) {
            item.disabled = false
          }
        }
        if (item.children?.length && item.children[0].type === EnumTypes.RESULT_REGION) {
          this.addStatusForTree(item.children, sItem, status, regionId)
        }
      })
    },
    // 获取成果计算状态
    getStatus() {
      window.clearTimeout(this.stateTimer)
      getCalculateStatus(this.projectId, this.taskId).then((res) => {
        const list = res.data
        // 待处理，进行中继续查询
        list.forEach((item) => {
          this.addStatusForTree(this.resultTree[0]?.children, item, item.status, item.regionId)
        })
        // 如果状态还有未完成的轮询成果状态
        if (!list.every((item) => item.status > 2)) {
          this.resultTree[0].disabled = true
          this.resultLoading = true
          this.stateTimer = setTimeout(() => {
            this.getStatus()
          }, 15000)
        } else {
          this.resultTree[0].disabled = false
          this.resultLoading = false
          window.clearTimeout(this.stateTimer)
          this.stateTimer = null
        }
        // 处理区域禁选择状态
        this.resultTree[0]?.children?.forEach((area) => {
          if (area?.children?.length) {
            area.disabled = area.children[0]?.type === EnumTypes.RESULT_REGION ? !area.children.every((sItem) => sItem.resource?.status > 2) : false
          }
        })
        const allResultKey = this.$refs.resultTreeRef?.getCheckedKeys()
        this.renderKey++
        this.$nextTick(() => {
          this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
        })
      })
    },
    // 场景加载回调
    sceneAddedCallback() {
      this.disable = false
      const type = this.$route.query.type
      this.getMeshData()
      if (type === 'add') {
        setTimeout(() => {
          window.bimInstance?.focusToLayer('extLayerId')
        }, 1000)
      }
    },
    // 获取编辑详情
    getDetail() {
      return getReceiveDetail(this.projectId, this.taskId).then((res) => {
        return res.data
      })
    },
    // 收方成果节点触发
    handleNodeClick(node) {
      this.isActive = true
      if (node.disabled) return
      if (node.type === EnumTypes.RESULT_STAKE) {
        if (this.chartLoading) return
        if (this.curClickNode?.id === node.id) return
        // 清除gis断面
        this.clearSceneHandle()
        this.curClickNode = node
        // 查询接口
        // this.chartLoading = true
        getCalculateResult(this.projectId, this.taskId, node.id).then((res) => {
          // 断面数据
          this.curPointData = res.data
          this.pointActive = true
          this.$nextTick(() => {
            this.drawHandle(node, this.layerTree, drawConfig)
          })
          // this.fetchSettings(node)
        }).catch(() => {
          this.chartLoading = false
        })
      } else if (node.type === EnumTypes.RESULT_REGION) {
        this.clearResultScene()
        // 区域
        const nodes = findNodeListsWithType(this.layerTree, EnumTypes.AREA)
        const curNode = nodes.find((item) => item.name === node.name)
        if (curNode) {
          this.$refs.layerTreeRef.handleFocusNode({}, curNode)
        }
      }
    },
    // 获取所有mesh数据
    getMeshData() {
      getAllMeshData(this.projectId, this.taskId).then(res => {
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
            // TODO 获取mesh数据后，绘制mesh面
            const nodes = findNodeListsWithType(this.layerTree, EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
            this.updateMeshByTree(nodes)
            this.$nextTick(() => {
              this.drawMesh(this.meshData)
            })
          })
        }
      })
    },
    // 查询配置
    fetchSettings(node) {
      const params = {
        regionId: node.parentId,
        stakeId: node.id
      }
      this.settings = null
      getTaskSetting(this.projectId, this.taskId, params).then(res => {
        this.settings = res || {}
      }).catch(() => {
        this.chartLoading = false
      })
    },
    // 节点点选
    handleCheck(node) {
      if (node.type === EnumTypes.RESULT_STAKE) {
        // 桩点
        const nodes = findNodeListsWithType(this.layerTree, EnumTypes.PILE_NUMBER)
        const curNode = nodes.find((item) => item.name === node.name && item.resource.engineerCoordinate === node.resource.engineerCoordinate)
        if (curNode) {
          curNode.checked = node.checked
          this.$refs.layerTreeRef.handleCheck(curNode, {})
          setTimeout(() => {
            this.$refs.layerTreeRef.setChecked(curNode.key, node.checked)
          }, 300)
        }
      } else if (node.type === EnumTypes.RESULT_REGION) {
        // 区域
        const nodes = findNodeListsWithType(this.layerTree, EnumTypes.AREA)
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
        const nodes = findNodeListsWithType(this.resultTree, EnumTypes.RESULT_REGION)
        const curNode = nodes.find((item) => item.name === node.name && item.resource.status > 2)
        if (curNode) {
          this.$refs.resultTreeRef.setChecked(curNode.key, node.checked, true)
        }
      } else if (node.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP || node.type === EnumTypes.ROCK_SOIL_BOUNDARY) {
        // 重新更新 mashData checked状态 调整mesh面显隐
        const nodes = findNodeListsWithType(this.layerTree, EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
        this.updateMeshByTree(nodes)
        // 处理显隐
        this.$nextTick(() => {
          this.handleMeshShow(this.meshData)
        })
      }
    },
    // 节点点选
    handleCheckChange(node, isChecked, isIndeterminate) {
      node.checked = isChecked
    },
    // 映射参数
    mappingMatchParams(original) {
      const transformedArray = original
        .map((item) => {
          const groupedStakes = item.pointList.reduce((acc, stake) => {
            if (!acc[stake.configId]) {
              acc[stake.configId] = []
            }
            acc[stake.configId].push(stake.name)
            return acc
          }, {})

          // 映射生成新的对象数组
          return Object.keys(groupedStakes).map((configId) => ({
            imageId: item.imageId,
            terrainId: item.terrainId,
            configId: configId,
            stakes: groupedStakes[configId]
          }))
        })
        .flat()
      return transformedArray
    },
    // 匹配地形
    matchTerrain() {
      // 匹配地形算法
      this.matchLoading = true
      this.matchModels = []
      return this.$worker
        .run(
          (pointSectionList, models) => {
            function isPointInPolygon(point, vs) {
              let j = vs.length - 1
              let oddNodes = false

              for (let i = 0; i < vs.length; i++) {
                if (
                  ((vs[i].y < point.y && vs[j].y >= point.y) || (vs[j].y < point.y && vs[i].y >= point.y)) &&
                  point.x <= ((vs[j].x - vs[i].x) * (point.y - vs[i].y)) / (vs[j].y - vs[i].y) + vs[i].x
                ) {
                  oddNodes = !oddNodes
                }
                j = i
              }
              return oddNodes
            }
            function mappingPointList(list) {
              return list?.map((item) => {
                return {
                  x: Number(item[0]),
                  y: Number(item[1])
                }
              })
            }
            // 实现线段相交检测
            function doIntersect(p1, p2, p3, p4) {
              const d = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y)
              const t = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / d
              const u = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / d
              return t >= 0 && t <= 1 && u >= 0 && u <= 1
            }
            // 综合判断
            function isPolygonInsideAndNoIntersection(point, polygon, ind) {
              if (!point?.length) return false
              // 检查端线是否在B内
              const min = point[0]
              const max = point[point.length - 1]
              if (!(isPointInPolygon(min, polygon) && isPointInPolygon(max, polygon))) {
                return false
              }

              // 检查边缘是否相交
              for (let i = 0; i < point.length; i++) {
                for (let j = 0; j < polygon.length; j++) {
                  if (doIntersect(point[i], point[(i + 1) % point.length], polygon[j], polygon[(j + 1) % polygon.length])) {
                    return false
                  }
                }
              }

              return true
            }

            pointSectionList.forEach((point, index) => {
              const pointSection = JSON.parse(point.designEngineerCoords)
              const pointList = mappingPointList(pointSection)
              for (let i = 0; i < models.length; i++) {
                const modelList = mappingPointList(models[i]?.localBoundary || [])
                const isMatch = isPolygonInsideAndNoIntersection(pointList, modelList, index)
                if (isMatch) {
                  models[i].pointList.push(point)
                  break
                }
              }
            })
            return models.filter((item) => item.pointList.length > 0)
          },
          [this.pointSectionList, this.models]
        )
        .then((res) => {
          this.matchModels = res.filter((item) => item.pointList?.length > 1)
          if (this.matchModels.length === 0) {
            this.error = true
            this.matchLoading = false
            return Promise.reject(this.error)
          }
          this.error = false
          this.step = 1
          this.matchLoading = false
        })
    },
    // 发起计算
    async computedResult(repeat = false) {
      this.computeLoading = true
      // 从新计算先匹配
      if (repeat) {
        await this.matchTerrain()
      }
      const params = this.mappingMatchParams(this.matchModels)
      let flag = true
      !this.taskId &&
        (await this.save(false).catch(() => {
          this.computeLoading = false
          flag = false
        }))
      if (!flag) {
        return
      }
      this.$nextTick(() => {
        startCalculate(this.projectId, this.taskId, params)
          .then(async () => {
            // 获取成果树
            this.resultTreeLoading = true
            await this.getCalculateTree()
            // 发起计算成功
            this.step = 2
            // 轮询状态
            this.getStatus()
          })
          .finally(() => {
            this.computeLoading = false
          })
      })
    },
    // 递归赋值
    findAreaAddChildren(data, list, obj) {
      data.forEach((item) => {
        if (item.key === obj.key) {
          item.children = list
        } else if (item.children && item.children.length > 0 && item.children[0].type === EnumTypes.RESULT_REGION) {
          this.findAreaAddChildren(item.children, list, obj)
        }
      })
    },
    // 查询计结果
    onQueryResult(data) {
      // 区域
      // const index = this.resultTree[0].children.findIndex((item) => item.key === data.key)
      getStakeByArea(this.projectId, data.id).then((res) => {
        const list = addRandomKeys(res)
        this.findAreaAddChildren(this.resultTree[0].children, list, data)
        // this.resultTree[0].children[index].children = list
        // data.children = list
        const listKeys = list.map((item) => item.key)
        const allResultKey = this.$refs.resultTreeRef.getCheckedKeys()
        allResultKey.push(...listKeys)
        this.defaultExpandedKeys.push(data.key)
        this.renderKey++
        this.$nextTick(() => {
          this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
        })
      })
    },
    // 地形边界切换
    onModelActive(name) {
      if (this.activeModelName === name) {
        this.activeModelName = ''
        return
      }
      this.activeModelName = name
      const curModel = this.matchModels.find((item) => item.name === name)
      if (curModel) {
        const points = curModel?.pointList?.map((item) => {
          return {
            name: item.name,
            resource: {
              gisCoordinate: item.gisCoord
            }
          }
        })
        window.bimInstance?.createPointsLabel(points)
        // 取中心点
        const middle = points[Math.floor(points.length / 2)]
        const gisCoordinate = JSON.parse(middle.resource.gisCoordinate)
        const position = {
          lon: gisCoordinate[0],
          lat: gisCoordinate[1],
          alt: gisCoordinate[2] + 150
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
      }
    },
    // 清理场景
    clearScene() {
      if (!this.sceneId) return
      const params = {
        sceneId: this.sceneId,
        bizId: this.isTemporaryScenes ? '' : this.taskId,
        type: this.isTemporaryScenes ? 2 : 4
      }
      restoreTemporaryScenes(this.projectId, params)
    },
    // 下载
    download() {
      this.downLoading = true
      getReceiveResultExcel(this.projectId, this.taskId)
        .then((res) => {
          if (res) {
            // window.location.href = res
            window.open(res, '_blank')
          }
        })
        .finally(() => {
          this.downLoading = false
        })
    },
    openDownloadDialog() {
      this.downloadVisible = true
    },
    // 下载收方成果
    resultDownload() {
      const children = this.resultTree[0].children
      if (children.some((item) => item?.resource?.status && item?.resource?.status < 3)) {
        this.$confirm('当前有区域未计算完成，请确认是否继续下载？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          type: 'warning'
        })
          .then(() => {
            this.download()
          })
          .catch(() => {
            console.log('取消下载')
          })
        return
      }
      this.download()
    },
    // 分享
    shareHandle() {
      this.homeView = window.bimInstance?.getCameraStatus()
      this.handleTreeChecked()
      this.shareVisible = true
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
    // 简化配置
    onReduceConfig(config) {
      const { simplifyLine } = config
      const engineerCoords = JSON.parse(this.curPointData.engineerCoords).sort((a, b) => a[3] - b[3])
      const params = {
        points: engineerCoords,
        simplifyRate: simplifyLine
      }
      simplifyReceive(this.projectId, params).then((res) => {
        const simplifyData = res.data || []
        const chartOption = cloneDeep(this.chartOption)
        chartOption.series[0].data = translateCoordinates(simplifyData, this.angle, this.isRight)
        chartOption.series[0].smooth = simplifyLine === 100
        this.chartOption = chartOption
      }).finally(() => {
        this.chartLoading = false
      })
    },
    // 保存配置
    onSaveConfig(config) {
      const params = {
        regionId: this.curClickNode.parentId,
        stakeId: this.curClickNode.id,
        ...config
      }
      saveTaskSetting(this.projectId, this.taskId, params).then((res) => {
        this.$message.success('保存成功')
        this.fetchSettings(this.curClickNode)
      })
    },
    // 计算坐标点
    computedGisCoordinate(node) {
      const engineerCoordinate = JSON.parse(node.resource.engineerCoordinate)
      const point = {
        x: engineerCoordinate[0],
        y: engineerCoordinate[1]
      }
      const newModels = this.models.map((item) => {
        return {
          layerId: item.layerId,
          name: item.name,
          modelList: item?.localBoundary?.map((it) => {
            return {
              x: Number(it[0]),
              y: Number(it[1])
            }
          })
        }
      })
      const findMatchModel = newModels.find(item => {
        return isPointInPolygonHandle(point, item.modelList)
      })
      return new Promise((resolve, reject) => {
        if (findMatchModel) {
          const gisCoordinate = JSON.parse(node.resource.gisCoordinate)
          const gisCoord = {
            lon: gisCoordinate[0],
            lat: gisCoordinate[1]
          }
          const layer = window.bimInstance?.getLayerById(findMatchModel.layerId)
          if (layer.isVisible) {
            layer?.getAltitude(gisCoord, (res) => {
              if (res) {
                gisCoord.alt = res
                resolve(JSON.stringify([gisCoord.lon, gisCoord.lat, gisCoord.alt]))
              } else {
                resolve(node.resource.gisCoordinate)
              }
            })
          } else {
            resolve(node.resource.gisCoordinate)
          }
        } else {
          resolve(node.resource.gisCoordinate)
        }
      })
    },
    downLine() {
      window.bimInstance?.drawLine()
    }
  }
}
</script>
<style lang="scss" scoped>
  .measurement-receiver-edit {
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
        height: calc(100% - 5px);
        overflow-y: auto;
        background: #2e343e;
        border-radius: 6px;
        padding: 8px;
        margin-bottom: 10px;
      }
      .bottom {
        height: calc(100% - 5px);
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
    .match-btn {
      width: 100%;
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
    .el-alert {
      margin-bottom: 10px;
    }
  }
</style>
