<template>
  <el-dialog
    :title="$t('addNew')"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="1152px"
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
        v-if="!listIsLoading && tableData.length === 0"
      />
      <div v-else>
        <el-tabs v-model="activeTab">
          <el-tab-pane
            :label="$t('addQuantityDialog.measurement')"
            name="measurement"
          >
            <el-table
              ref="multipleTable"
              :data="tableData"
              :header-cell-class-name="tableHeaderCellClassName"
              class="dialog-table"
              tooltip-effect="dark"
              @selection-change="handleSelectionChange"
              row-key="id"
            >
              <div slot="empty">
                <div v-if="tableData.length == 0">
                  <span class="empty-text">
                    <p></p>
                  </span>
                </div>
              </div>
              <el-table-column
                type="selection"
                reserve-selection
                width="48"
              >
              </el-table-column>
              <el-table-column
                :label="$t('collectDate')"
                width="292"
              >
                <template slot-scope="scope">{{ scope.row.collectStartDate }} ~ {{ scope.row.collectEndDate }}</template>
              </el-table-column>
              <el-table-column
                prop="name"
                :label="$t('name')"
                width="292"
              >
              </el-table-column>
              <el-table-column
                prop="id"
                :label="$t('id')"
                width="292"
                show-overflow-tooltip
              >
              </el-table-column>
              <el-table-column
                prop="updateTime"
                :label="$t('updateTime')"
                width="170"
              >
              </el-table-column>
              <el-table-column width="46">
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane
            :label="$t('addQuantityDialog.sectionComparison')"
            name="comparison"
          >
            <el-table
              ref="multipleTable"
              :data="tableData"
              :header-cell-class-name="tableHeaderCellClassName"
              class="dialog-table"
              tooltip-effect="dark"
              @selection-change="handleSelectionChange"
              row-key="id"
            >
              <div slot="empty">
                <div v-if="tableData.length == 0">
                  <span class="empty-text">
                    <p></p>
                  </span>
                </div>
              </div>
              <el-table-column
                type="selection"
                reserve-selection
                width="48"
              >
              </el-table-column>
              <el-table-column
                :label="$t('collectDate')"
                width="292"
              >
                <template slot-scope="scope">{{ scope.row.collectStartDate }} ~ {{ scope.row.collectEndDate }}</template>
              </el-table-column>
              <el-table-column
                prop="name"
                :label="$t('name')"
                width="292"
              >
              </el-table-column>
              <el-table-column
                prop="id"
                :label="$t('id')"
                width="292"
                show-overflow-tooltip
              >
              </el-table-column>
              <el-table-column
                prop="updateTime"
                :label="$t('updateTime')"
                width="170"
              >
              </el-table-column>
              <el-table-column width="46">
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <el-pagination
      class="dialog-pagination"
      type='manual'
      layout="sizes, ->, total,prev, pager, next"
      :total="page1.total"
      :page-size="page1.pageSize"
      :current-page="page1.currentPage"
      @current-change="SCHandlePageChange"
      @size-change="SCHandleSizePageChange"
      :disabled="listIsLoading"
    >
    </el-pagination>
    <div class="section-comparison-base">
      <span class="note">注：最多选择1个测量收方任务和1个两期对比任务作为工程量来源，未涵盖的工程量需要人工填报。</span>
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
import moment from 'moment'
import { getReceiveList } from '@/api/business'

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
    }
  },
  data() {
    return {
      selectedRadio: null,
      selectedItems: [],
      tableData: [],
      activeTab: 'measurement',
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
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    // 隐藏全选框
    tableHeaderCellClassName() {
      return ({ columnIndex }) => {
        if (columnIndex === 0) {
          return 'selectAllBtnDis'
        }
      }
    }
  },
  methods: {
    // 获取断面收方列表页面数据
    querySectionComparisonList() {
      this.listIsLoading = true
      const params = {
        current: this.page1.currentPage,
        size: this.page1.pageSize,
        status: 3,
        startDate: this.startDate,
        endDate: this.endDate,
        type: 1
      }
      getReceiveList(this.projectId, params).then(data => {
        this.disable = false
        this.page1.total = data?.total
        this.page1.pageSize = data?.size
        this.listIsLoading = false
        // 拿到数据后，将数据赋值给tableData
        this.tableData = data?.records?.map(record => {
          return {
            name: record?.name,
            updateTime: moment(record?.updateTime).format('YYYY-MM-DD') || '',
            id: record?.id,
            collectStartDate: moment(record?.collectStartDate).format('YYYY-MM-DD') || '',
            collectEndDate: moment(record?.collectEndDate).format('YYYY-MM-DD') || ''
          }
        }) || []
        this.listIsLoading = false
      }).catch(error => {
        this.listIsLoading = false
        console.error('获取断面对比列表页数据失败:', error)
      })
    },
    // 断面对比打开分享弹框
    handleOpenDialog() {
      this.querySectionComparisonList()
    },
    // x关闭弹窗
    handleCloseDialog() {
      this.dialogVisible = false
      this.resetTable()
      this.page1.currentPage = 1
      this.page1.pageSize = 10
      this.page1.total = 0
    },
    // 断面对比弹窗，确定按钮
    handleConfirm() {
      if (!this.selectedRadio) {
        this.$message.error('请选择收方基准')
        return
      }
      if (this.selectedItems.length < 2) {
        this.$message.error('请选择2个测量收方任务')
        return
      }
      this.$emit('update:dialogVisible', false)
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
    },
    // 多选框勾选事件
    handleSelectionChange(selection) {
      // 只保留最后勾选的两个选项
      if (selection.length > 2) {
        // 取消勾选第一个选中的选项
        const firstSelected = selection[0]
        this.$refs.multipleTable.toggleRowSelection(firstSelected, false)
        selection.shift()
      }
      this.selectedItems = selection
      // 如果选中的选项有两个，则默认选中日期较新的选项
      if (this.selectedItems.length > 0) {
        const closestItem = this.selectedItems.reduce((prev, curr) => {
          return new Date(prev.collectStartDate) > new Date(curr.collectStartDate) ? prev : curr
        })
        // 检查两个日期是否相同
        const allDatesSame = this.selectedItems.every(item => new Date(item.collectStartDate).getTime() === new Date(closestItem.collectStartDate).getTime())
        if (allDatesSame) {
          this.changeRadioSelected(null) // 如果日期相同，则不选中任何一个
        } else {
          this.changeRadioSelected(closestItem.id) // 否则选中日期较新的选项
        }
      }
    },
    // 切换收方基准
    changeRadioSelected(val) {
      this.selectedRadio = val
    },
    // 断面对比分页切换获取数据
    SCHandlePageChange(page) {
      this.page1.currentPage = page
      this.querySectionComparisonList()
    },
    // 断面对比切换每页条数
    SCHandleSizePageChange(page) {
      this.page1.pageSize = page
      this.querySectionComparisonList()
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
  }
</style>
