<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-02 13:38:21
 * @description: 断面对比详情
-->
<template>
  <div
    class="section-comparison-edit"
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
            v-if="stackComparisonId"
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
            @click="downloadVisible = true"
            :disabled="disable || calculateState !== enumComputeStatus.COMPUTED_SUCCESS"
            v-if="stackComparisonId"
            class="top-btn"
          >{{$t('download')}}</el-button>
          <el-button
            @click="shareHandle"
            v-if="stackComparisonId"
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
    <SharedDialog
      :tree="[...layerTree, ...resultTree, ...templateTree]"
      :taskId="stackComparisonId"
      :homeView="homeView"
      :name="name"
      :type="2"
      :visible.sync="shareVisible"
    />
    <ComparisonDownLoadDialog
      :taskId="stackComparisonId"
      :visible.sync="downloadVisible"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { EnumTypes, EnumComputeStatus } from '@/common/enum'
import { uniqBy } from 'lodash'
import meshMixins from '@/mixins/meshMixins'
import drawMixins from '@/mixins/drawMixins'
import goBackMixins from '@/mixins/goBackMixins'
import drawConfig from './chartConfig/comparisonsConfig'
import { addTemporaryScenes, restoreTemporaryScenes, updateScenes } from '@/api/common'
import {
  getNewCompareTree,
  getCompareDetail,
  saveNewCompare,
  saveNewCompareThumbnail,
  getComparisonCalculateResult,
  getCompareTree,
  getCompareMeshData,
  getAllMeshData,
  setComparisonCalculate,
  getComparisonResultStatus
} from '@/api/business'
import {
  addRandomKeys,
  findNodeListsWithType,
  findKeysByVal,
  setCheckedByKeys,
  loadOBJFile,
  replaceIdsByNames
} from '@/utils/index'
import EditInput from '@/components/EditInput.vue'
import SceneComponent from '@/components/scene/index.vue'
import NoContent from '@/components/NoContent.vue'
import CustomTree from '@/components/CustomTree.vue'
import ChartCollapse from './components/ChartCollapse.vue'
import AreaInfoCard from './components/AreaInfoCard.vue'
import SharedDialog from './components/SharedDialog.vue'
import ComparisonDownLoadDialog from './components/ComparisonDownLoadDialog.vue'

export default {
  name: 'MeasurementReceiverEdit',
  components: {
    SceneComponent,
    NoContent,
    CustomTree,
    ChartCollapse,
    AreaInfoCard,
    SharedDialog,
    ComparisonDownLoadDialog,
    EditInput
  },
  mixins: [meshMixins, drawMixins, goBackMixins],
  data() {
    return {
      name: '',
      originalName: '',
      gatherDate: '',
      sceneId: '',
      preTaskId: '',
      postTaskId: '',
      pointActive: false, // 是否激活桩号
      sceneOptions: {},
      layerTree: [],
      resultTree: [],
      templateTree: [],
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
      renderKey: 0,
      loading: false,
      shareVisible: false,
      shareLoading: false,
      downloadVisible: false,
      version: 0,
      isTemporaryScenes: true,
      isActive: false,
      curClickNode: null,
      chartLoading: false,
      homeView: null,
      angle: 0,
      isRight: false,
      // 计算状态
      calculateState: 0, // 0：未保存 1:计算中 2:计算失败 3:计算成功
      meshData: [],
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
      const { type, preTaskId, postTaskId, name, gatherDate, id = '' } = this.$route.query
      this.preTaskId = preTaskId
      this.postTaskId = postTaskId
      this.name = name
      this.originalName = name
      this.gatherDate = gatherDate
      this.stackComparisonId = id
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
        id: this.stackComparisonId,
        version: this.version,
        name: this.name,
        homeView: cameraStatus,
        preTaskId: this.preTaskId,
        postTaskId: this.postTaskId,
        catalogs: [...this.layerTree, ...this.templateTree, ...this.resultTree]
      }
      this.loading = true
      saveNewCompare(this.projectId, params)
        .then((res) => {
          this.stackComparisonId = res.data.id
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
                id: this.stackComparisonId
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
      saveNewCompareThumbnail(this.projectId, this.stackComparisonId, formData)
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
        preTaskId: this.preTaskId,
        postTaskId: this.postTaskId
      }
      return getNewCompareTree(this.projectId, params).then((res) => {
        return res
      })
    },
    // 获取编辑图层
    getEditLayerList() {
      const params = {
        stackComparisonId: this.stackComparisonId
      }
      return getCompareTree(this.projectId, params).then((res) => {
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
    // 处理树形结构数据
    handleTreeData(layerRes) {
      // 图层
      const resultTree = layerRes.filter((item) => item.type === EnumTypes.RESULT) || []
      const templateTree = layerRes.filter((item) => item.type === EnumTypes.RECEIPT_TEMPLATE) || []
      const layerTree = layerRes.filter((item) => (item.type !== EnumTypes.RECEIPT_TEMPLATE && item.type !== EnumTypes.RESULT)) || []
      this.layerTree = layerTree
      this.templateTree = templateTree
      this.layerTree = addRandomKeys(this.layerTree, 'root', 'repeated')
      // 收房成果
      if (resultTree?.[0]?.children?.length) {
        this.resultTree = addRandomKeys(resultTree)
      }
      this.$nextTick(() => {
        const allKey = findKeysByVal(this.layerTree, 'checked', true)
        const allResultKey = findKeysByVal(this.resultTree, 'checked', true)
        this.$nextTick(() => {
          this.$refs.layerTreeRef?.setCheckedKeys(allKey)
          this.$refs.resultTreeRef?.setCheckedKeys(allResultKey)
        })
      })
      // 图纸
      const drawings = layerRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)?.children || []
      const resources = []
      const drawingsResources = drawings.map((item) => {
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
      // 模型
      const models = layerTree.find((item) => item.type === EnumTypes.BASE_MAP_LAYER)?.children || []
      const noRepeatModels = models.filter((item) => !item?.resource?.repeated && item?.resource?.modelId)
      const modelResources = noRepeatModels.map((item) => {
        return {
          id: item.resource.layerId,
          name: item.name,
          modelId: item.resource.modelId,
          typeName: 'TilesetLayer',
          modelType: 'singleModel',
          isVisible: item.checked
        }
      })
      const uniqueModelResources = uniqBy(modelResources, 'id')
      resources.push(...drawingsResources, ...uniqueModelResources)
      // 收方模板
      const template = layerRes?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
      // 中心线
      const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
      // 区域
      const areaList = resultTree[0]?.children || []
      return {
        roadLineList,
        areaList,
        resources
      }
    },
    // 新建收方初始化
    async newInit() {
      this.getNewLayerList().then(async (res) => {
        const layerRes = res || []
        const { resources, roadLineList, areaList } = this.handleTreeData(layerRes)
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
      })
    },
    // 编辑收方初始化
    async editInit() {
      Promise.all([this.getEditLayerList(), this.getDetail(), this.getCalculateStatus(false)]).then(async ([layerRes, detailRes]) => {
        this.sceneId = detailRes.sceneId
        this.version = detailRes.version
        this.preTaskId = detailRes.preTaskId
        this.postTaskId = detailRes.postTaskId
        this.name = detailRes.name
        this.originalName = detailRes.name
        const { resources, roadLineList, areaList } = this.handleTreeData(layerRes)
        const params = {
          sceneId: detailRes.sceneId,
          stackComparisonId: this.stackComparisonId,
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
      const type = this.$route.query.type
      if (type === 'add') {
        setTimeout(() => {
          window.bimInstance?.focusToLayer('extLayerId')
        }, 1000)
      } else {
        // 查询收方成果
        setTimeout(() => {
          this.defaultSelect()
        }, 1000)
      }
      this.getMeshData()
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
    // 获取编辑详情
    getDetail() {
      return getCompareDetail(this.projectId, this.stackComparisonId).then((res) => {
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
        if (this.chartLoading || this.curClickNode?.id === node.id) return
        // if (this.calculateState === 3) return this.$message.warning('有部分任务计算失败！')
        if (this.calculateState === this.enumComputeStatus.COMPUTE_NOT_START) return this.$message.warning('请先保存，发起计算！')
        if (this.calculateState === this.enumComputeStatus.COMPUTING) return this.$message.warning('计算中，请稍后！')
        this.curClickNode = node
        // 查询接口
        // this.chartLoading = true
        const params = {
          preTaskId: this.preTaskId,
          stakeName: node.name
        }
        getComparisonCalculateResult(this.projectId, this.stackComparisonId, node.id, params).then((res) => {
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
        }).catch(() => {
          this.chartLoading = false
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
      setComparisonCalculate(this.projectId, this.stackComparisonId).then((res) => {
        // 计算中
        this.$message.success('计算已发起')
        this.calculateState = this.enumComputeStatus.COMPUTING
        this.getCalculateStatus(true)
      })
    },
    // 查询计算结果
    getCalculateStatus(flag = false) {
      if (!this.stackComparisonId) return Promise.resolve()
      // 查询计算状态
      return getComparisonResultStatus(this.projectId, this.stackComparisonId).then((res) => {
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
        bizId: this.isTemporaryScenes ? '' : this.stackComparisonId,
        type: this.isTemporaryScenes ? 6 : 5
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
    // 获取所有mesh数据
    getMeshData() {
      const api = this.stackComparisonId ? getCompareMeshData : getAllMeshData
      const id = this.stackComparisonId || this.postTaskId
      api(this.projectId, id).then(res => {
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
    }
  }
}
</script>
<style lang="scss" scoped>
  .section-comparison-edit {
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
