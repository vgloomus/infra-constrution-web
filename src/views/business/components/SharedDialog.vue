<!--
 * @author: lvzj
 * @Date: 2024-06-24 16:08:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-31 16:15:32
 * @description: file content
-->
<template>
  <el-dialog
    :title="$t('shareLink')"
    :visible.sync="dialogVisible"
    width="800px"
    top="20vh"
    @open="open"
  >
    <div v-loading="loading">
      <div
        v-if="isSuccess"
        class="state"
      >
        <i class="el-icon-success"></i>
        {{ $t('successCreatedLink') }}
      </div>
      <el-input
        v-model="shareUrl"
        :disabled="true"
      ></el-input>
    </div>
    <span slot="footer">
      <div class="footer-btn">
        <el-button
          type="default"
          class="default-btn"
          @click="dialogVisible = false"
        > {{ $t('cancel') }}</el-button>
        <el-button
          type="primary"
          @click="copy"
        >{{ $t('copy') }}</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import { getReceiveShareCode, getComparisonDownload, mergeDrawing } from '@/api/business'
import { copyToClipboard } from '@/utils/index'
import { mapState } from 'vuex'
export default {
  name: 'SharedDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: [Number, String],
      default: ''
    },
    tree: Array,
    name: String,
    homeView: Object,
    type: Number
  },
  data() {
    return {
      loading: false,
      shareUrl: '',
      isSuccess: false
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
      const params = {
        bizId: this.taskId,
        catalogs: this.tree,
        bizName: this.name,
        homeView: this.homeView,
        type: this.type
      }
      this.loading = true
      const api = this.type === 1 ? mergeDrawing : getComparisonDownload
      const args = this.type === 1 ? this.taskId : [this.taskId]
      await api(this.projectId, args)
      getReceiveShareCode(this.projectId, params).then(data => {
        const shareCode = data?.data || ''
        this.isSuccess = true
        const baseUrl = window.location.origin
        const router = this.type === 1 ? 'measurementReceiverShare' : 'sectionComparisonShare'
        this.shareUrl = `${baseUrl}/bimtwins/infra-construction-web/business/${router}?shareCode=${shareCode}`
      }).finally(() => {
        this.loading = false
      }).catch(() => {
        this.isSuccess = false
      })
    },
    copy() {
      copyToClipboard(this.shareUrl)
      this.$message({
        message: '分享链接复制成功',
        type: 'success'
      })
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-icon-success {
    color: #67c23a;
    font-size: 14px;
    margin-right: 5px;
  }
</style>
