<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-16 18:36:30
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\CustomTree.vue
 * @Description: 树形组件
-->
<template>
  <VueEasyTree
    class="custom-tree"
    :data="tree"
    :highlight-current="true"
    :show-checkbox="showCheckbox"
    ref="treeRef"
    :key="renderKey"
    node-key="key"
    height="100%"
    :default-expand-all="defaultExpandAll"
    :default-expanded-keys="defaultExpandedKeys"
    :lazy="lazy"
    :load="load"
    :item-size="32"
    :props="treePropsData"
    :draggable="draggable"
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    :expand-on-click-node="false"
    @node-drag-over="handleDragOver"
    @node-drop="handleDragEnd"
    @check-change="handleCheckChange"
    @check="handleCheck"
    @node-click="handleNodeClick"
    @drag-start="handleDragStart"
    @node-collapse="handleCollapse"
    @node-expand="handleExpand"
  >
    <div
      :class="[
        'custom-tree-node',
        { 'is-disabled': data.disabled },
        {
          'icon-node': classIconNode(data),
          'tag-node': classTagNode(data),
          'is-hide-checkbox': classHideCheckbox(data)
        }
      ]"
      slot-scope="{ node, data }"
    >
      <span
        class="label-wrap"
        :title="node.label"
      >
        <i
          v-if="data.children && data.children.length > 0"
          class="icon-folder"
        ></i>
        <span
          v-if="data?.resource?.repeated === true && isTwoPhases"
          class="repeat-wrap tow-phase"
        >重复</span>
        <span
          v-if="data?.resource?.tag === types.TERRAIN_PRE || data?.resource?.tag === types.TERRAIN_POST"
          :class="`terrain-wrap${data?.resource?.tag}`"
        >{{ data?.resource?.tag === types.TERRAIN_PRE ? '前期' : '后期' }}</span>
        <span
          v-if="isShowRegionTag(data)"
          :class="['region-tag', `region-tag-${data.resource?.extend?.regionType}`]"
        ></span>
        <el-tooltip
          class="item"
          effect="dark"
          content="当前断面只有后期收方线"
          v-if="data?.resource?.tag === types.COMPARISON_RESULT_POST"
          placement="top"
        >
          <span :class="`terrain-wrap${data?.resource?.tag}`"></span>
        </el-tooltip>
        <el-input
          v-if="editNode && editNode.key === data.key"
          v-model.trim="data[treePropsData.label]"
          :maxlength="50"
          :ref="`input${data.key}`"
          class="inner-input dark"
          @blur="onBlurHandler(data)"
          @keyup.enter.native="endRename(data)"
        >
          <template #suffix>
            <span>
              <i
                class="el-icon-check"
                @click="confirmEdit(data)"
              ></i>
              <i
                class="el-icon-close"
                @click="cancelEdit(data)"
              ></i>
            </span>
          </template>
        </el-input>
        <span
          class="label"
          :style="labelStyle(data)"
          v-else
        >{{ node.label }}</span>
      </span>
      <span class="tag-group">
        <!-- 地形重复 -->
        <span
          v-if="data?.resource?.repeated === true && !isTwoPhases"
          class="repeat-wrap"
        >重复</span>
        <!-- 计算中 -->
        <span
          class="status-wrap"
          v-if="isShowStatus(data) === 2"
        >
          <span class="loading-wrap"></span>
          <span class="tip">{{ statusEnum[isShowStatus(data)] }}{{ data.percentage || 0 }}%</span>
        </span>
        <!-- 等待 -->
        <span
          class="status-wrap"
          v-if="isShowStatus(data) === 1"
        >
          <i class="el-icon-time"></i>
          <span class="tip">{{ statusEnum[isShowStatus(data)] }}</span>
        </span>
        <!-- 计算成功 -->
        <span
          class="status-wrap"
          v-if="isShowStatus(data) === 3"
        >
          <span class="tip">{{ statusEnum[isShowStatus(data)] }}</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="点击查询计算结果"
            placement="top"
          >
            <el-button
              type="text"
              icon="el-icon-reload"
              @click.stop="handleQueryResult(data)"
            ></el-button>
          </el-tooltip>
        </span>
        <!-- 计算失败 -->
        <span
          class="status-wrap"
          v-if="isShowStatus(data) === 4"
        >
          <span class="tip fail">{{ statusEnum[isShowStatus(data)] }}</span>
        </span>
      </span>
      <span class="btn-group">
        <!-- 聚焦 -->
        <el-tooltip
          class="item"
          effect="dark"
          content="定位到当前图层"
          placement="top-start"
        >
          <i
            v-if="!isRenameMode && isShowFocus(data)"
            class="icon-focus"
            @click="(ev) => onFocusNode(ev, data, null, data.checked)"
          ></i>
        </el-tooltip>
        <!-- 编辑 -->
        <el-tooltip
          class="item"
          effect="dark"
          content="重命名"
          placement="top-start"
        >
          <i
            v-if="!isRenameMode && isShowEdit(data)"
            @click="(ev) => rename(ev, data)"
            class="icon-ml icon-edit"
          ></i>
        </el-tooltip>
        <el-popconfirm
          class="item"
          effect="dark"
          placement="top-start"
          title="确认删除吗？"
          cancel-button-text="取消"
          confirm-button-text="确定"
          @confirm="(ev) => handleDeleteNode(ev, data)"
        >
          <span slot="reference">
            <i
              v-if="!isRenameMode && isShowDelete(data)"
              class="icon-ml icon-delete"
            ></i>
          </span>
        </el-popconfirm>
        <el-tooltip
          class="item"
          effect="dark"
          content="移除后不参与计算"
          placement="top-start"
        >
          <span
            v-if="isShowRemove && isShowRemoveHandle(data)"
            @click="(ev) => remove(ev, data)"
            class="icon-ml red"
          > 移除 </span>
        </el-tooltip>
      </span>
    </div>
  </VueEasyTree>
</template>

<script>
import { EnumTypes, EnumRegionTagType } from '@/common/enum'
import { findListsWithType, sortTreeByTypeAndName, findParentByKey, findNodeListsWithType } from '@/utils/index'
// 引入VueEasyTree, 支持大量树数据虚拟滚动
import VueEasyTree from '@wchbrad/vue-easy-tree'

export default {
  name: 'CustomTree',
  components: {
    VueEasyTree
  },
  props: {
    lazy: {
      type: Boolean,
      default: false
    },
    load: {
      type: Function,
      default: null
    },
    treeData: {
      type: Array,
      default: () => []
    },
    draggable: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    isDelete: {
      type: Boolean,
      default: false
    },
    isFocus: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    treeProps: {
      type: Object,
      default: () => ({})
    },
    check: {
      type: Function,
      default: null
    },
    nodeClick: {
      type: Function,
      default: null
    },
    checkChange: {
      type: Function,
      default: null
    },
    deleteNode: {
      type: Function,
      default: null
    },
    focusNode: {
      type: Function,
      default: null
    },
    clearScene: {
      type: Function,
      default: null
    },
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    defaultExpandAll: {
      type: Boolean,
      default: true
    },
    computedGisCoordinate: {
      type: Function,
      default: null
    },
    isLimitRegion: {
      type: Boolean,
      default: false
    },
    isFocusRegion: {
      type: Boolean,
      default: false
    },
    isShowRegion: {
      // 定制--区域管理
      type: Boolean,
      default: false
    },
    isTwoPhases: {
      // 定制--两期对比
      type: Boolean,
      default: false
    },
    isShowRemove: {
      // 定制--两期对比, 是否显示移除
      type: Boolean,
      default: false
    },
    isRegionResult: {
      // 定制--区域结果
      type: Boolean,
      default: false
    }
  },
  computed: {
    types() {
      return EnumTypes
    },
    treePropsData() {
      return {
        ...this.defaultProps,
        ...this.treeProps
      }
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      tree: [],
      renderKey: 0,
      editNode: null,
      statusEnum: {
        1: '待处理',
        2: '计算中',
        3: '计算成功',
        4: '计算失败'
      },
      isRenameMode: false,
      originalLabel: ''
    }
  },
  watch: {
    treeData: {
      handler(val) {
        this.tree = val
      },
      immediate: true
    }
  },
  mounted() {
    setTimeout(() => {
      this.handleHideCheckbox()
    }, 100)
  },
  methods: {
    // 重命名
    rename(event, data) {
      this.isRenameMode = true
      event?.stopPropagation && event.stopPropagation()
      this.editNode = data
      this.originalLabel = data[this.treePropsData.label]
      this.$nextTick(() => {
        const input = this.$refs[`input${data.key}`]
        setTimeout(() => {
          if (input) {
            input.focus()
          }
        }, 300)
      })
    },
    // 编辑完成
    endRename(data) {
      this.isRenameMode = false
      const nameObj = {
        [EnumTypes.AREA]: '区域',
        [EnumTypes.CENTER_LINE]: '中心线',
        [EnumTypes.BASAL_DATA]: '基底分界线',
        [EnumTypes.ROCK_SOIL_BOUNDARY]: '土石分界线'
      }
      const label = data[this.treePropsData.label]
      if (!label) {
        this.$message.error(`${nameObj[data.type]}名称不能为空`)
        data[this.treePropsData.label] = this.originalLabel
        return
      }
      let labels = []
      if (data.type === EnumTypes.AREA || data.type === EnumTypes.CENTER_LINE) {
        labels = findListsWithType(this.tree, data.type, this.treePropsData.label)
      } else {
        const template = this.tree.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
        const parent = findParentByKey(template, data.key)
        labels = parent?.children?.map((item) => item[this.treePropsData.label]) || []
      }
      // 判断是否重复 个数大于1
      if (labels.length > 1 && labels.filter((item) => item?.toUpperCase() === label?.toUpperCase()).length > 1) {
        this.$message.error(`${nameObj[data.type]}名称不能重复`)
        data[this.treePropsData.label] = this.originalLabel
        return
      }
      this.editNode = null
    },
    onBlurHandler(data) {
      setTimeout(() => {
        this.endRename(data)
      }, 200)
    },
    confirmEdit(data) {
      this.endRename(data)
    },
    cancelEdit(data) {
      this.isRenameMode = false
      data[this.treePropsData.label] = this.originalLabel
      this.editNode = null
    },
    // 删除
    handleDeleteNode(event, node) {
      // 执行删除逻辑
      this.$refs.treeRef?.remove(node)
      if (this.deleteNode) {
        return this.deleteNode(node)
      }
      // 断面 、 桩号
      if (node.type === EnumTypes.SECTION_DATA || node.type === EnumTypes.PILE_NUMBER) {
        if (node.children) {
          window.bimInstance?.hideStalePoint(node.children)
        } else {
          window.bimInstance?.hideStalePoint([node])
        }
      }
      // 区域
      if (node.type === EnumTypes.AREA) {
        const sectionData = node.children.find((item) => item.type === EnumTypes.SECTION_DATA)
        const rockSoilData = node.children.find((item) => item.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
        if (sectionData) {
          window.bimInstance?.hideStalePoint(sectionData.children)
        }
        if (rockSoilData) {
          rockSoilData.children.forEach((item) => {
            this.$emit('removeRockSoilBoundary', item)
          })
        }
      }
      // 土石分界
      if (node.type === EnumTypes.ROCK_SOIL_BOUNDARY) {
        this.$emit('removeRockSoilBoundary', node)
      }
    },
    // 点击聚焦
    onFocusNode(event, node, opts = null, checked = true) {
      this.clearScene && this.clearScene()
      this.handleFocusNode(event, node, opts, checked)
    },
    // 聚焦处理
    handleFocusNode(event, node, opts = null, checked = true) {
      event?.stopPropagation && event.stopPropagation()
      // console.log('handleFocusNode', checked)
      if (!checked) {
        node.checked = true
        this.handleCheck(node)
      }
      if (node.children?.length) {
        this.setChecked(node.key, true, true)
      } else {
        this.setChecked(node.key, true)
      }
      this.setCurrentKey(node.key)
      if (this.focusNode) {
        return this.focusNode(node)
      }
      if (node.type === EnumTypes.SECTION_DATA || node.type === EnumTypes.RESULT_REGION) {
        // 区域
        this.handleFocusArea(node)
      } else if (node.type === EnumTypes.PILE_NUMBER || node.type === EnumTypes.RESULT_STAKE) {
        // 栈号
        this.handleFocusPile(node, opts)
      } else if (node.type === EnumTypes.CENTER_LINE) {
        // 中心线
        this.handleFocusCenterLine(node)
      } else if (node.type === EnumTypes.DRAWING || node.type === EnumTypes.TERRAIN_MODEL || node.type === EnumTypes.MODEL) {
        // 图纸、地形、模型
        if (node.type === EnumTypes.TERRAIN_MODEL && this.isTwoPhases) {
          this.$emit('focusTerrainModel', node)
          return
        }
        window.bimInstance?.focusToLayer(node.layerId || node?.resource?.layerId)
      } else if (node.type === EnumTypes.ROCK_SOIL_BOUNDARY) {
        // 土石分界
        this.$emit('focusRockSoilBoundary', node)
        this.handleRockSoilBoundaryCheck(node)
      } else if (node.type === EnumTypes.AREA && this.isFocusRegion) {
        // 兼容区域管理，区域聚焦
        this.$emit('focusRegion', node)
      }
    },
    // 聚焦区域
    handleFocusArea(node) {
      const mid = Math.floor(node.children.length / 2)
      const middle = node.children[mid]
      if (!middle?.resource?.gisCoordinate) return
      const cameraStatus = this.computedCameraStatus(middle)
      window.bimInstance?.focusStalePoint(node.children)
      window.bimInstance?.setCameraStatus(cameraStatus)
    },
    // 聚焦桩号
    async handleFocusPile(node, opts = null) {
      if (!node?.resource?.gisCoordinate) return
      if (this.computedGisCoordinate) {
        const newGisCoordinate = await this.computedGisCoordinate(node)
        node.resource.gisCoordinateNew = newGisCoordinate
      }
      const cameraStatus = this.computedCameraStatus(node, 500)
      window.bimInstance?.focusStalePoint([node])
      window.bimInstance?.setCameraStatus(opts || cameraStatus)
    },
    // 聚焦中心线
    handleFocusCenterLine(node) {
      if (!node?.resource?.gisCoordinate) return
      const roadLineArr = JSON.parse(node.resource.gisCoordinate)
      const poi = roadLineArr?.map((item) => {
        return { lon: item[0], lat: item[1], alt: item[2] + 2000 }
      })
      // 取中心点
      const mid = Math.floor(roadLineArr.length / 2)
      const middle = poi[mid]
      const cameraStatus = {
        position: middle,
        orientation: {
          pitch: -Math.PI / 2,
          yaw: 0,
          roll: 0
        }
      }
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
    // 设置选中
    setCurrentKey(key) {
      this.$refs.treeRef.setCurrentKey(key)
    },
    // 批量勾选
    setCheckedKeys(keys) {
      this.$refs.treeRef.setCheckedKeys(keys)
    },
    // 获取勾选节点
    getCheckedKeys() {
      return this.$refs.treeRef.getCheckedKeys()
    },
    // 设置选中
    setChecked(...args) {
      this.$refs.treeRef.setChecked(...args)
    },
    // 选择变化
    handleCheckChange(node, isChecked, isIndeterminate) {
      if (this.checkChange) {
        return this.checkChange(node, isChecked, isIndeterminate)
      }
      node.checked = isChecked
    },
    // 节点点击
    handleNodeClick(data) {
      if (this.nodeClick) {
        return this.nodeClick(data)
      }
    },
    // 节点选择-处理显隐
    handleCheck(node) {
      if (this.check) {
        this.check(node)
      }
      if (node.type === EnumTypes.SECTION_DATA || node.type === EnumTypes.PILE_NUMBER || node.type === EnumTypes.RESULT_STAKE) {
        // 断面 || 栈号
        this.handlePointCheck(node)
        this.$emit('handleCheckCallBack', node)
      } else if (node.type === EnumTypes.AREA) {
        // 区域
        this.handleAreaCheck(node)
        this.$emit('handleCheckCallBack', node)
      } else if (node.type === EnumTypes.RESULT_REGION) {
        // 兼容对比区域
        this.handleResultCheck(node)
      } else if (
        node.type === EnumTypes.DESIGN_LAYER ||
        node.type === EnumTypes.BASE_MAP_LAYER ||
        node.type === EnumTypes.DRAWING ||
        node.type === EnumTypes.TERRAIN_MODEL ||
        node.type === EnumTypes.MODEL
      ) {
        // 设计层 || 底图 || 图纸 || 地形模型 || 模型
        if (node.type === EnumTypes.TERRAIN_MODEL && this.isTwoPhases) {
          this.$emit('handleCheckCallBack', node)
          return
        }
        if (node.type === EnumTypes.BASE_MAP_LAYER && this.isTwoPhases) {
          node?.children?.forEach((item) => {
            this.$emit('handleCheckCallBack', item)
          })
          return
        }
        this.handleLayerCheck(node)
      } else if (node.type === EnumTypes.CENTER_LINE) {
        // 中心线
        this.handleCenterLineCheck(node)
      } else if (node.type === EnumTypes.RECEIPT_TEMPLATE || node.type === EnumTypes.RESULT) {
        // 收款模板 收方成果
        this.handleAllCheck(node)
      } else if (node.type === EnumTypes.REGION_LAYER) {
        // 区域图层
        node.children?.forEach((item) => {
          item.checked = node.checked
          this.$emit('handleCheckCallBack', item)
        })
      } else if (node.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP || node.type === EnumTypes.ROCK_SOIL_BOUNDARY) {
        // 土石分界分组
        this.handleRockSoilBoundaryCheck(node)
      }
    },
    handleAllCheck(node) {
      const checked = node.checked
      this.handleCheckedNode(node?.children || [], checked)
    },
    // 处理对比结果
    handleResultCheck(node) {
      if (node.checked) {
        window.bimInstance?.showStalePoint(node.children || [])
      } else {
        window.bimInstance?.hideStalePoint(node.children || [])
      }
    },
    // 处理土石分界勾选
    handleRockSoilBoundaryCheck(node) {
      const checked = node.checked
      node.children?.forEach((item) => {
        item.checked = checked
      })
      this.$emit('handleCheckCallBack', node)
    },
    // 处理区域勾选
    handleAreaCheck(node) {
      const checked = node.checked
      this.handleCheckedNode(node?.children || [], checked)
    },
    // 递归处理选中
    handleCheckedNode(list, checked) {
      list.forEach((item) => {
        item.checked = checked
        if (item.type === EnumTypes.CENTER_LINE) {
          this.handleCenterLineCheck(item)
        }
        if (item.type === EnumTypes.SECTION_DATA) {
          this.handlePointCheck(item)
        }
        if (item.type === EnumTypes.RESULT_REGION) {
          this.handleResultCheck(item)
        }
        if (item.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP || item.type === EnumTypes.ROCK_SOIL_BOUNDARY) {
          // 土石分界分组
          this.handleRockSoilBoundaryCheck(item)
        }
        if (item?.children) {
          this.handleCheckedNode(item.children, checked)
        }
      })
    },
    // 区域、桩号显隐
    handlePointCheck(node) {
      node.children?.forEach((item) => {
        item.checked = node.checked
      })
      const nodes = node.type === EnumTypes.SECTION_DATA ? node.children : [node]
      if (node.checked) {
        window.bimInstance?.showStalePoint(nodes)
      } else {
        window.bimInstance?.hideStalePoint(nodes)
      }
    },
    // 图层显隐
    handleLayerCheck(node) {
      node?.children?.forEach((item) => {
        item.checked = node.checked
      })
      // 地形需要特殊处理,两期对比重复地形问题
      if (node.type === EnumTypes.TERRAIN_MODEL) {
        const layers = findNodeListsWithType(this.tree, EnumTypes.TERRAIN_MODEL).filter((item) => item.resource.repeated !== true)
        const curLayers = layers.filter((item) => node.resource?.layerId === item?.resource?.layerId)
        if (curLayers.length > 0) {
          const checked = curLayers.map((item) => item.checked).includes(true)
          if (checked) {
            window.bimInstance?.showLayerById(node.resource.layerId)
            this.handleDrawingClampMode()
          } else {
            window.bimInstance?.hideLayerById(node.resource.layerId)
          }
        }
        return
      }
      const nodes = node?.children?.length ? node.children.filter((item) => item.resource.repeated !== true) : [node]
      nodes?.forEach((item) => {
        if (node.checked) {
          window.bimInstance?.showLayerById(item?.layerId || item?.resource?.layerId)
        } else {
          window.bimInstance?.hideLayerById(item?.layerId || item?.resource?.layerId)
        }
      })
      const models = findNodeListsWithType(this.tree, EnumTypes.TERRAIN_MODEL).filter((item) => item.checked === true)
      if (models.length > 0) {
        this.handleDrawingClampMode()
      }
    },
    // 查找图纸，批量设置贴地
    handleDrawingClampMode() {
      // 处理图纸贴地问题
      const drawings = findNodeListsWithType(this.tree, EnumTypes.DRAWING).filter((item) => item.checked === true)
      if (drawings.length > 0) {
        drawings.forEach((item) => {
          const curLayer = window.bimInstance?.getLayerById(item.resource.layerId)
          curLayer?.clampMode({ mode: 'Model' })
        })
      }
    },
    // 中心线显隐
    handleCenterLineCheck(node) {
      if (node.checked) {
        if (node.children) {
          node.children?.forEach((item) => {
            item.checked = node.checked
          })
          const names = node.children.map((item) => `道路中心线-${item.name}`)
          window.bimInstance?.showExtByName(names)
        } else {
          const names = [`道路中心线-${node.name}`]
          window.bimInstance?.showExtByName(names)
        }
      } else {
        if (node.children) {
          node.children?.forEach((item) => {
            item.checked = node.checked
          })
          const names = node.children.map((item) => `道路中心线-${item.name}`)
          window.bimInstance?.hideExtByName(names)
        } else {
          const names = [`道路中心线-${node.name}`]
          window.bimInstance?.hideExtByName(names)
        }
      }
    },
    // 拖拽限制
    allowDrag(node) {
      return node.data.type === EnumTypes.PILE_NUMBER
    },
    // 拖拽限制放入逻辑
    allowDrop(draggingNode, dropNode, type) {
      return (
        (dropNode.data.type === EnumTypes.SECTION_DATA && type === 'inner') ||
        (dropNode.data.type === EnumTypes.PILE_NUMBER && (type === 'prev' || type === 'next'))
      )
    },
    // 拖拽节点移动
    handleDragOver(draggingNode, dropNode, event) {
      // const firstKey = this.tree[0]?.key
      event.stopPropagation()
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      // this.scrollToItem(dropNode.data.key)
      // this.scrollToItem(firstKey)
      // 拖拽有问题，托起得元素，拉到顶部会被删除，即使放下也是错误数据
    },
    // 拖拽节点移动
    // handleDragOver: throttle(function (draggingNode, dropNode, event) {
    //   event.stopPropagation()
    //   event.preventDefault()
    //   event.dataTransfer.dropEffect = 'move'
    //   console.log(dropNode.data.name, dropNode.data.key)
    //   this.scrollToItem(dropNode.data.key)
    // }, 300),
    // 开始
    handleDragStart(node, event) {
      // const key = this.tree[0]?.key
      // this.scrollToItem(key)
      // this.historyExpandKeys = cloneDeep(this.defaultExpandedKeys)
      // this.$emit('update:setExpandedKeys', [key])
      // this.renderKey++
    },
    // 拖拽节点结束
    handleDragEnd(node, target, position, event) {
      if (position !== 'node') {
        // console.log(this.tree)
        sortTreeByTypeAndName(this.tree, EnumTypes.SECTION_DATA)
        this.renderKey++
      }
      const allKey = this.$refs.treeRef?.getCheckedKeys()
      // this.$emit('update:setExpandedKeys', this.historyExpandKeys)
      setTimeout(() => {
        this.$refs.treeRef?.setCheckedKeys(allKey)
      })
    },
    // 收起
    handleCollapse(data, node) {
      this.$emit('onCollapse', data)
    },
    // 展开
    handleExpand(data, node) {
      this.$emit('onExpand', data, node)
    },
    // 滚动
    scrollToItem(key) {
      this.$refs.treeRef?.scrollToItem(key)
    },
    // 查询计算结果
    handleQueryResult(data) {
      this.$emit('onQueryResult', data)
    },
    // 带操作容器类型节点加类名
    classIconNode(data) {
      return this.isShowFocus(data) || this.isShowEdit(data) || this.isShowDelete(data)
    },
    classTagNode(data) {
      return data?.resource?.repeated === true || this.isShowStatus(data) > 0
    },
    labelStyle(data) {
      let maxWidth = '100px' // 默认值
      switch (data.type) {
        case EnumTypes.DRAWING:
          maxWidth = '145px'
          break
        case EnumTypes.BASE_MAP_LAYER:
          maxWidth = '145px'
          break
        case EnumTypes.ANNOTATION_LAYER:
          maxWidth = '145px'
          break
        case EnumTypes.PILE_NUMBER:
          maxWidth = '80px'
          break
        case EnumTypes.CENTER_LINE:
          maxWidth = '108px'
          break
        case EnumTypes.RESULT_REGION:
          maxWidth = '80px'
          break
        case EnumTypes.ROCK_SOIL_BOUNDARY:
          maxWidth = '60px'
          break
        case EnumTypes.TERRAIN_MODEL:
          // 兼容断面对比
          maxWidth = data.resource?.tag || (this.isShowRemove && data.resource?.repeated) ? '60px' : '100px'
          break
      }
      return {
        maxWidth: maxWidth
      }
    },
    // 是否显示区域tag
    isShowRegionTag(data) {
      const tags = [
        EnumRegionTagType.DIG_AREA,
        EnumRegionTagType.FILL_AREA,
        EnumRegionTagType.BORROW_AREA,
        EnumRegionTagType.DUMP_AREA,
        EnumRegionTagType.TRANSFER_AREA
      ]
      return data.resource?.extend?.regionType && tags.includes(data.resource?.extend?.regionType) && this.isShowRegion
    },
    // 是否显示删除
    // 显示聚焦
    isShowFocus(data) {
      return (
        (data.type === EnumTypes.PILE_NUMBER ||
          (data.type === EnumTypes.SECTION_DATA && data.children?.length > 0) ||
          (data.type === EnumTypes.CENTER_LINE && !data.children) ||
          (data.type === EnumTypes.AREA && this.isFocusRegion && (data.children?.length > 0 || (data.parentId === 0 && !data.children))) ||
          data.type === EnumTypes.DRAWING ||
          data.type === EnumTypes.TERRAIN_MODEL ||
          data.type === EnumTypes.ROCK_SOIL_BOUNDARY ||
          data.type === EnumTypes.MODEL) &&
        (this.isTwoPhases || data?.resource?.repeated !== true) &&
        this.isFocus
      )
    },
    // 显示编辑
    isShowEdit(data) {
      return (
        ((data.type === EnumTypes.AREA && !this.isLimitRegion) ||
          (data.type === EnumTypes.CENTER_LINE && !data.children) ||
          (data.type === EnumTypes.BASAL_DATA && !data.children) ||
          (data.type === EnumTypes.ROCK_SOIL_BOUNDARY && !data.children)) &&
        this.isEdit
      )
    },
    // 显示删除
    isShowDelete(data) {
      return (
        (data.type === EnumTypes.PILE_NUMBER ||
          data.type === EnumTypes.SECTION_DATA ||
          (data.type === EnumTypes.AREA && !this.isLimitRegion) ||
          (data.type === EnumTypes.CENTER_LINE && !data.children) ||
          (data.type === EnumTypes.BASAL_DATA && !data.children) ||
          data.type === EnumTypes.ROCK_SOIL_BOUNDARY) &&
        this.isDelete
      )
    },
    // 显示计算状态
    isShowStatus(data) {
      if (this.loading && data.type === EnumTypes.RESULT_REGION && data?.resource?.status === 1) return 1
      if (this.loading && data.type === EnumTypes.RESULT_REGION && data?.resource?.status === 2) return 2
      if (data.type === EnumTypes.RESULT_REGION && data?.resource?.status === 3 && (!data.children || data.children.length === 0)) return 3
      if (data.type === EnumTypes.RESULT_REGION && data?.resource?.status === 4) return 4
      return 0
    },
    isShowRemoveHandle(data) {
      return (data.type === EnumTypes.TERRAIN_MODEL || (data.type === EnumTypes.AREA && data.parentId === 0)) && this.isShowRemove
    },
    classHideCheckbox(data) {
      const tags = [EnumTypes.AREA]
      return tags.includes(data.type) && this.isShowRegion && (this.isRegionResult ? !data?.parentArea : data.parentId !== 0)
    },
    handleHideCheckbox() {
      // 获取所有具有 .custom-tree-node.is-hide-checkbox 类的元素
      const hideCheckboxElements = document.querySelectorAll('.is-hide-checkbox')
      // 遍历这些元素
      hideCheckboxElements.forEach(function (element) {
        // 获取当前元素之前的所有兄弟元素
        const previousSiblings = Array.from(element.parentNode.children)
        // 找到当前元素在兄弟元素中的索引
        const index = previousSiblings.indexOf(element)

        // 遍历当前元素之前的所有兄弟元素
        for (let i = 0; i < index; i++) {
          // 检查兄弟元素是否具有 .el-checkbox 类
          if (previousSiblings[i].classList.contains('el-checkbox')) {
            // 隐藏该元素
            previousSiblings[i].style.display = 'none'
          }
        }
      })
    },
    // 两期对比-移除
    remove(e, node) {
      e.stopPropagation()
      this.$refs.treeRef?.remove(node)
      this.$emit('removeHandle', node)
    }
  }
}
</script>

<style lang="scss" scoped>
  // @import "@wchbrad/vue-easy-tree/src/assets/index.scss";
  .custom-tree {
    height: 100%;
    width: 100%;
    @keyframes rotateAnimation {
      from {
        transform: rotate(0deg); /* 动画开始时，元素旋转0度 */
      }
      to {
        transform: rotate(360deg); /* 动画结束时，元素旋转360度 */
      }
    }
    .icon {
      margin-right: 8px;
    }
    .icon-ml {
      margin-left: 8px;
    }
    .label-wrap {
      // display: flex;
      // align-items: center;
      vertical-align: middle;

      .inner-input {
        border: 1px solid #1677ff;
        border-radius: 5px;
        width: 168px;
      }
    }
    .label {
      display: inline-block;
      vertical-align: middle;
      // text-align: justify;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 4px;
    }
    .status-wrap {
      margin-left: 10px;
      padding-top: 2px;
      .tip {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
      }
      .fail {
        color: #e84749;
      }
    }
    .loading-wrap {
      display: inline-block;
      width: 14px;
      height: 14px;
      background: url("~@/assets/images/icon-loading.png") no-repeat center;
      background-size: 100%;
      margin-right: 5px;
      animation: rotateAnimation 2s linear infinite;
    }
    .el-icon-time {
      margin-right: 5px;
    }
    .repeat-wrap {
      display: inline-block;
      font-size: 12px;
      color: #e84749;
      width: 40px;
      height: 22px;
      margin-left: 10px;
      line-height: 22px;
      text-align: center;
      border-radius: 4px;
      opacity: 1;
      background: #2a1215;
      vertical-align: middle;
      &.tow-phase {
        margin-left: 0;
        margin-right: 5px;
      }
    }
    .terrain-wrap10 {
      display: inline-block;
      font-size: 12px;
      color: #3c89e8;
      width: 40px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      margin-right: 5px;
      border: 1px solid #15325b;
      border-radius: 4px;
      opacity: 1;
      background: #111a2c;
      vertical-align: middle;
    }
    .terrain-wrap11 {
      display: inline-block;
      font-size: 12px;
      color: #6abe39;
      width: 40px;
      height: 22px;
      line-height: 22px;
      margin-right: 5px;
      text-align: center;
      border: 1px solid #274916;
      border-radius: 4px;
      opacity: 1;
      background: #162312;
      vertical-align: middle;
    }
    .terrain-wrap20 {
      display: inline-block;
      width: 16px;
      height: 16px;
      line-height: 16px;
      margin-right: 5px;
      text-align: center;
      // border-radius: 6px;
      opacity: 1;
      vertical-align: middle;
      background: url("~@/assets/images/icon-warning.png") no-repeat center center;
      background-size: 100%;
    }
    .region-tag {
      display: inline-block;
      width: 4px;
      height: 30px;
      vertical-align: middle;
      position: absolute;
      left: 0;
      top: 0;
    }
    .red {
      color: #e84749;
      vertical-align: middle;
    }
    .region-tag-1 {
      background: #f3af56;
    }
    .region-tag-2 {
      background: #77fbfd;
    }
    .region-tag-3 {
      background: #cf4df3;
    }
    .region-tag-4 {
      background: #5688f7;
    }
    .region-tag-5 {
      background: #c2ef4e;
    }
    .custom-tree-node.icon-node,
    .custom-tree-node.tag-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }

    .custom-tree-node.is-disabled {
      cursor: not-allowed;
    }
    .custom-tree-node.icon-node:hover {
      .btn-group {
        display: inline-block;
        text-align: right;
      }
    }
    .btn-group {
      display: none;
    }
    .el-icon-check,
    .el-icon-close {
      margin-right: 4px;
    }
  }

  ::v-deep {
    div.el-input.el-input--suffix .el-input__inner {
      padding-right: 42px;
    }
    .el-tree-node {
      position: relative;
    }
  }
</style>
<style lang="scss">
  .el-popconfirm__action {
    flex-direction: row;
  }
</style>
