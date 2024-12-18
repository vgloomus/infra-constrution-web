<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:51:26
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-04 17:08:00
 * @description: 收方模板
-->
<template>
  <div class="recipient-template">
    <div class="main-project-inner-box">
      <div class="main-content">
        <!-- 头部搜索框 -->
        <div class="header-top">
          <div class="top">
            <el-button
              type="primary"
              @click="newCreate"
            >{{ $t('recipientTemplate.newTemplate') }}</el-button>
          </div>
        </div>

        <div
          class="content"
          v-loading="disable"
          :element-loading-text="$t('recipientTemplate.loadingData')"
          element-loading-background="rgba(0, 0, 0, 0.8)"
        >
          <no-content
            element-loading-background="rgba(0, 0, 0, 0.8)"
            v-if="!disable && templateList.length === 0"
          />

          <template v-else>
            <DragContainer
              :draggable="false"
              @collapseChange="collapseChange"
              defaultWidth="300"
              dragPosition="right"
              v-slot="slotProps"
            >
              <!-- 默认插槽 -->
              <div class="drag-container-wrap">
                <card
                  v-for="template in templateList"
                  :key="template.id"
                  :title="template.name"
                  :id="template.id"
                  :updateTime="template.updateTime"
                  :isCollapse="slotProps.isCollapse"
                  :isActive="selectedCardIds.includes(template.id)"
                  :switchModel="template.enable"
                  :tooltipContent="$t('recipientTemplate.tooltipContent')"
                  :switchInactiveText="$t('recipientTemplate.switchInactiveText')"
                  :updateTimeLabel="$t('recipientTemplate.updateTimeLabel')"
                  request-type="recipientTemplate"
                  @card-click="toggleCardSelection(template.id)"
                  @copy="onCopy(template.id)"
                  @edit="handleEdit"
                  @delete="handleDelete(template.id)"
                  @action="handleAction"
                  @switch-change="updateSwitchStatus(template.id, $event)"
                >
                  <template #dropdown-menu>
                    <el-dropdown-item command="edit">{{ $t('recipientTemplate.edit') }}</el-dropdown-item>
                  </template>
                </card>
              </div>
            </DragContainer>

            <div
              id="bim-wrap"
              class="bim-wrap"
            ></div>
            <div
              class="selected-card-name"
              v-if="selectedCardFileName"
            >
              {{ selectedCardFileName }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import DragContainer from '../../components/scene/DragContainer.vue'
import Card from './components/Card.vue'
import BimFactory from '@/utils/bimComponent/index'
import { mapState } from 'vuex'
import meshMixins from '@/mixins/meshMixins'
import { EnumTypes } from '@/common/enum'
import {
  getTemplateList,
  getTemplateDetail,
  getTaskLayerTreeForEdit,
  getTaskLayerTree,
  getAllMeshData,
  getCoordinateStatus,
  deleteTemplate,
  getRegionsCount
} from '@/api/projectSetting'
import { updateScenes } from '@/api/common'
import { addRandomKeys, findKeysByVal, collectNonLeafKeys, loadOBJFile, findNodeListsWithType } from '@/utils/index'

export default {
  name: 'RecipientTemplate',
  components: {
    DragContainer,
    Card
  },
  data() {
    return {
      drawerVisible: true,
      templateList: [],
      sceneViewToken: '',
      selectedCardIds: [], // 存储选中的卡片ID
      selectedCardLayerIds: [], // 存储选中的图层ID
      selectedCardFileName: '', // 当前选中卡片的文件名
      activeTemplateId: null, // 存储当前启用的模板 ID
      sceneOptions: {},
      loading: true,
      disable: true,
      defaultSelectedTemplateId: '', // 默认选中的模板ID（模板列表第一条数据）
      meshData: []
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  mixins: [meshMixins],
  mounted() {
    this.queryTemplateList()
  },
  beforeDestroy() {
    window.bimInstance?.destroy()
  },
  methods: {
    // 初始化bim组件
    initBim() {
      const options = {
        id: 'bim-wrap',
        ...this.sceneOptions
      }
      window.bimInstance = BimFactory.create(options, 'bimface')
    },
    // 清除之前的场景
    clearPreviousScene() {
      if (window.bimInstance) {
        window.bimInstance = null
        const bimWrap = document.getElementById('bim-wrap')
        if (bimWrap) {
          bimWrap.innerHTML = ''
        }
      }
    },

    // 侧边栏折叠
    collapseChange() {
      this.$nextTick(() => {
        const box = document.getElementById('bim-wrap')
        const width = box.clientWidth
        const height = box.clientHeight
        window.bimInstance?.resize([width, height])
      })
    },

    // 获取收方模板列表
    queryTemplateList() {
      getTemplateList(this.projectId)
        .then((data) => {
          this.templateList = data?.map((template) => {
            return {
              ...template,
              updateTime: this.formatTimestamp(template?.updateTime) || ''
            }
          })
          this.loading = false
          this.disable = false

          // 默认选中第一个模板，并加载对应的场景
          const firstTemplate = this.templateList[0]
          if (firstTemplate) {
            this.defaultSelectedTemplateId = firstTemplate.id
            this.selectedCardIds = [firstTemplate.id]
            this.selectedCardFileName = firstTemplate.name
            this.loadTemplate(firstTemplate.id) // 直接加载第一个模板
          }

          console.log('获取模板列表成功:', this.templateList)
        })
        .catch((error) => {
          console.error('获取模板列表失败:', error)
        })
    },

    // 获取模板详情
    getDetail(templateId) {
      return getTemplateDetail(this.projectId, templateId).then((res) => {
        return res || {}
      })
    },

    // 初始化收方树
    initReceiptTree(templateId) {
      const api = templateId ? getTaskLayerTreeForEdit : getTaskLayerTree
      return api(this.projectId, templateId).then((res) => {
        return res || {}
      })
    },

    // 加载模板拿到树形数据和场景token
    async loadTemplate(templateId) {
      try {
        const [treeRes, detailRes] = await Promise.all([this.initReceiptTree(templateId), this.getDetail(templateId)])
        const { name, sceneId, id: detailTemplateId } = detailRes
        this.name = name
        this.sceneId = sceneId
        this.templateId = detailTemplateId

        // 处理树形数据和场景设置
        const template = treeRes?.find((item) => item.type === EnumTypes.RECEIPT_TEMPLATE)
        const roadLineList = template?.children?.filter((item) => item.type === EnumTypes.CENTER_LINE) || []
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
            isVisible: item.checked,
            layerConfig: {
              isGround: true
            }
          }
        })

        // 更新场景参数
        const params = {
          sceneId: this.sceneId,
          templateId: this.templateId,
          resources
        }

        // 初次加载场景时，需要先请求拿到场景的token，然后再传递给sceneOptions，进行场景的加载
        const newScenes = await updateScenes(this.projectId, params)

        this.sceneOptions = {
          roadLineList,
          areaList,
          sceneViewToken: newScenes.data,
          sceneAddedCallback: this.sceneAddedCallback
        }

        this.tree = addRandomKeys(treeRes)
        this.defaultExpandedKeys = collectNonLeafKeys(this.tree)
        const allKey = findKeysByVal(this.tree, 'checked', true)
        this.$nextTick(() => {
          this.$refs.treeRef?.setCheckedKeys(allKey)
        })

        this.clearPreviousScene()
        this.initBim()
      } catch (error) {
        console.error('加载模板失败:', error)
      }
    },

    // 点击卡片后，渲染当前卡片对应的模板
    toggleCardSelection(id) {
      console.log('当前点击的模板id:', id, '所有模板:', this.templateList)

      const template = this.templateList.find((d) => d.id === id)
      if (!template) return

      // 更新选中的模板ID，并加载对应的模板
      this.templateId = template.id

      if (this.selectedCardIds.includes(id)) {
        this.selectedCardIds = []
      } else {
        this.selectedCardIds = [id]
        this.selectedCardFileName = template.name || ''
      }

      this.loadTemplate(template.id)

      console.log('当前选中的卡片id和名称:', this.selectedCardIds, '选中的卡片名称:', this.selectedCardFileName)
    },

    // 场景添加完成回调
    sceneAddedCallback() {
      this.loading = false
      setTimeout(() => {
        window.bimInstance?.focusToLayer('extLayerId')
      }, 1000)
      this.getMeshData()
    },

    // 格式化时间戳
    formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1000) // 将秒转换为毫秒
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1).toString().padStart(2, '0') + '-'
      const D = date.getDate().toString().padStart(2, '0') + ' '
      const h = date.getHours().toString().padStart(2, '0') + ':'
      const m = date.getMinutes().toString().padStart(2, '0') + ':'
      const s = date.getSeconds().toString().padStart(2, '0')
      return Y + M + D + h + m + s
    },

    // TODO:图纸图层叠加到场景中，是这样做的吗
    onZoomToDrawingLayer(selectedCardLayerIds) {
      const layer = selectedCardLayerIds[0]
      window.bimInstance?.zoomToDrawingLayer(layer)
      console.log('图纸图层2222:', window.bimInstance?.zoomToDrawingLayer(layer), layer)
    },

    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
    },
    // 处理编辑操作
    handleEdit(id) {
      // 这里可以添加打开编辑对话框的逻辑
      const curTmp = this.templateList.find((template) => template.id === id)
      this.$router.push({
        path: '/projectSetting/templateEdit',
        query: {
          id,
          referenceType: curTmp.type || 0,
          type: 'edit'
        }
      })
    },

    // TODO：处理具体的删除逻辑
    async handleDelete(id) {
      try {
        await deleteTemplate(this.projectId, id)
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.queryTemplateList()
      } catch (error) {
        this.$message.error('删除失败')
      }
    },

    // 通用动作处理方法
    handleAction(action) {
      console.log('执行动作:', action)
      // 执行动作后，关闭弹窗
      this.visiblePopover = null
    },
    /* eslint-disable */
    onCopy(id) {
      navigator.clipboard
        .writeText(id)
        .then(() => {
          this.$message({
            message: `ID: ${id} 已复制`,
            type: 'success'
          })
        })
        .catch((err) => {
          this.$message({
            message: 'ID复制失败!',
            type: 'error'
          })
        })
    },
    updateSwitchStatus(id, newStatus) {
      // 首先关闭所有其他模板的开关
      this.templateList.forEach((template) => {
        if (template.id !== id) {
          template.enable = false
        }
      })

      // 更新当前模板的开关状态
      const template = this.templateList.find((d) => d.id === id)
      if (template) {
        template.enable = newStatus
      }

      // 更新 activeTemplateId 用于跟踪当前启用的模板
      if (newStatus) {
        this.activeTemplateId = id
      } else if (this.activeTemplateId === id) {
        this.activeTemplateId = null
      }
    },
    async newCreate() {
      const count = await getRegionsCount(this.projectId)
      if (count > 0) {
        this.$confirm('是否直接引用区域管理已有的结构树？', '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showClose: false,
          type: 'warning'
        })
          .then(() => {
            this.gotoCreate(1)
          })
          .catch(() => {
            this.gotoCreate(0)
          })
      } else {
        this.gotoCreate(0)
      }

    },
    // 新建 0 默认 1 引用
    gotoCreate(type = 0) {
      getCoordinateStatus(this.projectId).then((res) => {
        if (res) {
          this.$router.push({
            path: '/projectSetting/templateEdit',
            query: {
              type: 'add',
              referenceType: type
            }
          })
        } else {
          this.$message({
            message: '请先设置项目坐标转换参数',
            type: 'warning'
          })
        }
      })
    },
    // 获取所有mesh数据
    getMeshData() {
      getAllMeshData(this.projectId, this.templateId).then((res) => {
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
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .recipient-template {
    width: 100%;
    height: 100%;

    .main-project-inner-box {
      height: 100%;

      .main-content {
        height: 100%;
        background-color: #191d21;

        .header-top {
          display: flex;
          align-items: center;
          width: 100%;
          height: 64px;
          border-bottom: 1px solid #434d5a;

          .top {
            .el-button {
              margin-left: 20px;
            }
          }
        }
        .content {
          height: calc(100% - 64px);
          position: relative;
          display: flex;
          ::v-deep .drag-container .collapse-btn {
            right: -30px !important;
          }
          .drag-container-wrap {
            overflow: hidden auto;
            height: 100%;
            padding-bottom: 20px;
          }
          .drawing-card {
            width: 268px;
            margin: 16px 16px 10px 16px;
            background: #2e343e;
            border-radius: 6px;
            border: 1px solid #2e343e;

            //悬停
            &:hover {
              background: #434d5a;
              cursor: pointer;
            }

            // 点击
            &.active {
              background: rgba(22, 119, 255, 0.3);
            }

            .card-header {
              display: flex;
              align-items: center;

              .title {
                width: 186px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: rgba(255, 255, 255, 0.85);
                font-size: 14px;
              }
            }

            .card-body {
              padding-top: 8px;
              color: rgba(255, 255, 255, 0.5);
              font-size: 14px;

              .top {
                display: flex;
                align-items: center;
                .id {
                  font-size: 12px;
                }
              }

              .bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 8px;
                .update-time {
                  font-size: 12px;
                }
                .operate {
                  width: 20px;
                  height: 20px;
                  background: url("../../assets/images/operate.png") no-repeat top
                    left / 20px 20px;
                  background-size: cover;
                  cursor: pointer;
                }
              }
            }
          }

          .bim-wrap {
            height: 100%;
            width: 100%;
            overflow: hidden;
          }

          .selected-card-name {
            position: fixed;
            bottom: 16px;
            right: 17px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 2px 8px;
            font-size: 14px;
          }
        }
      }
    }
  }

  ::v-deep {
    div.el-card .el-card__body {
      padding: 8px 12px;
    }

    .el-switch,
    .el-switch__label {
      width: 44px;
      color: #fff;
    }

    .el-switch__label--left {
      left: 3px;
      position: absolute;
      z-index: 1;
      white-space: nowrap;
    }

    .el-switch__label--left > span {
      font-size: 12px;
    }

    .el-switch__label--left.is-active {
      visibility: hidden; /* 隐藏 “禁用” 文字 */
    }

    .el-dropdown-menu {
      padding: 0;
      margin: 0;
    }
  }
</style>
