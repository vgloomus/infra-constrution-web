<template>
  <div class="upload-progress">
    <div class="icon">
      <i
        v-if="!this.isComplete"
        class="icon-loading"
      ></i>
      <i
        v-else
        class="el-icon-success"
        color="#52C41A"
      ></i>
    </div>
    <div class="info">
      <div class="name">{{ fileName }}</div>
      <div class="progress">
        <el-progress
          :percentage="progress"
          :status="this.isComplete ? 'success' : null"
          :show-text="false"
        ></el-progress>
      </div>
    </div>
    <div
      class="delete-icon"
      @click="handleDelete"
    >
      <i class="el-icon-delete"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    fileName: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      required: true
    },
    isComplete: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    handleDelete() {
      this.$emit('delete')
    }
  }

}
</script>

<style lang="scss" scoped>
  @keyframes rotateAnimation {
    from {
      transform: rotate(0deg); /* 动画开始时，元素旋转0度 */
    }
    to {
      transform: rotate(360deg); /* 动画结束时，元素旋转360度 */
    }
  }

  .upload-progress {
    display: flex;
    justify-content: center;
    width: 679px;
    height: 40px;
    border-radius: 6px;
    padding: 7px 10px;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
    margin-bottom: 8px;
    position: relative;
  }

  .icon {
    margin-top: 2px;
    margin-right: 8px;

    .icon-loading {
      animation: rotateAnimation 2s linear infinite;
    }

    .el-icon-success {
      color: #67c23a;
      font-size: 14px;
    }
  }

  .info {
    flex: 1;
    .name {
      color: #1677ff;
      font-size: 14px;
    }

    .progress {
      width: 100%;
    }
  }

  .delete-icon {
    position: absolute;
    right: 10px;
    cursor: pointer;
    visibility: hidden;
  }

  .upload-progress:hover .delete-icon {
    visibility: visible;
  }

  ::v-deep {
    .el-progress.is-success .el-progress-bar__inner {
      background-color: #1677ff;
    }
  }
</style>
