<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-10-26 15:30:19
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-06 09:18:28
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\EditInput.vue
 * @Description: 名称编辑输入框
-->
<template>
  <div class="edit-input">
    <el-input
      v-if="isEditing"
      ref="nameInput"
      :value="value"
      @input="(val) => $emit('input', val)"
      :disabled="disable"
      class="name-input dark"
      :maxlength="50"
      :placeholder="placeholder"
    >
      <template #suffix>
        <span>
          <i
            class="el-icon-check"
            @click="confirmEdit()"
          ></i>
          <i
            class="el-icon-close"
            @click="cancelEdit()"
          ></i>
        </span>
      </template>
    </el-input>
    <div
      v-else
      class="name-display"
    >
      <span :title="value">{{ value }}</span>
      <i
        class="el-icon-edit edit-icon"
        @click="startEdit"
      ></i>
    </div>
  </div>
</template>
<script>

export default {
  name: 'EditInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    originalName: {
      type: String,
      default: ''
    },
    disable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入任务名称'
    }
  },
  data() {
    return {
      isEditing: true
    }
  },
  methods: {
    // 确认编辑
    confirmEdit() {
      this.$emit('update:originalName', this.value)
      this.isEditing = false
    },
    // 取消编辑
    cancelEdit() {
      this.$emit('input', this.originalName)
      this.isEditing = false
    },
    // 开始编辑
    startEdit() {
      this.isEditing = true
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.nameInput) {
            this.$refs.nameInput.focus()
          }
        }, 300)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .edit-input {
    .name-input {
      width: 350px;
      margin-right: 10px;
      border: 1px solid #1677ff;
      border-radius: 5px;
      ::v-deep {
        .el-input__inner {
          padding-right: 42px;
        }

        .el-input__suffix {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
      }
    }

    .edit-icon {
      margin-left: 8px;
      visibility: hidden;
    }
    .name-display {
      max-width: 350px;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        display: inline-block;
        width: calc(100% - 20px);
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .edit-icon {
        margin-left: 8px;
        // color: #1677ff;
        cursor: pointer;
        visibility: hidden;
      }
    }
    .el-icon-check,
    .el-icon-close {
      margin-left: 4px;
    }
    .name-display:hover .edit-icon {
      visibility: visible;
    }
  }
</style>
