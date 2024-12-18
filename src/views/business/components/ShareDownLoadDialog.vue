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
            <div class="name">
              {{ (type === 2 ? $t('downloadDrawingDialog.sectionComparison') : $t('downloadDrawingDialog.section')) + $t('downloadDrawingDialog.drawingName') }}
            </div>
          </div>
          <el-button
            type="primary"
            :loading="downDrawingLoading"
            @click="downloadDrawing"
          >{{ $t('downloadDrawingDialog.download') }}</el-button>
        </div>
        <div class="download-item-ledger">
          <div class="left">
            <div class="name">
              {{ (type === 2 ? $t('downloadDrawingDialog.sectionComparison') : $t('downloadDrawingDialog.section')) + $t('downloadDrawingDialog.ledgerName') }}
            </div>
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
import { mapState } from 'vuex'
export default {
  name: 'ShareDownLoadDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    downLoading: {
      type: Boolean,
      default: false
    },
    downDrawingLoading: {
      type: Boolean,
      default: false
    },
    type: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      loading: false,
      isSuccess: false,
      checked: false,
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
    downloadDrawing() {
      this.$emit('shareDownloadDrawing')
    },
    downloadLedge() {
      this.$emit('downloadShareLeger')
    },
    handleClose(done) {
      this.$emit('closeDialog')
      done()
    },
    open() {
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
