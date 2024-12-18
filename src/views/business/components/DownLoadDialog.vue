<!--
 * @author: lvzj
 * @Date: 2024-06-24 16:08:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-28 15:01:59
 * @description: file content
-->
<template>
  <el-dialog
    :title="$t('downloadDrawingDialog.title')"
    :visible.sync="dialogVisible"
    width="720px"
    top="20vh"
    @open="open"
    :before-close="handleClose"
  >
    <div v-loading="loading">
      <div class="dialog-content">
        <div class="download-item-drawing">
          <div class="left">
            <div class="name">{{ $t('downloadDrawingDialog.sectionDrawingName') }}</div>
          </div>
          <el-button
            type="primary"
            :loading="downloadDrawingLoading"
            @click="downloadDrawing"
          >{{ $t('downloadDrawingDialog.download') }}</el-button>
        </div>
        <div class="download-item-ledger">
          <div class="left">
            <div class="name">{{ $t('downloadDrawingDialog.sectionLedgerName') }}</div>
          </div>
          <el-button
            type="primary"
            :loading="downLoading"
            @click="downloadLedge"
          >{{ $t('downloadDrawingDialog.download') }}</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mergeDrawing, downloadReceiveDrawing } from '@/api/business'
import { mapState } from 'vuex'
export default {
  name: 'DownLoadDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: [Number, String],
      default: ''
    },
    downLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      mergeDrawingUrl: '',
      isSuccess: false,
      checked: false,
      downloadDrawingLoading: false,
      timeoutId: null
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
    }
  },
  methods: {
    async open() {
      this.loading = true
      try {
        // 调用合并图纸的接口
        await this.mergeDrawing()
        // 调用获取下载地址的接口
        await this.getDownloadUrl()
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async mergeDrawing() {
      try {
        await mergeDrawing(this.projectId, this.taskId)
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    async getDownloadUrl() {
      this.downloadDrawingLoading = true
      this.startPolling()
    },
    async pollDownloadShareDrawing() {
      try {
        const res = await downloadReceiveDrawing(this.projectId, this.taskId)
        if (res) {
          this.mergeDrawingUrl = res
          this.downloadDrawingLoading = false
          this.stopPolling()
        } else {
          this.startPolling()
        }
      } catch (error) {
        this.$message.error('下载失败')
        this.downloadDrawingLoading = false
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
        console.log('this.pollingTimeout', this.pollingTimeout)
        clearTimeout(this.pollingTimeout)
        this.pollingTimeout = null
      }
    },
    downloadDrawing() {
      if (!this.mergeDrawingUrl) {
        this.$message.error('下载地址为空')
        return
      }
      window.location.href = this.mergeDrawingUrl
    },
    handleClose(done) {
      this.stopPolling()
      done()
    },
    downloadLedge() {
      this.$emit('resultDownload')
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-content {
    .download-item-drawing,
    .download-item-ledger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 680px;
      height: 68px;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.06);
      margin-bottom: 16px;

      .left {
        margin: 10px 0 10px 10px;

        .name {
          font-size: 14px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.88);
        }
      }

      .el-button {
        margin-right: 10px;
      }
    }
  }
  .el-icon-success {
    color: #67c23a;
    font-size: 14px;
    margin-right: 5px;
  }
</style>

<style lang="scss">
  .el-checkbox .el-checkbox__input .el-checkbox__inner {
    border-color: #1677ff;
  }
</style>
