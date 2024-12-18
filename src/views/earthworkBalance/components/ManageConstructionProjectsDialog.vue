<template>
  <el-dialog
    :title="$t('addQuantityDialog.manageSubItems')"
    :visible.sync="manageDialogVisible"
    :close-on-click-modal="false"
    width="500px"
    height="500px"
    @open="handleOpenDialog"
    @close="handleCloseDialog"
  >
    <div
      v-loading="listIsLoading"
      :element-loading-text="$t('loading')"
      :spinner="'el-icon-loading'"
    >
      <no-content
        element-loading-background="rgba(0, 0, 0, 0.8)"
        v-if="!listIsLoading && treeData.length === 0"
      />
      <div v-else>
        <el-tabs
          v-model="activeTab"
          class="el-tree-container"
        >
          <el-tab-pane
            :label="$t('addQuantityDialog.cutFillArea')"
            name="cutFillArea"
          >
            <el-tree
              :data="treeData.cutFillArea"
              show-checkbox
              node-key="id"
              :props="treeProps"
              default-expand-all
              :loading="listIsLoading"
            ></el-tree>
          </el-tab-pane>

          <el-tab-pane
            :label="$t('addQuantityDialog.borrow')"
            name="borrow"
          >
            <el-tree
              :data="treeData.borrow"
              show-checkbox
              node-key="id"
              :props="treeProps"
              default-expand-all
              :loading="listIsLoading"
            ></el-tree>
          </el-tab-pane>

          <el-tab-pane
            :label="$t('addQuantityDialog.spoil')"
            name="spoil"
          >
            <el-tree
              :data="treeData.spoil"
              show-checkbox
              node-key="id"
              :props="treeProps"
              default-expand-all
              :loading="listIsLoading"
            ></el-tree>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="handleCloseDialog"
        size="small"
      >{{ $t('cancel') }}</el-button>
      <el-button
        type="primary"
        size="small"
        @click="handleConfirm"
      >{{ $t('confirm') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  props: {
    projectId: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    },
    startDate: {
      type: Number
    },
    endDate: {
      type: Number
    },
    treeData: {
      type: Object,
      default: () => ({
        cutFillArea: [],
        borrow: [],
        spoil: []
      })
    }
  },
  data() {
    return {
      selectedRadio: null,
      selectedItems: [],
      tableData: [],
      subItemData: [],
      treeProps: {
        children: 'children',
        label: 'label'
      },
      activeTab: 'cutFillArea',
      listIsLoading: true,
      page1: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  mounted() {
    console.log('AddQuantitiesDialog mounted', this.startDate, this.endDate)
  },
  computed: {
    manageDialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  methods: {
    // 断面对比打开分享弹框
    handleOpenDialog() {
      this.listIsLoading = false
    },
    // x关闭弹窗
    handleCloseDialog() {
      this.manageDialogVisible = false
      this.resetTable()
      this.page1.currentPage = 1
      this.page1.pageSize = 10
      this.page1.total = 0
    },
    // 施工子项弹窗，确定按钮
    handleConfirm() {
      if (!this.selectedRadio) {
        this.$message.error('请选择收方基准')
        return
      }
      if (this.selectedItems.length < 2) {
        this.$message.error('请选择2个测量收方任务')
        return
      }
      this.$emit('update:manageDialogVisible', false)
      // 新建对比数据 确定
      const selectedIndex = this.selectedItems.findIndex(item => item.id === this.selectedRadio)
      const selectedItem = this.selectedItems[selectedIndex]
      const otherItem = this.selectedItems[selectedIndex === 0 ? 1 : 0]
      const preTaskId = otherItem.id
      const postTaskId = selectedItem.id
      const postTaskName = selectedItem.name
      const preTaskName = otherItem.name
      const dates = [selectedItem.collectStartDate, selectedItem.collectEndDate, otherItem.collectStartDate, otherItem.collectEndDate].sort((a, b) => new Date(a) - new Date(b))
      this.$router.push({
        path: '/business/sectionComparisonEdit',
        query: {
          type: 'add',
          name: `${postTaskName}对比${preTaskName}`,
          preTaskId,
          postTaskId,
          gatherDate: `${dates[0]}-${dates[3]}`
        }
      })
      this.resetTable()
    },
    // 重置表格
    resetTable() {
      this.$refs.multipleTable.clearSelection()
      this.tableData = []
      this.selectedItems = []
      this.selectedRadio = null
      this.listIsLoading = true
    }

  }
}
</script>

<style lang="scss" scoped>
  .section-comparison-base {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .note {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  .el-tree-container {
    height: 400px;
  }

  ::v-deep {
    .selectAllBtnDis .cell {
      visibility: hidden;
    }
    .dialog-table {
      height: 400px;
    }
    .radio-item {
      display: inline-block;
      margin-right: 16px;
      max-width: 100px; /* 根据需要调整最大宽度 */
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .el-input.el-input--suffix.el-input--mini .el-input__inner {
      border: 1px solid #d9d9d9;
    }
    .el-radio__label {
      padding-left: 3px;
    }
    .el-checkbox .el-checkbox__input .el-checkbox__inner {
      border-color: #1677ff;
    }
    .el-tree-node {
      color: rgba(0, 0, 0, 0.88);
    }
  }
</style>
