<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:50:19
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-07 14:35:43
 * @description: 图纸管理
-->
<template>
  <div
    class="drawing"
    v-loading="disable"
    :element-loading-text="$t('loading')"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!-- 新增按钮 -->
    <el-button
      v-if="drawings.length === 0 && !disable"
      type="primary"
      @click="showUploadDialog = true"
      class="top-btn"
    >{{ $t('drawing.addDrawing') }}</el-button>

    <!-- 上传对话框 -->
    <el-dialog
      :title="$t('drawing.addDrawing')"
      :visible.sync="showUploadDialog"
      width="720px"
      :before-close="handleCloseDialog"
    >
      <div
        class="upload-tip"
        v-if="showUploadTip"
      >
        <div class="left">
          <i class="icon-upload-tip"></i>
          <span>{{ $t('drawing.uploadTip') }}</span>
        </div>
        <i
          class="el-icon-close icon-close"
          @click="showUploadTip = false"
        ></i>
      </div>
      <el-upload
        v-if="showUploadComponent"
        ref="fileRefs"
        class="upload-demo"
        :class="{ 'is-dragging': isDragging }"
        drag
        action="#"
        :limit="10"
        multiple
        :on-exceed="handleExceed"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :on-change="handleUploadChange"
        :http-request="uploadToOSS"
        :show-file-list="false"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t('drawing.dragFiles') }}<em>{{ $t('drawing.clickUpload') }}</em>
          <div class="el-upload__tip">{{ $t('drawing.supportedFormats') }}</div>
        </div>
      </el-upload>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="handleCloseDialog"
        >{{ $t('cancel') }}</el-button>
        <el-button
          type="primary"
          @click="confirmUpload"
        >{{ $t('confirm') }}</el-button>
      </span>

      <div
        class="upload-progress-container"
        ref="uploadedFile"
        v-if="showUploadComponent"
      >
        <div v-if="uploadProgressIsActive">
          <upload-progress
            v-for="file in uploadFiles"
            :key="file.uid"
            :fileName="file.name"
            :progress="file.progress"
            :isComplete="file.isComplete"
            @delete="removeFile(file.uid)"
          />
        </div>
      </div>
    </el-dialog>

    <no-content
      element-loading-background="rgba(0, 0, 0, 0.8)"
      v-if="drawings.length === 0 && !disable"
    />
    <template v-else>
      <DragContainer
        :draggable="false"
        @collapseChange="collapseChange"
        defaultWidth="300"
        dragPosition="right"
        v-slot="slotProps"
      >
        <!-- 新增按钮 -->
        <el-button
          type="primary"
          @click="showUploadDialog = true"
          class="top-btn"
        >{{ $t('drawing.addDrawing') }}</el-button>

        <div
          class="drawing-list"
          v-loading="deleteDrawingLoading"
        >
          <card
            v-for="drawing in drawings"
            :key="drawing.fileId"
            :title="drawing.fileName"
            :id="drawing.fileId"
            :updateTime="drawing.updateTime"
            :transformStatus="drawing.transformStatus"
            :isCollapse="slotProps.isCollapse"
            :isActive="selectedCardIds.includes(drawing.globalBimfaceId)"
            :switchModel="drawing.enable"
            :tooltipContent="$t('drawing.tooltipContent')"
            :switchInactiveText="$t('drawing.switchInactiveText')"
            :updateTimeLabel="$t('drawing.updateTimeLabel')"
            request-type="drawing"
            @card-click="toggleCardSelection(drawing.globalBimfaceId)"
            @copy="onCopy(drawing.fileId)"
            @action="handleAction"
            @switch-change="updateSwitchStatus(drawing.fileId, $event)"
            @delete-drawing="handleDrawingDelete(drawing.fileId)"
          />
        </div>
      </DragContainer>

      <div
        id="bim-wrap"
        class="bim-wrap"
        :key="bimKey"
      ></div>

      <div
        class="selected-card-name"
        v-if="selectedCardFileName"
      >
        {{ selectedCardFileName }}
      </div>

      <!-- 正在上传组件的进度显示区域 -->
      <div
        class="uploading-progress-container"
        v-if="uploadingFiles.length > 0"
      >
        <upload-loading-progress
          v-for="file in uploadingFiles"
          :key="file.uid"
          :fileName="file.name"
          :progress="file.progress"
          :isComplete="file.isComplete"
          @delete="removeFile(file.uid)"
          @hide="hideFile(file.uid)"
        />
      </div>
    </template>
  </div>
</template>
<script>
import BimFactory from '@/utils/bimComponent/index'
import DragContainer from '../../components/scene/DragContainer.vue'
import { mapState } from 'vuex'
import { getDrawingList, getSceneViewToken, deleteDrawing, getUploadUrl, createDrawing } from '@/api/projectSetting'
import Card from './components/Card.vue'
import UploadProgress from './components/UploadProgress.vue'
import UploadLoadingProgress from './components/UploadLoadingProgress.vue'
import axios from 'axios'

export default {
  name: 'Drawing',
  components: {
    DragContainer,
    Card,
    UploadProgress,
    UploadLoadingProgress
  },
  data() {
    return {
      drawerVisible: true,
      drawings: [],
      sceneViewToken: '',
      selectedCardIds: [], // 存储选中的卡片ID
      selectedCardLayerIds: [], // 存储选中的图层ID
      selectedCardFileName: '', // 当前选中卡片的文件名
      bimKey: 0,
      disable: true,
      showUploadDialog: false, // 控制上传对话框显示隐藏
      showUploadTip: false, // 控制 upload-tip 的显示
      isDragging: false, // 控制拖拽状态
      uploadFiles: [], // 存储上传文件的进度信息
      uploadingFiles: [],
      maxFiles: 10,
      showUploadComponent: true,
      uploadProgressIsActive: true,
      deleteDrawingList: [],
      deleteDrawingLoading: false,
      cancelTokens: {} // 存储取消令牌
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    window.bimInstance?.destroy()
  },
  watch: {
    uploadFiles: {
      handler(newFiles) {
        const allComplete = newFiles.every((file) => file.isComplete)
        if (allComplete) {
          this.showUploadTip = false
        }
      },
      deep: true
    }
  },
  methods: {
    async init() {
      try {
        await this.queryDrawingList()
        await this.getSceneViewToken()
      } catch (error) {
        console.error('初始化组件时发生错误:', error)
      }
    },

    // 初始化bim组件
    initBim(sceneViewToken) {
      const options = {
        id: 'bim-wrap',
        sceneViewToken: sceneViewToken,
        sceneAddedCallback: this.sceneAddedCallback,
        LayerAddedCallback: this.LayerAddedCallback
      }
      window.bimInstance = BimFactory.create(options, 'bimface')
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

    // 获取图纸列表
    queryDrawingList() {
      return getDrawingList(this.projectId)
        .then((data) => {
          // 将请求返回的数据赋值给 drawings
          this.drawings = data?.drawings?.map((drawing) => {
            return {
              ...drawing,
              updateTime: this.formatTimestamp(drawing?.updateTime) || '',
              enabled: drawing.enabled
            }
          })
          this.disable = false
          // 默认选中第一个卡片图纸并预览
          const defaultDrawing = this.drawings.find((drawing) => drawing.transformStatus === 0)
          if (defaultDrawing) {
            const { globalBimfaceId, fileName } = defaultDrawing
            const formattedFileName = fileName.replace(/\.dwg$/i, '')
            this.selectedCardIds = [globalBimfaceId]
            this.selectedCardLayerIds = `layer_${globalBimfaceId}`
            this.selectedCardFileName = formattedFileName
          } else {
            this.selectedCardIds = []
            this.selectedCardLayerIds = []
            this.selectedCardFileName = ''
          }
        })
        .catch((error) => {
          console.error('获取图纸列表失败:', error)
        })
    },

    // 图层加载完毕事件回调，用来默认跳转到第一张图纸
    LayerAddedCallback() {
      window.bimInstance?.showLayer(this.drawings, this.selectedCardLayerIds)
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

    // 获取场景视图token
    getSceneViewToken() {
      return getSceneViewToken(this.projectId)
        .then((res) => {
          this.sceneViewToken = res?.data?.sceneViewToken
          this.initBim(this.sceneViewToken)
        })
        .catch((error) => {
          console.error('获取场景视图token失败:', error)
        })
    },

    // 支持单个卡片的选中状态
    toggleCardSelection(id) {
      const drawing = this.drawings.find((d) => d.globalBimfaceId === id)

      const { globalBimfaceId, fileName, transformStatus } = drawing
      // 选中第一个转换成功的图纸
      if (transformStatus === 0) {
        const formattedFileName = fileName.replace(/\.dwg$/i, '')

        const isSelected = this.selectedCardIds.includes(globalBimfaceId)

        this.selectedCardIds = isSelected ? [] : [globalBimfaceId]
        this.selectedCardLayerIds = isSelected ? [] : `layer_${globalBimfaceId}`
        this.selectedCardFileName = isSelected ? '' : formattedFileName
        if (!isSelected) {
          // 选中卡片后，将选中的图层传给bim组件，实现当前图纸的预览，隐藏其他图纸
          window.bimInstance?.showLayer(this.drawings, this.selectedCardLayerIds)
        }
      }

      console.log('选中的卡片id和图层:', this.selectedCardIds, this.selectedCardLayerIds)
    },

    // TODO:缩放到图纸图层
    onZoomToDrawingLayer(selectedCardLayerIds) {
      const layer = selectedCardLayerIds[0]
      window.bimInstance?.zoomToDrawingLayer(layer)
      console.log('图纸图层11111111:', window.bimInstance?.zoomToDrawingLayer(layer), layer)
    },

    toggleDrawer() {
      this.drawerVisible = !this.drawerVisible
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
    updateSwitchStatus(fileId, newStatus) {
      const drawing = this.drawings.find((d) => d.fileId === fileId)
      if (drawing) {
        drawing.enabled = newStatus
      }
    },

    handleUploadError() {
      this.$message.warning('取消上传!')
      this.showUploadTip = false // 上传失败后隐藏提示
    },

    // 右上角叉号关闭弹窗
    handleCloseDialog() {
      this.$confirm('放弃操作后，当前所编辑的内容将会丢失。', '确定放弃当前操作吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      })
        .then(() => {
          this.showUploadDialog = false
          this.uploadFiles = []
          this.cancelUploads()
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async confirmUpload() {
      if (this.uploadFiles.length === 0) {
        this.$message.warning('图纸列表为空，请先上传图纸')
        return
      }
      // 关闭弹窗
      this.showUploadDialog = false
      // 展示右下角上传进度条
      const uploading = this.uploadFiles.filter((file) => !file.isComplete)
      this.uploadingFiles.push(...uploading)

      // 如果 completedDrawings 是空数组，直接返回
      const completedDrawings = this.uploadFiles
        .filter((file) => file.isComplete)
        ?.map((file) => {
          return {
            configId: file.configId,
            name: file.encodeName
          }
        })
      this.uploadFiles = []
      this.cancelUploads()
      if (completedDrawings.length === 0) {
        return
      }
      try {
        const res = await createDrawing(this.projectId, completedDrawings)
        if (res.code === 0) {
          this.$message.success('图纸创建成功')
          await this.queryDrawingList()
        } else {
          throw new Error('图纸创建失败')
        }
      } catch (error) {
        console.error('上传图纸失败:', error)
      }
    },
    async uploadToOSS({ file, onSuccess, onError }) {
      const CancelToken = axios.CancelToken

      const source = CancelToken.source()
      this.cancelTokens[file.uid] = source

      try {
        const fileName = encodeURIComponent(file.name)
        const response = await getUploadUrl(this.projectId, fileName, 'GraphMatch')

        const { uploadUrl, configId } = response || {}
        if (!uploadUrl) {
          return this.$message.error('获取上传地址失败')
        }
        let httpsUrl = uploadUrl
        if (uploadUrl.indexOf('http://') > -1) {
          httpsUrl = uploadUrl.replace('http://', 'https://')
        }
        // 添加到上传文件列表
        const uploadFile = {
          uid: file.uid,
          name: file.name,
          progress: 0,
          isComplete: false,
          encodeName: encodeURIComponent(file.name),
          configId: configId
        }
        this.uploadFiles.push(uploadFile)

        // 创建上传配置
        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          // timeout: 60000, // 设置超时时间为60秒
          onUploadProgress: (progressEvent) => {
            // console.log('上传进度111:', progressEvent)
            if (progressEvent.lengthComputable) {
              const percentCompleted = parseFloat((progressEvent.loaded / progressEvent.total).toFixed(4)) * 100

              const uploading = this.uploadingFiles.find((f) => f.uid === file.uid)
              if (uploading) {
                uploading.progress = percentCompleted
                uploading.isComplete = percentCompleted === 100
                // 判断弹窗是否关闭，弹窗关闭的话，检测fileToUpdate的值，到100%，调用上传接口
                if (uploading.isComplete) {
                  this.handleFileUploadComplete([uploading])
                }
              }
              const fileToUpdate = this.uploadFiles.find((f) => f.uid === file.uid)
              // console.log('上传进度:', percentCompleted, fileToUpdate, this.uploadFiles);
              if (fileToUpdate) {
                fileToUpdate.progress = percentCompleted
                fileToUpdate.isComplete = percentCompleted === 100
              }
            }
          },
          cancelToken: source.token
        }

        // 使用 axios 上传文件
        const res = await axios.put(httpsUrl, file, config)

        // todo：创建cancelToken，往其他数组里面存一个，点删除的
        if (res.status === 200) {
          onSuccess({}, file)
          const uploading = this.uploadingFiles.find((f) => f.uid === file.uid)
          const fileToUpdate = this.uploadFiles.find((f) => f.uid === file.uid)
          if (uploading) {
            uploading.progress = 100
            uploading.isComplete = true
          }
          if (fileToUpdate) {
            fileToUpdate.progress = 100
            fileToUpdate.isComplete = true
          }
          console.log('上传成功:', res)
        } else {
          throw new Error('上传失败')
        }
      } catch (error) {
        console.error('上传失败111111111:', error)
        this.showUploadTip = false
        onError(error)
      } finally {
        delete this.cancelTokens[file.uid]
      }
    },

    // 右下角上传进度到100%调用该方法
    async handleFileUploadComplete(list) {
      const completedList = list?.map((f) => {
        return {
          configId: f.configId,
          name: f.encodeName
        }
      })
      const res = await createDrawing(this.projectId, completedList)
      if (res.code === 0) {
        this.$message.success('图纸创建成功')
        await this.queryDrawingList()
      }
    },

    handleExceed(files) {
      this.$message.warning(`当前限制最多同时上传 10 个文件，本次选择了 ${files.length} 个文件`)
    },
    isValidFile(file) {
      const isLt1G = file.size / 1024 / 1024 / 1024 < 1
      const isSupportedFormat = /\.(dwg)$/i.test(file.name)
      return isLt1G && isSupportedFormat
    },
    beforeUpload(file) {
      this.uploadProgressIsActive = true
      // 检查当前选择的文件数量和已上传的文件数量
      const totalFiles = this.$refs.fileRefs.uploadFiles.length

      if (totalFiles > this.maxFiles) {
        this.$message.warning(`最多只能上传 ${this.maxFiles} 个文件`)
        return false
      }

      const isValid = this.isValidFile(file)
      if (!isValid) {
        this.$message.warning('文件大小不能超过1G且只能上传DWG')
      }
      return isValid
    },
    handleUploadChange() {
      this.showUploadTip = true
    },
    // 点击删除icon取消上传到oss
    removeFile(uid) {
      // 取消上传
      if (this.cancelTokens[uid]) {
        this.cancelTokens[uid].cancel('上传已取消')
      }

      // 过滤uploadFiles
      this.uploadFiles = this.uploadFiles.filter((file) => file.uid !== uid)
      this.uploadingFiles = this.uploadingFiles.filter((file) => file.uid !== uid)
      // 同步更新
      this.$refs.fileRefs.uploadFiles = this.$refs.fileRefs.uploadFiles.filter((file) => file.uid !== uid)
    },
    cancelUploads() {
      // 销毁 el-upload 组件
      this.showUploadComponent = false
      // 销毁组件后，重新渲染组件
      this.$nextTick(() => {
        this.uploadProgressIsActive = false
        // 重新渲染上传组件
        this.showUploadComponent = true
      })
    },
    // 隐藏上传进度条
    hideFile(uid) {
      const file = this.uploadingFiles.find((f) => f.uid === uid)
      if (file) {
        file.hidden = true
      }
    },
    // 删除失败图纸
    handleDrawingDelete(id) {
      this.deleteDrawingList.push(id)
      deleteDrawing(this.projectId, this.deleteDrawingList)
        .then(() => {
          this.queryDrawingList()
        })
        .catch((error) => {
          console.error('删除图纸后获取图纸失败:', error)
        })
    }
  }
}
</script>
<style lang="scss" scoped>
  .drawing {
    height: 100%;
    position: relative;
    display: flex;

    .is-dragging {
      background-color: #e6f7ff;
      border-color: #1677ff;
    }
    .upload-tip {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 38px;
      background: #e6f4ff;
      border-radius: 8px;
      padding: 8px 12px;
      border: 1px solid #91caff;
      margin-bottom: 8px;

      .left {
        display: flex;
        align-items: center;
      }
    }

    .upload-progress-container {
      width: 693px;
      max-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
      margin-top: 16px;
      position: relative;
    }

    .uploading-progress-container {
      z-index: 99;
      position: fixed;
      bottom: 20px;
      right: 20px;
    }

    .top-btn {
      margin: 16px 0 0 16px;
    }
    .drawing-list {
      height: calc(100% - 56px);
      overflow-y: auto;
      margin-top: 8px;
      padding-bottom: 20px;
      overflow: hidden auto;
    }
    .bim-wrap {
      height: 100%;
      width: 100%;
      overflow: hidden;

      ::v-deep {
        .bfui-app {
          // 左侧工具栏隐藏
          .bfui-align-top {
            display: none;
          }

          // 左侧目录树隐藏
          .bfui-panel-drawer.bfui-panel-topshow {
            display: none;
          }
        }
      }
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

    .el-upload-dragger {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 679px !important;
      height: 250px !important;
    }
  }
</style>
