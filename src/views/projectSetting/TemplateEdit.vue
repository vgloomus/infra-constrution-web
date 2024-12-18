<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-04 15:23:28
 * @description: 模板编辑、新建
-->
<template>
  <div
    class="template-edit"
    v-loading="loading"
    :element-loading-text="$t('saving')"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <SceneComponent
      :options="sceneOptions"
      :showFooter="false"
      :showRightMenu="false"
      :showLeftMenu="true"
    >
      <template slot="title">
        <el-dropdown @command="handleCommand">
          <el-button
            :disabled="disable"
            type="text"
          >
            <i class="icon-add"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="referenceType!==1"
              command="area"
            >{{$t('templateEdit.addArea')}}</el-dropdown-item>
            <el-dropdown-item command="data">{{$t('templateEdit.addAreaData')}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <template slot="top-menu">
        <el-button
          @click="goBack"
          icon="el-icon-arrow-left"
        >{{$t('return')}}</el-button>
        <EditInput
          :disable="disable"
          :originalName.sync="originalName"
          :placeholder="$t('templateEdit.placeHolder')"
          v-model="name"
        />
        <div class="top-menu-btn">
          <el-button
            type="primary"
            :disabled="disable"
            @click="save"
          >{{$t('save')}}</el-button>
        </div>
      </template>
      <template slot="left">
        <CustomTree
          v-if="tree.length > 0"
          ref="treeRef"
          :key="renderKey"
          :isDelete="true"
          :isEdit="true"
          :isFocus="true"
          :draggable="true"
          :isLimitRegion="+referenceType === 1"
          :treeData="tree"
          :defaultExpandedKeys.sync="defaultExpandedKeys"
          :defaultExpandAll="false"
          :treeProps="treeProps"
          @onCollapse="nodeCollapseHandle"
          @onExpand="nodeExpandHandle"
          @handleCheckCallBack="handleCheckCallBack"
          @removeRockSoilBoundary="removeRockSoilBoundary"
          @focusRockSoilBoundary="focusRockSoilBoundary"
        />
        <no-content
          v-loading="disable"
          element-loading-background="rgba(0, 0, 0, 0.8)"
          v-else
          :text="$t('measurement.noDataSync')"
        />
      </template>
    </SceneComponent>
    <AddAreaDataDialog
      :areaList="areaList"
      :visible.sync="addAreaVisible"
      :saveAreaDataLoading="saveAreaDataLoading"
      @save="saveAreaData"
    />
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { EnumTypes } from '@/common/enum'
import moment from 'moment'
import { findLastIndex, cloneDeep } from 'lodash'
import meshMixins from '@/mixins/meshMixins'
import goBackMixins from '@/mixins/goBackMixins'
import {
  getDrawingList,
  syncTemplateData,
  getTaskLayerTree,
  saveTemplate,
  getTemplateDetail,
  getTaskLayerTreeForEdit,
  crossSectionConfig,
  getAllMeshData
} from '@/api/projectSetting'
import { addTemporaryScenes, restoreTemporaryScenes, updateScenes } from '@/api/common'
import {
  addRandomKeys,
  getAllKeys,
  findNodeListsWithType,
  findNodeListsWithTypeKey,
  findKeysByVal,
  collectNonLeafKeys,
  setCheckedByKeys,
  replaceIdsByNames,
  loadOBJFile,
  sortPileNumber,
  sortTreeByTypeAndName,
  findAreaListsWithType
} from '@/utils/index'
import SceneComponent from '@/components/scene/index.vue'
import CustomTree from '@/components/CustomTree.vue'
import AddAreaDataDialog from './components/AddAreaDataDialog.vue'
import NoContent from '@/components/NoContent.vue'
import EditInput from '@/components/EditInput.vue'

export default {
  name: 'TemplateEdit',
  components: {
    SceneComponent,
    NoContent,
    CustomTree,
    AddAreaDataDialog,
    EditInput
  },
  mixins: [meshMixins, goBackMixins],
  data() {
    return {
      name: '',
      originalName: '未命名模板',
      referenceType: 0,
      sceneId: '',
      sceneOptions: {},
      tree: [],
      disable: true,
      templateId: '',
      treeProps: {
        children: 'children',
        label: 'name'
      },
      loading: false,
      renderKey: 0,
      syncLoading: false,
      defaultExpandedKeys: [],
      version: 0,
      isTemporaryScenes: true,
      areaList: [],
      addAreaVisible: false, // 新增区域数据
      saveAreaDataLoading: false,
      meshData: [],
      curNewMesh: null
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  created() {
    this.init()
  },
  beforeDestroy() {
    this.clearScene()
  },
  methods: {
    // 初始化
    init() {
      const { type, id = '', referenceType } = this.$route.query
      this.templateId = id
      this.referenceType = +referenceType
      if (type === 'add') {
        this.name = '未命名模板'
        this.initNewTemplate()
      } else {
        this.initEditTemplate()
      }
      this.isTemporaryScenes = !id
    },
    // 新建虚拟场景
    addScene(resources) {
      const params = {
        projectId: this.projectId,
        type: 1,
        resources
      }
      return addTemporaryScenes(params).then((res) => {
        return res.data
      })
    },
    // 编辑初始化
    initEditTemplate() {
      Promise.all([this.initReceiptTree(), this.getDetail()]).then(async ([treeRes, detailRes]) => {
        const { name } = detailRes
        this.name = name
        this.originalName = name
        this.templateId = detailRes.id
        this.version = detailRes.version
        this.sceneId = detailRes.sceneId
        // 收方模板
        const template = treeRes?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
        // 中心线
        const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
        // 区域
        const areaList = template?.children?.filter((item) => item.type === EnumTypes.AREA) || []
        // 图纸
        const drawings = treeRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)?.children || []
        const resources = drawings.map((item) => {
          return {
            id: item.resource.layerId,
            name: item.name,
            modelId: item.resource.modelId,
            typeName: 'DrawingLayer',
            modelType: 'singleModel',
            isVisible: item.checked
          }
        })
        // 更新场景
        const params = {
          sceneId: this.sceneId,
          templateId: this.templateId,
          resources
        }
        const newScenes = await updateScenes(this.projectId, params)
        this.sceneOptions = {
          roadLineList,
          areaList,
          sceneViewToken: newScenes.data,
          sceneAddedCallback: this.sceneAddedCallback
        }
        // 没有收方模板-新建收方模板
        if (!template) {
          treeRes.unshift({
            id: '',
            name: '收方模板',
            checked: true,
            type: EnumTypes.RECEIPT_TEMPLATE,
            children: []
          })
        }
        const tree = addRandomKeys(treeRes)
        sortTreeByTypeAndName(tree, EnumTypes.SECTION_DATA)
        this.tree = tree
        this.defaultExpandedKeys = collectNonLeafKeys(this.tree)
        const allKey = findKeysByVal(this.tree, 'checked', true)
        this.$nextTick(() => {
          this.$refs.treeRef?.setCheckedKeys(allKey)
        })
      })
    },
    // 获取图纸设计图层
    getDrawings() {
      return getDrawingList(this.projectId).then((res) => {
        return res
      })
    },
    // 获取模板详情
    getDetail() {
      return getTemplateDetail(this.projectId, this.templateId).then((res) => {
        return res || {}
      })
    },
    // 新建模板初始化
    async initNewTemplate() {
      const drawingRes = await this.getDrawings()
      // 图纸
      const drawings = drawingRes?.drawings?.filter((item) => item.enable) || []
      const resources = drawings.map((item) => {
        return {
          id: item.layerId,
          name: item.fileName,
          modelId: item.globalBimfaceId,
          typeName: 'DrawingLayer',
          modelType: 'singleModel'
        }
      })
      Promise.all([this.addScene(resources), this.initReceiptTree()]).then(([sceneRes, receiptRes]) => {
        this.sceneId = sceneRes.sceneId
        // 收方模板
        const template = receiptRes?.catalogs?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
        // 中心线
        const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
        // 区域
        const areaList = template?.children?.filter((item) => item.type === EnumTypes.AREA) || []
        this.sceneOptions = {
          // drawingList: drawings,
          roadLineList,
          areaList,
          sceneViewToken: sceneRes.viewToken,
          sceneAddedCallback: this.sceneAddedCallback
        }
        if (template) {
          this.tree.push(template)
        } else {
          this.tree.push({
            id: '',
            name: '收方模板',
            checked: true,
            type: EnumTypes.RECEIPT_TEMPLATE,
            children: []
          })
        }
        // 图纸图层
        const drawingData = drawings.map((item) => {
          return {
            id: item.id,
            name: item.fileName,
            type: EnumTypes.DRAWING,
            children: [],
            ...item,
            checked: true
          }
        })
        if (drawingData.length) {
          const receiptTemplate = {
            id: '',
            name: '设计图层',
            checked: true,
            type: EnumTypes.DESIGN_LAYER,
            children: drawingData
          }
          this.tree.push(receiptTemplate)
        }
        this.tree = addRandomKeys(this.tree)
        const allKey = getAllKeys(this.tree, 'key')
        this.defaultExpandedKeys = collectNonLeafKeys(this.tree)
        this.$nextTick(() => {
          this.$refs.treeRef?.setCheckedKeys(allKey)
        })
      })
    },
    // 初始化收方树
    initReceiptTree() {
      const api = this.templateId ? getTaskLayerTreeForEdit : getTaskLayerTree
      return api(this.projectId, this.templateId, this.referenceType).then((res) => {
        return res
      })
    },
    // 场景添加完成回调
    sceneAddedCallback() {
      this.disable = false
      const type = this.$route.query.type
      if (type === 'add') {
        setTimeout(() => {
          window.bimInstance?.focusToLayer('extLayerId')
        }, 1000)
      } else {
        this.getMeshData()
      }
    },
    // 添加区域/数据
    handleCommand(command) {
      if (command === 'area') {
        this.addArea()
      } else if (command === 'data') {
        const tree = cloneDeep(this.tree)
        const list = tree[0]?.children?.filter((item) => item.type === EnumTypes.AREA) || []
        this.areaList = findAreaListsWithType(list, EnumTypes.AREA)
        if (this.areaList.length) {
          this.addAreaVisible = true
        } else {
          this.$message.warning('无区域，请先添加区域')
        }
      }
    },
    // 添加区域
    addArea() {
      const index = this.tree.findIndex((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
      const firstKey = this.tree[0]?.key
      this.$refs.treeRef?.scrollToItem(firstKey)
      setTimeout(() => {
        if (index !== -1) {
          const nodes = this.tree[index]?.children || []
          const areas = nodes.filter((item) => item.type === EnumTypes.AREA)
          if (areas.length >= 100) {
            this.$message.warning('区域数已达上限（100个），无法继续添加新区域')
            return
          }
          const names = new Set(areas.map((item) => item.name))
          if (names.size !== areas.length) {
            this.$message.warning('区域名称不能重复，请先修改名称再添加新区域')
            return
          }
          const key = Math.random().toString(36).substr(2, 9)
          const node = {
            id: '',
            key,
            checked: true,
            name: '区域',
            type: EnumTypes.AREA,
            children: [
              {
                id: '',
                key: `${key}-1`,
                checked: true,
                name: '断面数据',
                type: EnumTypes.SECTION_DATA,
                children: []
              }
            ]
          }
          nodes.unshift(node)
          this.tree[index].children = nodes
          this.$nextTick(() => {
            this.defaultExpandedKeys = collectNonLeafKeys(this.tree)
            this.$refs.treeRef?.setChecked(key, true)
            this.$refs.treeRef?.setChecked(`${key}-1`, true)
            this.$refs.treeRef?.rename(null, node)

            // setTimeout(() => {
            //   const nodes = this.$refs.treeRef.$el.querySelectorAll('.el-tree-node__content')
            //   if (nodes.length > 1) {
            //     const secondNode = nodes[1]
            //     secondNode.style.background = 'rgba(22, 119, 255, 0.3)'
            //   }
            // }, 400)
          })
        }
      }, 1000)
    },
    // 保存
    save() {
      this.loading = true
      // 获取区域和栈号
      const areaData = findNodeListsWithType(this.tree, EnumTypes.AREA)
      const findError = areaData.find((item) => {
        const sectionData = item?.children?.find((section) => section.type === EnumTypes.SECTION_DATA)
        return sectionData?.children?.length < 2
      })
      if (findError) {
        this.$message.warning(`${findError.name}断面数据至少有2个桩号`)
        this.loading = false
        return
      }
      if (!this.name) {
        this.loading = false
        return this.$message.error('模板名称不能为空')
      }
      // 解决虚拟树问题
      const allKey = this.$refs.treeRef?.getCheckedKeys()
      this.tree = setCheckedByKeys(this.tree, allKey)
      const cameraStatus = window.bimInstance?.getCameraStatus()
      // 保存数据
      const params = {
        id: this.templateId,
        name: this.name,
        version: this.version,
        homeView: cameraStatus,
        catalogs: this.tree,
        type: this.referenceType
      }
      saveTemplate(this.projectId, params)
        .then((res) => {
          this.$message.success('保存成功')
          // 保存刷新左侧树
          this.refreshTree(res.data.templateId)
          // if (this.templateId) {
          //   this.$nextTick(() => {
          //     // 清除所有mesh面
          //     this.clearMeshData()
          //     this.getMeshData()
          //   })
          // }
          this.templateId = res.data.templateId
          this.version = res.data.version || 0
          this.$router.replace({
            path: '/projectSetting/templateEdit',
            query: {
              type: 'edit',
              version: this.version,
              referenceType: this.referenceType,
              id: this.templateId
            }
          })
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 刷新左侧树
    refreshTree(id) {
      getTaskLayerTreeForEdit(this.projectId, id).then((layerRes) => {
        const tree = layerRes || []
        // 只替换id,parentId,resource字段不刷新树
        replaceIdsByNames(this.tree, 0, tree)
        this.$nextTick(() => {
          // 清除所有mesh面
          this.clearMeshData()
          this.getMeshData()
        })
      })
    },
    // 同步数据
    syncData() {
      this.syncLoading = true
      syncTemplateData(this.projectId)
        .then((res) => {
          this.$message.success('同步任务已发起！')
        })
        .finally(() => {
          this.syncLoading = false
        })
    },
    // 折叠
    nodeCollapseHandle(data) {
      // console.log('折叠', data)
      const keys = collectNonLeafKeys([data])
      const index = this.defaultExpandedKeys.findIndex((item) => keys.includes(item))
      if (index === -1) {
        this.defaultExpandedKeys.push(...keys)
      } else {
        this.defaultExpandedKeys = this.defaultExpandedKeys.filter((item) => !keys.includes(item))
      }
    },
    // 展开
    nodeExpandHandle(data) {
      // console.log('展开', data)
      const keys = collectNonLeafKeys([data])
      const index = this.defaultExpandedKeys.findIndex((item) => keys.includes(item))
      if (index === -1) {
        this.defaultExpandedKeys.push(...keys)
      } else {
        this.defaultExpandedKeys = this.defaultExpandedKeys.filter((item) => !keys.includes(item))
      }
    },
    // 清理临时场景
    clearScene() {
      if (!this.sceneId) return
      const params = {
        sceneId: this.sceneId,
        bizId: this.isTemporaryScenes ? '' : this.templateId,
        type: this.isTemporaryScenes ? 1 : 3
      }
      restoreTemporaryScenes(this.projectId, params)
    },
    // 保存区域数据
    saveAreaData(dataForm, curArea) {
      const { drawingMd, dataType, configId, date, fileName, name } = dataForm
      const params = {
        templateId: this.templateId,
        mainlineParentId: 0,
        areaParentId: curArea.parentId,
        areaId: curArea.id,
        areaName: curArea.name,
        fileId: configId,
        drawingMd,
        dataType,
        encodeFileName: encodeURIComponent(fileName),
        fileName,
        name
      }
      if (dataType !== 'TerrainSection') {
        params.startTime = moment(date[0]).valueOf()
        params.endTime = moment(date[1]).add(23, 'hours').add(59, 'minutes').add(59, 'seconds').valueOf()
      }
      if (dataType === 'StoneBoundary') {
        // 判断重名
        const areaList = findNodeListsWithTypeKey(this.tree, EnumTypes.AREA, curArea.key)
        const list = findNodeListsWithType(areaList, EnumTypes.ROCK_SOIL_BOUNDARY)
        const isRepeat = list.some((item) => item.name.toUpperCase() === name.toUpperCase())
        if (isRepeat) {
          return this.$message.error('名称已存在')
        }
      }
      this.saveAreaDataLoading = true
      crossSectionConfig(this.projectId, params)
        .then((res) => {
          const { data = null } = res
          if (!data) return this.$message.error('保存失败')
          const { children, mainLineChild, promptInfo = '', startTime } = data
          if (promptInfo) {
            return this.$message.warning(promptInfo)
          }
          if (mainLineChild) {
            this.tree = this.insertCenterLineData(this.tree, mainLineChild, curArea.name)
            const gisCoordinate = JSON.parse(mainLineChild?.resource?.gisCoordinate || JSON.stringify([]))
            window.bimInstance?.createRoadLine(gisCoordinate, mainLineChild.name, mainLineChild.checked)
          }
          if (children.length) {
            if (dataType === 'TerrainSection') {
              // 断面数据
              this.tree = this.insertPointData(this.tree, children, curArea)
              children.sort((a, b) => sortPileNumber(a.name, b.name))
              window.bimInstance?.createPointsLabel(children)
            } else if (dataType === 'StoneBoundary') {
              // 土石分界线
              this.tree = this.insertStoneBoundaryData(this.tree, children, curArea, startTime)
              this.$message.success('保存成功')
              const resourceUrl = children[0]?.resource?.resourceUrl
              const resourceKey = children[0]?.resource?.resourceKey
              const meshName = children[0]?.resource?.name
              if (resourceUrl) {
                loadOBJFile(resourceUrl).then((res) => {
                  const mesh = res || []
                  const meshData = {
                    id: '',
                    name: meshName,
                    resourceUrl,
                    resourceKey,
                    type: EnumTypes.ROCK_SOIL_BOUNDARY,
                    resourceData: mesh
                  }
                  this.meshData.push(meshData)
                  window.bimInstance?.drawMeshPlane(meshData)
                  const midIndex = Math.floor(mesh.length / 2)
                  const position = mesh[midIndex][0]
                  position.alt = 100
                  const cameraStatus = {
                    orientation: {
                      pitch: -Math.PI / 2,
                      yaw: 0,
                      roll: 0
                    },
                    position: position
                  }
                  window.bimInstance?.setCameraStatus(cameraStatus)
                  this.setFocusMeshColor(meshData)
                  if (this.curNewMesh) {
                    this.restoreMeshColor(this.curNewMesh)
                  }
                  this.curNewMesh = meshData
                })
              }
            } else {
              // 判断重名
              const areaList = findNodeListsWithTypeKey(this.tree, EnumTypes.AREA, curArea.name)
              const list = findNodeListsWithType(areaList, EnumTypes.BASAL_DATA)
              const isRepeat = list.some((item) => item.name.toUpperCase() === name.toUpperCase())
              if (isRepeat) {
                return this.$message.error('名称已存在')
              }
              // 基底分界线
              this.tree = this.insertFoundationBoundaryData(this.tree, children, curArea.name)
              this.$message.success('保存成功')
            }
          }
          this.tree = addRandomKeys(this.tree)
          this.renderKey++
          const allKey = getAllKeys(this.tree, 'key')
          this.defaultExpandedKeys = collectNonLeafKeys(this.tree)
          this.$nextTick(() => {
            this.$refs.treeRef?.setCheckedKeys(allKey)
          })
          this.saveAreaDataLoading = false
          this.addAreaVisible = false
        })
        .finally(() => {
          this.saveAreaDataLoading = false
        })
    },
    // 递归插入中心线数据
    insertCenterLineData(tree, data, areaName) {
      // 找收方模板
      const templateIndex = tree.findIndex((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
      if (templateIndex > -1) {
        // 找中心线
        const index = tree[templateIndex].children.findIndex((child) => child.type === EnumTypes.CENTER_LINE)
        if (index > -1) {
          const nodes = tree[templateIndex].children[index].children.filter((child) => child.name.includes(`${areaName}-`))
          const lastIndex = findLastIndex(nodes, (child) => child.name.includes(areaName))
          data.name = `${areaName}-${lastIndex + 2}`
          tree[templateIndex].children[index].children.push(data)
        } else {
          data.name = `${areaName}-1`
          tree[templateIndex].children.push({
            type: EnumTypes.CENTER_LINE,
            name: '中心线',
            checked: true,
            children: [data]
          })
        }
      }
      return tree
    },
    // 递归插入桩号数据
    insertPointData(tree, data, area) {
      tree.forEach((item) => {
        if (item.name === area.name && item.key === area.key) {
          // 断面数据
          item.children = item.children || []
          const index = item.children.findIndex((child) => child.type === EnumTypes.SECTION_DATA)
          if (index > -1) {
            if (!item.children[index].children) {
              item.children[index].children = []
            }
            const len = data.length
            // 去重
            // 获取全部桩号
            const pointList = findNodeListsWithType(tree, EnumTypes.PILE_NUMBER)
            const pointGisCoordinate = pointList.map((item) => item?.resource?.gisCoordinate)
            const newData = data.filter((item) => {
              return !pointGisCoordinate.includes(item.resource.gisCoordinate)
            })
            if (len !== newData.length) {
              this.$message.warning('相同桩号不可重复添加')
            } else {
              this.$message.success('保存成功')
            }
            item.children[index].children.push(...newData)
            // 排序
            item.children[index].children.sort((a, b) => {
              return sortPileNumber(a.name, b.name)
            })
          } else {
            item.children.unshift({
              type: EnumTypes.SECTION_DATA,
              name: '断面数据',
              children: data
            })
          }
        } else if (item.children && item.children.length) {
          this.insertPointData(item.children, data, area)
        }
      })
      return tree
    },
    // 插入土石分界
    insertStoneBoundaryData(tree, data, area, startTime) {
      tree.forEach((item) => {
        if (item.name === area.name && item.key === area.key) {
          // 土石分界
          item.children = item.children || []
          const index = item.children.findIndex((child) => child.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
          data[0].orderStartTime = startTime
          if (index > -1) {
            item.children[index].children = item.children[index].children || []
            item.children[index].children.push(...data)
            item.children[index].children.sort((a, b) => {
              return a.orderStartTime - b.orderStartTime
            })
          } else {
            item.children.push({
              type: EnumTypes.ROCK_SOIL_BOUNDARY_GROUP,
              name: '土石分界',
              children: data,
              resource: null
            })
          }
        } else if (item.children && item.children.length) {
          this.insertStoneBoundaryData(item.children, data, area, startTime)
        }
      })
      return tree
    },
    // 插入基底分界
    insertFoundationBoundaryData(tree, data, areaName) {
      tree.forEach((item) => {
        if (item.name === areaName) {
          // 基底分界
          const index = item.children.findIndex((child) => child.type === EnumTypes.BASAL_DATA)
          if (index > -1) {
            item.children[index].children.push(...data)
          } else {
            item.children.push({
              type: EnumTypes.BASAL_DATA,
              name: '基底分界',
              children: data,
              resource: {}
            })
          }
        } else if (item.children && item.children.length) {
          this.insertFoundationBoundaryData(item.children, data, areaName)
        }
      })
      return tree
    },
    // 获取所有mesh数据
    getMeshData() {
      getAllMeshData(this.projectId, this.templateId).then(res => {
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
            // TODO 获取mesh数据后，绘制mesh面
            const nodes = findNodeListsWithType(this.tree, EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
            this.updateMeshByTree(nodes)
            this.$nextTick(() => {
              this.drawMesh(this.meshData)
            })
          })
        }
      }).finally(() => {
        this.loading = false
      })
    },

    // 选择回调
    handleCheckCallBack(node) {
      if (node.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP || node.type === EnumTypes.ROCK_SOIL_BOUNDARY) {
        // 重新更新 mashData checked状态 调整mesh面显隐
        const nodes = findNodeListsWithType(this.tree, EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
        this.updateMeshByTree(nodes)
        // 处理显隐
        this.$nextTick(() => {
          this.handleMeshShow(this.meshData)
        })
      }
    },
    // 删除mesh面
    removeRockSoilBoundary(node) {
      const meshNode = this.meshData.find(item => item.resourceKey === node?.resource?.resourceKey)
      if (meshNode) {
        const names = meshNode.resourceData.map((item, index) => `mesh_${index}_${meshNode.resourceKey}_${meshNode.type}`)
        window.bimInstance.removeExtByNames(names)
        const nodes = findNodeListsWithType(this.tree, EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
        this.updateMeshByTree(nodes)
        this.$nextTick(() => {
          this.handleMeshShow(this.meshData)
        })
      }
    },
    // 恢复mesh颜色
    restoreMeshColor(data) {
      const extNames = []
      data.resourceData.forEach((mesh, index) => {
        extNames.push(`mesh_${index}_${data.resourceKey}_${data.type}`)
      })
      window.bimInstance.restoreExtColorByNames(extNames)
    },
    // 设置聚焦mesh颜色
    setFocusMeshColor(data) {
      const extNames = []
      data.resourceData.forEach((mesh, index) => {
        extNames.push(`mesh_${index}_${data.resourceKey}_${data.type}`)
      })
      window.bimInstance.setExtColorByNames(extNames)
    }
  }
}
</script>
<style lang="scss" scoped>
  .template-edit {
    height: 100%;
    width: 100%;
  }
</style>
