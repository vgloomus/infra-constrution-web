<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-12-12 09:44:44
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-12 14:25:16
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\RemovePopover.vue
 * @Description: 移除恢复组件
-->
<template>
  <div class="remove-popover">
    <el-popover
      placement="bottom"
      v-model="visible"
    >
      <el-checkbox-group v-model="checkList">
        <div
          class="remove-popover-item"
          v-for="item in list"
          :key="item.id"
        >
          <el-checkbox :label="item.id">{{ item.name}}</el-checkbox>
          <div
            v-if="item.children && item.children.length > 0"
            class="children"
          >
            <div
              class="remove-popover-item-child"
              v-for="child in item.children"
              :key="child.id"
            >{{child.name}}</div>
          </div>
        </div>
      </el-checkbox-group>
      <div class="remove-popover-btns">
        <el-button
          size="mini"
          type="text"
          @click="visible = false"
        >{{ $t('cancel')}}</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="checkList.length === 0"
          @click="restore"
        >{{ $t('restore')}}</el-button>
      </div>
      <el-button
        :disabled="list.length === 0"
        slot="reference"
        class="btn"
      >
        <i class="icon-folder"></i>{{ $t('removed') }}
        <span
          v-if="list.length > 0"
          class="doc"
        ></span>
      </el-button>
    </el-popover>
  </div>
</template>

<script>

export default {
  name: 'RemovePopover',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      checkList: []
    }
  },
  methods: {
    restore() {
      this.$emit('restoreHandle', this.checkList)
      this.visible = false
      this.checkList = []
    }
  }
}
</script>

<style lang="scss" scoped>
  .remove-popover {
    position: absolute;
    z-index: 100;
    .btn {
      position: relative;
    }
    .doc {
      display: inline-block;
      position: absolute;
      top: 2px;
      right: 2px;
      width: 6px;
      height: 6px;
      background: #f56c6c;
      border-radius: 50%;
    }
  }
</style>
<style>
  .remove-popover-btns {
    padding-top: 10px;
    text-align: right;
    margin-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }
  .remove-popover-item {
    line-height: 28px;
    color: #595959;
    font-size: 14px;
  }
  .remove-popover-item-child {
    padding-left: 24px;
    font-size: 14px;
  }
</style>
