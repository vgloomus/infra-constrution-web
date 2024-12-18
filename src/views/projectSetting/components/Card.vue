<template>
  <el-card
    v-show="!isCollapse"
    :class="['card', { active: isActive }]"
    @click.native="handleCardClick"
    @mouseenter.native="handleMouseEnter"
    @mouseleave.native="handleMouseLeave"
    :request-type="requestType"
  >
    <div
      class="card-header"
      v-if="transformStatus === 0"
    >
      <el-tooltip
        v-if="isTextOverflowing"
        class="item"
        effect="dark"
        :content="title"
        placement="right"
      >
        <span
          ref="title"
          class="title"
        >{{ title }}</span>
      </el-tooltip>

      <span
        v-else
        ref="title"
        class="title"
      >
        {{ title }}
      </span>
      <el-tooltip placement="right">
        <template slot="content">
          <span :style="{ width: '50px', whiteSpace: 'normal' }">{{ tooltipContent }}</span>
        </template>
        <el-switch
          :width="50"
          :value="localSwitchModel"
          :inactive-text="$t('card.enable')"
          active-color="#1677FF"
          @change="handleSwitchChange"
          @click.native.stop
        />
      </el-tooltip>
    </div>
    <div
      class="card-header"
      v-if="transformStatus !== 0"
    >
      <el-tooltip
        v-if="isTextOverflowing"
        class="item"
        effect="dark"
        :content="title"
        placement="right"
      >
        <span
          ref="title"
          class="transform-title"
        >
          <span
            class="transforming"
            v-if="transformStatus === 2"
          >
            <span class="status">{{ $t('card.transforming') }}</span>
          </span>
          <span
            class="transforming"
            v-else-if="transformStatus === 1"
          >
            <span class="status">{{ $t('card.queuing') }}</span>
          </span>
          <span
            class="transform-error"
            v-if="transformStatus === 4 || transformStatus === 5"
          >
            <span class="status">{{ $t('card.transformFailed') }}</span>
          </span>
          {{ title }}
        </span>
      </el-tooltip>

      <span
        v-else
        ref="title"
        class="transform-title"
      >
        <span
          class="transforming"
          v-if="transformStatus === 2"
        >
          <span class="status">{{ $t('card.transforming') }}</span>
        </span>
        <span
          class="transforming"
          v-else-if="transformStatus === 1"
        >
          <span class="status">{{ $t('card.queuing') }}</span>
        </span>
        <span
          class="transform-error"
          v-if="transformStatus === 4 || transformStatus === 5"
        >
          <span class="status">{{ $t('card.transformFailed') }}</span>
        </span>
        {{ title }}
      </span>
    </div>
    <div class="card-body">
      <div class="top">
        <div class="id">ID: {{ id }}</div>
        <i
          v-show="showCopyIcon"
          class="icon-copy"
          @click.stop="handleCopy"
        ></i>
      </div>
      <div class="bottom">
        <div class="update-time">{{ updateTimeLabel }}: {{ updateTime }}</div>
        <el-dropdown
          @command="handleAction"
          trigger="click"
          @click.native.stop
          :hide-on-click="false"
        >
          <div
            class="el-dropdown-link operate"
            v-if="transformStatus === 0"
          ></div>
          <!-- 图纸管理展示不展示下拉框 -->
          <el-dropdown-menu
            slot="dropdown"
            v-if="$slots['dropdown-menu']"
          >
            <slot name="dropdown-menu"></slot>
            <el-popconfirm
              class="item"
              effect="dark"
              placement="top-start"
              :title="$t('confirmDelete')"
              :cancel-button-text="$t('cancel')"
              :confirm-button-text="$t('confirm')"
              @confirm="handleDelete"
            >
              <el-dropdown-item
                slot="reference"
                command="delete"
              >{{ $t('delete') }}</el-dropdown-item>
            </el-popconfirm>
          </el-dropdown-menu>
        </el-dropdown>
        <i
          class="icon-delete-card"
          v-if="transformStatus === 4 || transformStatus === 5"
          @click.stop="deleteDrawing"
        ></i>
      </div>
    </div>
  </el-card>
</template>

<script>
import { enableDrawing, enableTemplate } from '@/api/projectSetting'
export default {
  props: {
    title: String,
    id: {
      type: [String, Number] // 允许 id 既可以是字符串也可以是数字
    },
    updateTime: String,
    isCollapse: Boolean,
    isActive: Boolean,
    switchModel: Boolean,
    tooltipContent: String,
    switchInactiveText: String,
    updateTimeLabel: String,
    requestType: String,
    transformStatus: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      localSwitchModel: this.switchModel,
      isTextOverflowing: false,
      showCopyIcon: false
    }
  },
  mounted() {
    this.checkTextOverflow()
    window.addEventListener('resize', this.checkTextOverflow)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkTextOverflow)
  },
  watch: {
    switchModel(newVal) {
      this.localSwitchModel = newVal
    }
  },
  methods: {
    handleCardClick() {
      this.$emit('card-click')
    },
    handleCopy() {
      this.$emit('copy')
    },
    async handleSwitchChange(value) {
      this.localSwitchModel = value
      try {
        if (this.requestType === 'drawing') {
          await enableDrawing(this.$store.state.projectId, this.id, value)
        } else if (this.requestType === 'recipientTemplate') {
          await enableTemplate(this.$store.state.projectId, this.id, value)
        }
        this.$emit('switch-change', value) // 通知父组件开关状态的变化
      } catch (error) {
        this.$message.error('状态更新失败')
        this.localSwitchModel = !value // 回滚状态
      }
    },
    handleAction(command) {
      // 根据 command 的不同类型进行处理
      if (command === '删除') {
        this.$emit('delete', this.id) // 发出删除事件，并传递当前卡片的 ID
      } else if (command === 'edit') {
        this.$emit('edit', this.id) // 发出编辑事件，并传递当前卡片的 ID
      } else {
        // 如果有其他命令，也可以在这里处理
        this.$emit('action', command)
      }
    },
    checkTextOverflow() {
      const titleElement = this.$refs.title
      if (titleElement) {
        this.isTextOverflowing = titleElement.scrollWidth > titleElement.clientWidth
      }
    },
    handleMouseEnter() {
      this.showCopyIcon = true
    },
    handleMouseLeave() {
      this.showCopyIcon = false
    },
    deleteDrawing() {
      this.$emit('delete-drawing', this.id) // 发出删除事件，并传递当前卡片的 ID
    },
    // 下拉框点删除后出现的弹窗，点确定触发
    handleDelete() {
      this.$emit('delete', this.id) // 发出删除事件，并传递当前卡片的 ID
    }
  }
}
</script>

<style lang="scss" scoped>
  .card {
    width: 268px;
    margin: 16px 16px -8px 16px;
    background: #2e343e;
    border-radius: 6px;
    border: 1px solid #2e343e;
    position: relative;

    &:hover {
      background: #434d5a;
      cursor: pointer;
    }

    &.active {
      background: rgba(22, 119, 255, 0.3);
    }

    .card-header {
      display: flex;
      width: 255px;
      align-items: center;

      .title {
        width: 186px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        font-weight: 500;
        margin-right: 8px;
      }

      .transform-title {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: rgba(255, 255, 255, 0.85);
        font-size: 14px;
        font-weight: 500;
        margin-right: 8px;

        .transforming {
          width: 62px;
          height: 22px;
          border-radius: 4px;
          padding: 0px 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-right: 8px;

          .status {
            width: 46px;
            height: 20px;
            color: rgba(255, 255, 255, 0.85);
            font-size: 12px;
          }
        }

        .transform-error {
          width: 62px;
          height: 22px;
          border-radius: 4px;
          padding: 0px 8px;
          background: #2a1215;
          border: 1px solid #58181c;
          margin-right: 8px;

          .status {
            width: 48px;
            height: 20px;
            color: #e84749;
            font-size: 12px;
          }
        }
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
          margin-right: 2px;
          font-size: 12px;
        }
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
        .update-time {
          font-size: 12px;
        }
        .operate {
          width: 20px;
          height: 20px;
          background: url("../../../assets/images/operate.png") no-repeat top left /
            20px 20px;
          background-size: cover;
          cursor: pointer;
        }
      }
    }
  }

  ::v-deep {
    .el-dropdown-menu {
      border: none;
      background: transparent;
    }
  }
</style>
