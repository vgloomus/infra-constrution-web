<!--
 * @author: lvzj
 * @Date: 2024-06-24 16:08:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-17 10:52:56
 * @description: 新建两期对比
-->
<template>
  <el-dialog
    :title="$t('twoPhases.addData')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :fullscreen="true"
    width="80%"
    top="5vh"
    @close="close"
  >
    <div
      class="content"
      id="add-two-phases-dialog"
    >
      <DualScreen
        :left="leftWidth"
        :right="rightWidth"
      >
        <template #left>
          <SceneComponent
            :showFooter="false"
            type="iframe"
            id="before-scene-wrapper"
            :showHeader="false"
            :showRightMenu="false"
            :isShowLeftTitle="false"
            :showLeftMenu="true"
            :options="sceneOptionsLeft"
            bimInstanceName="beforeBimInstance"
            ref="sceneLeftRef"
            @collapseChange="(val) => collapseChange('left', val)"
          >
            <template slot="left">
              <div
                element-loading-background="rgba(0, 0, 0, 0.8)"
                class="left-content"
              >
                <div class="top">
                  <div class="search">
                    <span class="tag">1</span>
                    <el-date-picker
                      v-model="beforeRangeTime"
                      type="daterange"
                      class="dark"
                      :disabled="loading"
                      range-separator="-"
                      :start-placeholder="$t('startDate')"
                      :end-placeholder="$t('endDate')"
                      value-format="yyyy-MM-dd"
                      :picker-options="pickerOptions"
                      unlink-panels
                      @change="(val) => handleDateChange('before', val)"
                    />
                  </div>
                  <div
                    class="wrap"
                    v-loading="beforeLoading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                  >
                    <RemovePopover
                      class="remove-btn"
                      :list="beforeRemoveList"
                      @restoreHandle="(ids) => restoreHandle('before', ids)"
                      v-show="beforeTree.length > 0"
                    />
                    <CustomTree
                      v-if="beforeTree.length > 0"
                      ref="beforeTreeRef"
                      :isFocus="true"
                      :isTwoPhases="true"
                      :treeData="beforeTree"
                      :treeProps="treeProps"
                      :isShowRemove="true"
                      @handleCheckCallBack="(node) => handleCheckCallBack('before', node)"
                      @focusTerrainModel="(node) => focusTerrainModel('before', node)"
                      @removeHandle="(node) => removeHandle('before', node)"
                    />
                    <no-content
                      v-else
                      :text="$t('noData')"
                    />
                  </div>
                </div>
                <div class="bottom">
                  <div class="search">
                    <span class="tag">2</span>
                    <el-date-picker
                      v-model="afterRangeTime"
                      :disabled="loading"
                      type="daterange"
                      class="dark"
                      range-separator="-"
                      :start-placeholder="$t('startDate')"
                      :end-placeholder="$t('endDate')"
                      value-format="yyyy-MM-dd"
                      :picker-options="pickerOptions"
                      unlink-panels
                      @change="(val) => handleDateChange('after', val)"
                    />
                  </div>
                  <div
                    v-loading="afterLoading"
                    element-loading-background="rgba(0, 0, 0, 0.8)"
                    class="wrap"
                  >
                    <RemovePopover
                      class="remove-btn"
                      :list="afterRemoveList"
                      @restoreHandle="(ids) => restoreHandle('after', ids)"
                      v-show="afterTree.length > 0"
                    />
                    <CustomTree
                      v-if="afterTree.length > 0"
                      ref="afterTreeRef"
                      :isFocus="true"
                      :isTwoPhases="true"
                      :isShowRemove="true"
                      :treeData="afterTree"
                      :treeProps="treeProps"
                      @handleCheckCallBack="(node) => handleCheckCallBack('after', node)"
                      @focusTerrainModel="(node) => focusTerrainModel('after', node)"
                      @removeHandle="(node) => removeHandle('after', node)"
                    />
                    <no-content
                      v-else
                      :text="$t('noData')"
                    />
                  </div>
                </div>
              </div>
            </template>
          </SceneComponent>
        </template>
        <template #right>
          <SceneComponent
            :showFooter="false"
            type="iframe"
            id="after-scene-wrapper"
            :showRightMenu="true"
            :showLeftMenu="false"
            :showHeader="false"
            :options="sceneOptionsRight"
            ref="sceneRightRef"
            bimInstanceName="afterBimInstance"
            @update-toolbar-position="updateToolbarPosition"
            @collapseChange="(val) => collapseChange('right', val)"
          >
            <template slot="right">
              <div
                class="right-content"
                v-loading="regionLoading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
              >
                <div class="title">
                  {{ $t('twoPhases.calculationRegion') }}
                  <RemovePopover
                    :list="regionRemoveList"
                    @restoreHandle="(ids) => restoreHandle('region', ids)"
                    class="remove-region-btn"
                  />
                </div>
                <div class="wrap">
                  <CustomTree
                    v-if="regionTree.length > 0"
                    ref="regionTreeRef"
                    :isFocus="true"
                    :isFocusRegion="true"
                    :treeData="regionTree"
                    :isShowRegion="true"
                    :isShowRemove="true"
                    :treeProps="treeProps"
                    @focusRegion="handleFocusRegion"
                    @handleCheckCallBack="handleRegionCheckCallBack"
                    @removeHandle="(node) => removeHandle('region', node)"
                  />
                  <no-content
                    v-else
                    :text="$t('noData')"
                  />
                </div>
              </div>
            </template>
          </SceneComponent>
        </template>
      </DualScreen>
      <Legends
        class="legends"
        :style="{ right: toolbarRightPosition + 50 + 'px' }"
      ></Legends>
    </div>
    <span slot="footer">
      <div class="footer-btn">
        <el-button
          type="primary"
          :loading="saveLoading"
          :disabled="saveDisabled"
          @click="save"
        >{{ $t('confirm') }}</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { cloneDeep } from 'lodash'
import moment from 'moment'
import { EnumTypes } from '@/common/enum'
import { getTagDate, getRegionList, getRangeLine, getTerrainLine, addPeriodsComparison, uploadComparisonThumbnail } from '@/api/business'
import { addTemporaryScenes, restoreTemporaryScenes } from '@/api/common'
import { addRandomKeys, getAllKeys, createSnapshot } from '@/utils/index'
import DualScreen from '@/components/DualScreen.vue'
import SceneComponent from '@/components/scene/index.vue'
import CustomTree from '@/components/CustomTree.vue'
import Legends from '@/views/projectSetting/components/Legends.vue'
import RemovePopover from './RemovePopover.vue'
const drawKey = 'boundary_mesh_'
export default {
  name: 'AddTwoPhasesDialog',
  components: { DualScreen, SceneComponent, CustomTree, Legends, RemovePopover },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      saveLoading: false,
      sceneOptionsLeft: {},
      sceneOptionsRight: {},
      beforeRangeTime: null,
      afterRangeTime: null,
      callbackCount: 0,
      lines: [],
      sceneId: '',
      leftWidth: 300,
      rightWidth: 300,
      toolbarRightPosition: 342,
      treeProps: {
        children: 'children',
        label: 'name'
      },
      regionTree: [],
      afterTree: [],
      beforeTree: [],
      beforeLineData: [],
      afterLineData: [],
      afterLoading: false,
      beforeLoading: false,
      regionLoading: false,
      beforeRemoveList: [],
      afterRemoveList: [],
      regionRemoveList: [],
      beforeFocusId: null, // 左侧选中节点
      afterFocusId: null, // 右侧选中节点
      regionFocusId: null, // 区域选中节点
      pickerOptions: {
        disabledDate(time) {
          const today = new Date()
          const oneYearAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365 * 2)
          // 禁用365天之前的日期和今天之后的日期
          return time.getTime() < oneYearAgo.getTime() || time.getTime() > today.getTime()
        },
        cellClassName: (time) => {
          const month = time.getMonth() + 1
          const day = time.getDate()
          const val = time.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
          return this.specialDates.includes(val) ? 'underline' : ''
        }
      },
      specialDates: []
    }
  },
  computed: {
    ...mapState(['projectId']),
    dialogVisible: {
      get() {
        return this.visible
      },
      set() {
        this.$emit('update:visible', false)
      }
    },
    saveDisabled() {
      return (
        this.beforeRangeTime === null ||
        this.afterRangeTime === null ||
        this.beforeTree.length === 0 ||
        this.beforeTree?.[0]?.children?.length === 0 ||
        this.afterTree.length === 0 ||
        this.afterTree?.[0]?.children?.length === 0 ||
        this.regionTree.length === 0 ||
        this.regionTree?.[0]?.children?.length === 0
      )
    }
  },
  beforeDestroy() { },
  mounted() {
    this.loading = true
    this.init()
    this.queryAvailableDate()
  },
  methods: {
    async init() {
      this.regionLoading = true
      Promise.all([this.addScene(), this.initRegionalTree(), this.getRangeLine()])
        .then(([sceneRes, receiptRes, rangeRes]) => {
          this.sceneId = sceneRes.sceneId
          // const drawing = receiptRes?.find((item) => item.type === EnumTypes.DESIGN_LAYER)
          const region = receiptRes?.find((item) => item.type === EnumTypes.REGION_LAYER)
          const regionIds = region?.children?.map((item) => item.id)
          const lines = rangeRes || []
          // 用区域过滤范围线
          this.lines = lines.filter((item) => regionIds.includes(item.regionId))
          const tree = []
          if (region) {
            tree.push(region)
          }
          // if (drawing) {
          //   tree.push(drawing)
          // }
          this.regionTree = addRandomKeys(tree)
          const allKey = getAllKeys(this.regionTree, 'key')
          this.$nextTick(() => {
            this.$refs.regionTreeRef?.setCheckedKeys(allKey)
          })
          this.callbackCount = 0
          this.sceneOptionsLeft = {
            sceneViewToken: sceneRes.viewToken,
            sceneAddedCallback: this.sceneAddedCallback
          }
          this.sceneOptionsRight = {
            sceneViewToken: sceneRes.viewToken,
            sceneAddedCallback: this.sceneAddedCallback
          }
        })
        .finally(() => {
          this.regionLoading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 获取场景
    addScene(resources = []) {
      const params = {
        projectId: this.projectId,
        type: 7,
        resources
      }
      return addTemporaryScenes(params).then((res) => {
        return res.data
      })
    },
    // 清理临时场景
    clearScene() {
      if (!this.sceneId) return
      const params = {
        sceneId: this.sceneId,
        bizId: '',
        type: 7
      }
      restoreTemporaryScenes(this.projectId, params)
    },
    // 获取区域树
    initRegionalTree() {
      return getRegionList(this.projectId).then((res) => {
        return res
      })
    },
    // 查询可用日期
    queryAvailableDate() {
      getTagDate(this.projectId).then((data) => {
        this.specialDates = data || []
      })
    },
    // 查询地形线
    queryTerrainLine(params) {
      return getTerrainLine(this.projectId, params).then((res) => {
        return res
      })
    },
    // 查询范围线
    getRangeLine() {
      return getRangeLine(this.projectId).then((res) => {
        return res
      })
    },
    close() {
      this.clearScene()
    },
    clearTreeId(tree) {
      const newTree = cloneDeep(tree)
      newTree[0]?.children?.forEach((item) => {
        item.id = null
      })
      return newTree
    },
    // 保存
    save() {
      if (!this.regionTree?.[0]?.children?.length) return this.$message.error('无区域数据，不能保存')
      if (!this.beforeTree?.[0]?.children?.length) return this.$message.error('无前期地形数据，不能保存')
      if (!this.afterTree?.[0]?.children?.length) return this.$message.error('无后期地形数据，不能保存')

      const name = this.beforeRangeTime.join('~') + ' 与 ' + this.afterRangeTime.join('~') + '两期对比' + new Date().valueOf()
      const beforeTree = this.clearTreeId(this.beforeTree)
      const afterTree = this.clearTreeId(this.afterTree)
      const params = {
        name,
        preCollectStartDate: moment(this.beforeRangeTime[0]).valueOf(),
        preCollectEndDate: moment(this.beforeRangeTime[1]).valueOf() + 24 * 60 * 60 * 1000 - 1,
        preTerrain: beforeTree[0],
        postCollectStartDate: moment(this.afterRangeTime[0]).valueOf(),
        postCollectEndDate: moment(this.afterRangeTime[1]).valueOf() + 24 * 60 * 60 * 1000 - 1,
        postTerrain: afterTree[0],
        region: this.regionTree[0],
        version: 0,
        homeView: null
      }
      const dates = [...this.beforeRangeTime, ...this.afterRangeTime].sort((a, b) => new Date(a) - new Date(b))
      this.saveLoading = true
      addPeriodsComparison(this.projectId, params)
        .then((res) => {
          this.$refs.sceneLeftRef?.closeAside('left')
          this.$refs.sceneRightRef?.closeAside('right')
          const id = res.data.id
          const sceneId = res.data.sceneId
          this.$nextTick(async () => {
            const file = await createSnapshot('add-two-phases-dialog')
            const formData = new FormData()
            formData.append('file', file)
            uploadComparisonThumbnail(this.projectId, id, formData)
            this.$router.push({
              path: '/business/twoPhasesComparisonEdit',
              query: {
                type: 'edit',
                id,
                name,
                sceneId,
                gatherDate: `${dates[0]}-${dates[3]}`
              }
            })
            this.saveLoading = false
          })
        })
        .catch(() => {
          this.saveLoading = false
        })
    },
    collapseChange(type, info) {
      this[`${type}Width`] = info[type]
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
    // 场景加载完成回调
    sceneAddedCallback() {
      this.callbackCount++
      if (this.callbackCount === 2) {
        this.callbackCount = 0
        this.loading = false
        const regionDrawData = this.mappingData(this.lines)
        this.$refs.sceneRightRef?.sendEvent('drawBoundaryPlanes', regionDrawData)
        this.$refs.sceneLeftRef?.sendEvent('drawBoundaryPlanes', regionDrawData)
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
        this.$refs.sceneRightRef?.sendEvent('setCameraStatus', cameraStatus)
        this.$refs.sceneLeftRef?.sendEvent('setCameraStatus', cameraStatus)
      }
    },
    // tree结构增加 id 前端使用
    addIdForTree(tree) {
      if (tree.children && tree.children.length) {
        tree.children.forEach((item) => {
          item.id = `${item.resource.imageId}_${item.resource.terrainId}`
        })
      }
      return tree
    },
    // 日期选择
    handleDateChange(type, val) {
      if (!val) {
        const ids = this[`${type}LineData`].map((item) => `${drawKey}${item.id}`)
        if (type === 'before') {
          this.$refs.sceneLeftRef?.sendEvent('removeExtByNames', ids)
        } else {
          this.$refs.sceneRightRef?.sendEvent('removeExtByNames', ids)
        }
        this[`${type}Tree`] = []
        this[`${type}LineData`] = []
        return
      }
      const [start, end] = val
      const params = {
        startDate: moment(start).valueOf(),
        endDate: moment(end + ' 23:59:59').valueOf()
        // terrainType: type === 'before' ? 10 : 11
      }
      this[`${type}Loading`] = true
      this[`${type}RemoveList`] = []
      this.queryTerrainLine(params)
        .then((res) => {
          if (res && res?.children?.length) {
            const tree = this.addIdForTree(res)
            if (type === 'before') {
              tree.name = '前期地形'
            } else {
              tree.name = '后期地形'
            }
            this[`${type}Tree`] = addRandomKeys([tree])
            const allKey = getAllKeys(this[`${type}Tree`], 'key')
            this.$nextTick(() => {
              this.$refs[`${type}TreeRef`]?.setCheckedKeys(allKey)
            })
          } else {
            this[`${type}Tree`] = []
          }
          // 映射范围线数据
          const data = this.mappingGisData(res?.children || [])
          const ids = this[`${type}LineData`].map((item) => `${drawKey}${item.id}`)
          if (type === 'before') {
            this.$refs.sceneLeftRef?.sendEvent('removeExtByNames', ids)
            this.$refs.sceneLeftRef?.sendEvent('drawBoundaryPlanes', data)
          } else {
            this.$refs.sceneRightRef?.sendEvent('removeExtByNames', ids)
            this.$refs.sceneRightRef?.sendEvent('drawBoundaryPlanes', data)
          }
          this[`${type}LineData`] = data
        })
        .finally(() => {
          this[`${type}Loading`] = false
        })
    },
    // check地形
    handleCheckCallBack(type, node) {
      const name = `${drawKey}${node.id}`
      const checked = node.checked
      if (type === 'before') {
        this.$refs.sceneLeftRef?.sendEvent(checked ? 'showExtByName' : 'hideExtByName', [name])
      } else {
        this.$refs.sceneRightRef?.sendEvent(checked ? 'showExtByName' : 'hideExtByName', [name])
      }
    },
    // 移除计算
    removeHandle(type, node) {
      this[`${type}RemoveList`]?.push(node)
      const name = `${drawKey}${node.id}`
      if (type === 'before') {
        this.$refs.sceneLeftRef?.sendEvent('hideExtByName', [name])
      } else if (type === 'after') {
        this.$refs.sceneRightRef?.sendEvent('hideExtByName', [name])
      } else {
        this.$refs.sceneLeftRef?.sendEvent('hideExtByName', [name])
        this.$refs.sceneRightRef?.sendEvent('hideExtByName', [name])
      }
    },
    // 恢复删除
    restoreHandle(type, ids) {
      const restoreItems = this[`${type}RemoveList`].filter((item) => ids.includes(item.id))
      this[`${type}Tree`][0].children.push(...restoreItems)
      const addKeys = getAllKeys(restoreItems, 'key')
      const selectKeys = this.$refs[`${type}TreeRef`]?.getCheckedKeys()
      this.$nextTick(() => {
        this.$refs[`${type}TreeRef`]?.setCheckedKeys([...selectKeys, ...addKeys])
      })
      this[`${type}RemoveList`] = this[`${type}RemoveList`].filter((item) => !ids.includes(item.id))
      ids.forEach((id) => {
        const name = `${drawKey}${id}`
        if (type === 'before') {
          this.$refs.sceneLeftRef?.sendEvent('showExtByName', [name])
        } else if (type === 'after') {
          this.$refs.sceneRightRef?.sendEvent('showExtByName', [name])
        } else {
          this.$refs.sceneLeftRef?.sendEvent('showExtByName', [name])
          this.$refs.sceneRightRef?.sendEvent('showExtByName', [name])
        }
      })
    },
    // 地形聚焦
    focusTerrainModel(type, node) {
      const gisCenter = node.resource?.gisCenter ? JSON.parse(node.resource.gisCenter) : null
      if (!gisCenter) return
      const position = {
        lon: gisCenter[0],
        lat: gisCenter[1],
        alt: 1200
      }
      const cameraStatus = {
        position: position,
        orientation: {
          pitch: -Math.PI / 2,
          yaw: 0,
          roll: 0
        }
      }
      if (this.regionFocusId) {
        const id = `${drawKey}${this.regionFocusId}`
        this.$refs.sceneRightRef.sendEvent('focusLabelById', id)
        this.$refs.sceneLeftRef.sendEvent('focusLabelById', id)
        this.regionFocusId = null
      }
      if (type === 'before') {
        this.$refs.sceneLeftRef?.sendEvent('setCameraStatus', cameraStatus)
        if (this.beforeFocusId) {
          this.$refs.sceneLeftRef.sendEvent('focusLabelById', `${drawKey}${this.beforeFocusId}`)
        }
        this.$refs.sceneLeftRef.sendEvent('focusLabelById', `${drawKey}${node.id}`, true)
        this.beforeFocusId = node.id
      } else {
        this.$refs.sceneRightRef?.sendEvent('setCameraStatus', cameraStatus)
        if (this.afterFocusId) {
          this.$refs.sceneRightRef.sendEvent('focusLabelById', `${drawKey}${this.afterFocusId}`)
        }
        this.$refs.sceneRightRef.sendEvent('focusLabelById', `${drawKey}${node.id}`, true)
        this.afterFocusId = node.id
      }
    },
    mappingGisData(data) {
      const result = []
      data.forEach((item) => {
        const { resource = {}, name, id } = item
        const gisPoint = resource.gisCoordinate ? JSON.parse(resource.gisCoordinate) : []
        const gisMap = gisPoint.map((item) => {
          return [item[0], item[1], item[2] || 0]
        })
        const obj = {
          name,
          id,
          type: resource.repeated ? 7 : 6,
          gisCenter: resource.gisCenter ? JSON.parse(resource.gisCenter) : gisMap[0],
          points: gisMap
        }
        result.push(obj)
      })
      return result
    },
    // 区域点击
    handleRegionCheckCallBack(node) {
      if (+node.parentId === 0) {
        const cur = this.lines.find((item) => item.regionId === node.id)
        if (!cur) return
        const name = `${drawKey}${cur.regionId}`
        const checked = node.checked
        if (checked) {
          this.$refs.sceneRightRef?.sendEvent('showExtByName', [name])
          this.$refs.sceneLeftRef?.sendEvent('showExtByName', [name])
        } else {
          this.$refs.sceneRightRef?.sendEvent('hideExtByName', [name])
          this.$refs.sceneLeftRef?.sendEvent('hideExtByName', [name])
        }
      }
    },
    // 区域聚焦
    handleFocusRegion(node) {
      const cur = this.lines.find((item) => item.regionId === node.id)
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
      this.$refs.sceneRightRef.sendEvent('setCameraStatus', cameraStatus)
      this.$refs.sceneLeftRef.sendEvent('setCameraStatus', cameraStatus)
      if (this.afterFocusId) {
        this.$refs.sceneRightRef.sendEvent('focusLabelById', `${drawKey}${this.afterFocusId}`)
        this.afterFocusId = null
      }
      if (this.beforeFocusId) {
        this.$refs.sceneLeftRef.sendEvent('focusLabelById', `${drawKey}${this.beforeFocusId}`)
        this.beforeFocusId = null
      }
      if (this.regionFocusId) {
        const id = `${drawKey}${this.regionFocusId}`
        this.$refs.sceneRightRef.sendEvent('focusLabelById', id)
        this.$refs.sceneLeftRef.sendEvent('focusLabelById', id)
      }
      this.$refs.sceneRightRef.sendEvent('focusLabelById', `${drawKey}${node.id}`, true)
      this.$refs.sceneLeftRef.sendEvent('focusLabelById', `${drawKey}${node.id}`, true)
      this.regionFocusId = node.id
    },
    updateToolbarPosition(position) {
      this.toolbarRightPosition = position
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    height: 100%;
    position: relative;
    .legends {
      position: absolute;
      bottom: 11px;
    }
    .remove-btn {
      top: 0;
      right: 0;
    }
    .remove-region-btn {
      top: 8px;
      right: 0;
    }
    .left-content {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      .search {
        height: 48px;
        display: flex;
        align-items: center;
        .tag {
          display: flex;
          align-items: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          padding: 5px 8px;
          background: #f9de4b;
          color: rgba(0, 0, 0, 0.88);
          margin-right: 8px;
        }
      }
      .wrap {
        height: calc(100% - 48px);
        overflow-y: auto;
        background: #2e343e;
        padding: 0 8px 8px 8px;
        border-radius: 6px;
        position: relative;
      }
      .top,
      .bottom {
        height: 50%;
      }
    }
    .right-content {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      .title {
        height: 48px;
        display: flex;
        align-items: center;
        font-weight: bold;
        padding-left: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        position: relative;
      }
      .wrap {
        height: calc(100% - 48px);
        overflow-y: auto;
        position: relative;
      }
    }
  }
  ::v-deep .el-dialog .el-dialog__footer {
    // border-top: none !important;
  }
  ::v-deep .el-dialog .el-dialog__body {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
    height: calc(100% - 106px) !important;
  }
  ::v-deep {
    .underline div span {
      text-decoration: underline;
      color: red; // 或者你想要的颜色
    }
  }
</style>
