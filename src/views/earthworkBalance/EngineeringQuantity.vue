<template>
  <div
    class="container"
    v-loading="disable"
    :element-loading-text="$t('loading')"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <div :class="['left-area', { collapsed: isCollapsed }]">
      <div class="top-section">
        <div v-if="!isCollapsed">
          <div class="title">
            <div class="time">时间列表</div>
            <i
              :class="isCollapsed ? 'icon-fold-right' : 'icon-fold-left'"
              @click="toggleCollapse"
            ></i>
          </div>
        </div>
        <div v-else>
          <div class="title1">
            <i
              :class="isCollapsed ? 'icon-fold-right' : 'icon-fold-left'"
              @click="toggleCollapse"
            ></i>
            <div class="time">时间列表</div>
          </div>
        </div>
        <div v-if="!isCollapsed">
          <div class="buttonContainer">
            <el-button
              @click="open"
              class="cancelButton"
            >工期设置</el-button>
          </div>
          <div class="middle-section">
            <el-radio-group v-model="cycleMode">
              <el-radio-button label="1">按月统计</el-radio-button>
              <el-radio-button label="2">按周统计</el-radio-button>
            </el-radio-group>
          </div>
          <no-content
            element-loading-background="rgba(0, 0, 0, 0.8)"
            v-if="rangeTimeList.length === 0"
          />
          <div v-else>
            <div class="bottom-section">
              <ul>
                <li
                  v-for="item in rangeTimeList"
                  :key="item.id"
                  @click="handleTimePeriodClick(item)"
                >
                  <div class="date">
                    <span class="value">{{ item.displayDate }}</span>
                    <i
                      v-if="!item.hasData"
                      class="icon-error"
                    ></i>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <no-content
      element-loading-background="rgba(0, 0, 0, 0.8)"
      v-if="rangeTimeList.length === 0"
    />

    <template v-else>
      <div class="right-area">
        <div class="right-side">
          <!-- 右侧内容 -->
          <div class="top-buttons">
            <div class="left">
              <el-button
                @click="addQuantity"
                type="primary"
              >添加工程量</el-button>
              <el-button @click="manageSubItems">管理施工子项</el-button>
            </div>
            <div class="right">
              <el-button
                @click="saveData"
                type="primary"
              >保存</el-button>
            </div>
          </div>
          <div class="bottom-table">
            <div class="excel">
              <template v-for="item in tabList">
                <ExcelComponentEQStatics
                  v-show="tab === item.value && excelConfig"
                  v-if="excelConfig"
                  :ref="item.value"
                  :key="item.value"
                  :type="item.value"
                  :data="excelConfig[`${item.value}Data`]"
                  :config="excelConfig[item.value]"
                  @onMergeChange="onMergeChange"
                />
              </template>
            </div>
            <div class="bottomContainer">
              <div class="tabs">
                <span
                  v-for="item in tabList"
                  :key="item.value"
                  @click="tab = item.value"
                  :class="['tab-item', { active: tab === item.value }]"
                >{{item.label}}
                  <i
                    class="icon-error"
                    v-if="item.errors.length"
                  />
                </span>
              </div>
              <div class="quantity-legend">
                <div class="date">采集日期:2024-08-29 ～ 2024-09-30</div>
                <div class="legend-container">
                  <div class="legend-item">
                    <div
                      class="color"
                      style="background-color: #E0EDFD;"
                    ></div>
                    <div class="text">区域管理</div>
                  </div>
                  <div class="legend-item">
                    <div
                      class="color"
                      style="background-color: #EAFAF1;"
                    ></div>
                    <div class="text">测量收方</div>
                  </div>
                  <div class="legend-item">
                    <div
                      class="color"
                      style="background-color: #FFF9E3;"
                    ></div>
                    <div class="text">两期对比</div>
                  </div>
                  <div class="legend-item">
                    <div
                      class="color"
                      style="background-color: #FFFFFF;"
                    ></div>
                    <div class="text">人工填报</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <el-dialog
      :visible.sync="showDialog"
      title="工期设置"
    >
      <span class="construction"><span class="period">*</span>施工时段：</span>
      <el-date-picker
        v-model="constructionPeriod"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleDateChange"
      ></el-date-picker>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          @click="showDialog = false"
          class="cancelButton"
        >取消</el-button>
        <el-button
          type="primary"
          @click="saveConstructionPeriod"
        >确定</el-button>
      </span>
    </el-dialog>
    <AddQuantitiesDialog
      :project-id="projectId"
      :visible.sync="dialogVisible"
      :startDate="adjustedPeriodUnix[0]"
      :endDate="adjustedPeriodUnix[1]"
    />
    <ManageConstructionProjectsDialog
      :project-id="projectId"
      :visible.sync="manageDialogVisible"
      :startDate="adjustedPeriodUnix[0]"
      :endDate="adjustedPeriodUnix[1]"
      :treeData="treeData"
    />
  </div>
</template>
<script>
import ExcelComponentEQStatics from './components/ExcelComponentEQStatics.vue'
import engineeringQuantityConfig from './components/engineeringQuantityConfig'
import AddQuantitiesDialog from './components/AddQuantitiesDialog.vue'
import ManageConstructionProjectsDialog from './components/ManageConstructionProjectsDialog.vue'
import { mapState } from 'vuex'
import { getRangeTimeList, getQuantityList, saveRangeTime, getQuantityTableData, saveQuantityTableData, getSubitemList } from '@/api/earthworkBalance'
import moment from 'moment'

export default {
  name: 'EngineeringQuantity',
  components: {
    ExcelComponentEQStatics,
    AddQuantitiesDialog,
    ManageConstructionProjectsDialog
  },
  data() {
    return {
      disable: false,
      showDialog: false,
      dialogVisible: false,
      manageDialogVisible: false,
      initPeriod: [],
      initPeriodUnix: [],
      adjustedPeriodUnix: [],
      constructionPeriod: [],
      fullIdToCheckedMap: {},
      tab: 'cutFillArea',
      // 树形结构数据
      treeData: {
        cutFillArea: [],
        borrow: [],
        spoil: []
      },
      indexedDBIns: null,
      timer: null,
      excelConfig: null,
      cycleMode: 1,
      rangeTimeList: [],
      isCollapsed: false,
      tabList: [],
      saveTableDataList: {}
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  mounted() {
    this.indexedDBIns = this.$localForage.createInstance({
      name: 'regionalEQStatics'
    })
  },
  watch: {
    cycleMode() {
      // this.adjustPeriodUnix()
      this.getQuantityList()
    }
  },
  methods: {
    open() {
      this.showDialog = true
      this.getRangeTimeList()
    },
    // 获取默认显示的施工时段
    getRangeTimeList() {
      getRangeTimeList(this.projectId).then(res => {
        const startDate = res?.startDate ? moment(res.startDate * 1000).format('YYYY-MM-DD') : ''
        const endDate = res?.endDate ? moment(res.endDate * 1000).format('YYYY-MM-DD') : ''
        this.constructionPeriod = [startDate, endDate]
        // 保存初始施工时段
        this.initPeriod = [startDate, endDate]
        // 保存初始施工时段的unix时间戳
        this.initPeriodUnix = [res?.startDate, res?.endDate]
      })
    },
    // 调整时间戳
    // adjustPeriodUnix() {
    //   const adjustment = this.cycleMode === 1 ? 7 * 24 * 60 * 60 : 3 * 24 * 60 * 60
    //   const adjustedStartDate = this.initPeriodUnix[0] - adjustment
    //   const adjustedEndDate = this.initPeriodUnix[1] + adjustment
    //   this.adjustedPeriodUnix = [adjustedStartDate, adjustedEndDate]
    //   console.log('adjustedPeriodUnix', this.initPeriodUnix[0], this.adjustedPeriodUnix, adjustment)
    // },
    // 获取工程量时间列表
    async getQuantityList() {
      try {
        const res = await getQuantityList(this.projectId, { cycleMode: this.cycleMode })

        // 处理返回的时间列表数据
        this.rangeTimeList = res.map(item => {
          const startDate = item?.startDate ? moment(item.startDate * 1000).format('YYYY-MM-DD') : ''
          const endDate = item?.endDate ? moment(item.endDate * 1000).format('YYYY-MM-DD') : ''
          return {
            ...item,
            displayDate: `${startDate} ～ ${endDate}`
          }
        })

        // 获取第一条数据的id，并调用getQuantityTableData方法请求表格数据
        if (this.rangeTimeList.length > 0) {
          const firstId = this.rangeTimeList[0].id
          // 保存进入页面最近一条的施工时段
          this.initPeriodUnix = [this.rangeTimeList[0].startDate, this.rangeTimeList[0].endDate]

          // 等待第一个请求完成后，再进行第二个请求
          await this.getQuantityTableData(firstId) // 等待getQuantityTableData完成
          await this.querySubitemList(firstId) // 在第一个请求完成后执行第二个请求
        }
      } catch (error) {
        console.error('获取工程量时间列表或数据失败', error)
      }
    },
    handleTimePeriodClick(item) {
      this.getQuantityTableData(item.id)
    },
    // 查询工程量表格数据
    async getQuantityTableData(id) {
      try {
        const data = await getQuantityTableData(this.projectId, id)
        console.log('statics', data)

        // 处理挖填方数据
        const cutFillAreaData = data.excavationFillQuantities.map(item => ({
          regionName: item.regionName,
          subItemName: item.name,
          regionType: item.regionTypeId === 1 ? '挖方区' : '填方区',
          designVolume: item.designVolume ? this.formatCellData(item.designVolume) : null,
          designEarthVolume: item.designEarthVolume ? this.formatCellData(item.designEarthVolume) : null,
          designStoneVolume: item.designStoneVolume ? this.formatCellData(item.designStoneVolume) : null,
          accumulatedVolume: item.accumulatedVolume ? this.formatCellData(item.accumulatedVolume) : null,
          accumulatedEarthVolume: item.accumulatedEarthVolume ? this.formatCellData(item.accumulatedEarthVolume) : null,
          accumulatedStoneVolume: item.accumulatedStoneVolume ? this.formatCellData(item.accumulatedStoneVolume) : null,
          currentVolume: item.currentVolume ? this.formatCellData(item.currentVolume) : null,
          currentEarthVolume: item.currentEarthVolume ? this.formatCellData(item.currentEarthVolume) : null,
          currentStoneVolume: item.currentStoneVolume ? this.formatCellData(item.currentStoneVolume) : null,
          remainVolume: item.remainVolume ? this.formatCellData(item.remainVolume) : null,
          remainEarthVolume: item.remainEarthVolume ? this.formatCellData(item.remainEarthVolume) : null,
          remainStoneVolume: item.remainStoneVolume ? this.formatCellData(item.remainStoneVolume) : null
        }))
        console.log('cutFillAreaData', cutFillAreaData)

        // 处理借土场数据
        const borrowData = data.debitQuantities.map(item => ({
          regionName: item.regionName,
          subItemName: item.name,
          maxMiningVolume: item.maxMiningVolume ? this.formatCellData(item.maxMiningVolume) : null,
          maxMiningEarthVolume: item.maxMiningEarthVolume ? this.formatCellData(item.maxMiningEarthVolume) : null,
          maxMiningStoneVolume: item.maxMiningStoneVolume ? this.formatCellData(item.maxMiningStoneVolume) : null,
          accumulatedVolume: item.accumulatedVolume ? this.formatCellData(item.accumulatedVolume) : null,
          accumulatedEarthVolume: item.accumulatedEarthVolume ? this.formatCellData(item.accumulatedEarthVolume) : null,
          accumulatedStoneVolume: item.accumulatedStoneVolume ? this.formatCellData(item.accumulatedStoneVolume) : null,
          currentVolume: item.currentVolume ? this.formatCellData(item.currentVolume) : null,
          currentEarthVolume: item.currentEarthVolume ? this.formatCellData(item.currentEarthVolume) : null,
          currentStoneVolume: item.currentStoneVolume ? this.formatCellData(item.currentStoneVolume) : null,
          remainVolume: item.remainVolume ? this.formatCellData(item.remainVolume) : null,
          remainEarthVolume: item.remainEarthVolume ? this.formatCellData(item.remainEarthVolume) : null,
          remainStoneVolume: item.remainStoneVolume ? this.formatCellData(item.remainStoneVolume) : null
        }))
        console.log('borrowData', borrowData)

        // 处理弃土场数据
        const spoilData = data.abandonQuantities.map(item => ({
          regionName: item.regionName,
          capacity: item.capacity ? this.formatCellData(item.capacity) : null,
          accumulatedBackFillVolume: item.accumulatedBackFillVolume ? this.formatCellData(item.accumulatedBackFillVolume) : null,
          currentBackFillVolume: item.currentBackFillVolume ? this.formatCellData(item.currentBackFillVolume) : null,
          remainCapacity: item.remainCapacity
        }))

        this.tabList = [
          {
            label: this.$t('region.cutFillArea'),
            value: 'cutFillArea',
            errors: [],
            mergeCells: [],
            isEmpty: cutFillAreaData.length === 0
          },
          {
            label: this.$t('region.borrow'),
            value: 'borrow',
            errors: [],
            mergeCells: [],
            isEmpty: data.debitQuantities.length === 0
          },
          {
            label: this.$t('region.spoil'),
            value: 'spoil',
            errors: [],
            mergeCells: [],
            isEmpty: spoilData.length === 0
          }
        ].filter(tab => !tab.isEmpty)
        this.excelConfig = {
          ...engineeringQuantityConfig,
          cutFillAreaData: cutFillAreaData,
          borrowData: borrowData,
          spoilData: spoilData
        }
        // 为后续保存数据做准备
        this.saveTableDataList = {
          excavationFillQuantities: cutFillAreaData,
          debitQuantities: borrowData,
          abandonQuantities: spoilData,
          periodsComparisonId: data.periodsComparisonId,
          taskId: data.taskId,
          version: data.version
        }
        // 为后续根据fullId更新树形结构中的 checked 值做准备
        this.fullIdToCheckedMap = cutFillAreaData.concat(data.excavationFillQuantities, data.abandonQuantities, data.debitQuantities).reduce((acc, item) => {
          acc[item.fullId] = item.checked
          return acc
        }, {})
        console.log('fullIdToCheckedMap', this.fullIdToCheckedMap)

        this.upDataToDB()
      } catch (error) {
        console.error('获取工程量表格数据失败', error)
      }
    },
    // 保存工程量表格数据
    saveData() {
      this.$confirm('是否保存当前工程量数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调保存接口
        saveQuantityTableData(this.projectId, this.rangeTimeList[0].id, this.saveTableDataList).then(() => {
          this.$message({
            type: 'success',
            message: '保存成功!'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消保存'
        })
      })
    },
    // 获取施工子项的数据
    async querySubitemList(id) {
      try {
        const data = await getSubitemList(this.projectId, id)
        console.log('返回数据', data)
        this.processSubItemData(data)
        this.listIsLoading = false
      } catch (error) {
        console.error('获取施工子项数据失败', error)
        this.listIsLoading = false
      }
    },
    // 处理子项数据
    processSubItemData(data) {
      console.log('data1111111', data, this.treeData)
      this.treeData.cutFillArea = this.addTopLevelNode(data.excavationFillItems, 'cutFillArea')
      this.treeData.borrow = this.addTopLevelNode(data.debitItems, 'borrow')
      this.treeData.spoil = this.addTopLevelNode(data.abandonItems, 'spoil')
      // 更新树形结构中的 checked
      this.updateCheckedInTree(this.treeData.cutFillArea, this.fullIdToCheckedMap)
    },
    // 添加顶级节点
    addTopLevelNode(items, key) {
      const topLevelNode = {
        id: `${key}-top`,
        label: '全部',
        children: this.formatTreeData(items)
      }
      return [topLevelNode]
    },
    // 格式化树形数据
    formatTreeData(items) {
      return items.map(item => this.formatTreeItem(item))
    },
    // 格式化树形数据项
    formatTreeItem(item) {
      return {
        id: item.id,
        label: item.name,
        children: item.children ? item.children.map(child => this.formatTreeItem(child)) : [] // Recursively process children
      }
    },
    // 更新树形结构中的 checked
    updateCheckedInTree(treeItems, flatItems) {
      console.log('treeItems', treeItems, flatItems)

      // // 更新树形数据
      // const updateTree = (items) => {
      //   return items.map(item => {
      //     // 设置 checked 值
      //     item.checked = flatItems[item.id] !== undefined ? flatItems[item.id] : null
      //     // 如果有子节点，递归更新
      //     if (item.children && item.children.length > 0) {
      //       item.children = updateTree(item.children)
      //     }
      //     return item
      //   })
      // }

      // 更新树形数据
      // this.treeData.cutFillArea = updateTree(treeItems)
      console.log('Updated tree data:', this.treeData)
    },
    // 获取单元格样式
    getCellStyle(cellData) {
      if (cellData.style) {
        return cellData.style
      }
      switch (cellData.type) {
        case 1:
          return 'background-color: #E0EDFD;' // 区域管理
        case 2:
          return 'background-color: #EAFAF1;' // 测量收方
        case 3:
          return 'background-color: #FFF9E3;' // 两期对比
        case 4:
          return 'background-color: #FFFFFF;' // 人工填报
        default:
          return ''
      }
    },
    // 格式化单元格数据
    formatCellData(cellData) {
      return {
        value: cellData.value,
        style: this.getCellStyle(cellData),
        type: cellData.type
      }
    },
    // 工期设置点确定，保存施工时段
    async saveConstructionPeriod() {
      const data = {
        startDate: this.initPeriodUnix[0],
        endDate: this.initPeriodUnix[1]
      }
      await saveRangeTime(this.projectId, data)
      this.showDialog = false
      this.getQuantityList()
      this.getRangeTimeTableData()
    },
    // 处理日期选择
    handleDateChange(value) {
      const formattedDates = value.map(date => moment(date).format('YYYY-MM-DD'))
      const endDateTimestamp = Math.floor(moment(value[1]).endOf('day').valueOf() / 1000)
      console.log('formattedDates', formattedDates, endDateTimestamp)

      let message = ''
      let resetStartDate = false
      let resetEndDate = false

      // 所选择的日期对比初始施工时段的开始日期
      if (formattedDates[0] !== this.initPeriod[0]) {
        message += '开始时间不可修改。'
        resetStartDate = true
      }
      // 如果选择的结束日期小于初始施工时段的结束日期
      if (endDateTimestamp < this.initPeriodUnix[1]) {
        message += '结束时间不可小于初始结束时间。'
        resetEndDate = true
      } else {
        this.initPeriodUnix[1] = endDateTimestamp
      }

      if (message) {
        this.$message.error(message)
        if (resetStartDate) {
          this.constructionPeriod[0] = this.initPeriod[0]
        }
        if (resetEndDate) {
          this.constructionPeriod[1] = this.initPeriod[1]
        }
      }
    },
    // 折叠左侧栏
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    // 展示工程量表格
    async getRangeTimeTableData() {
      const data = await this.indexedDBIns.getItem('data')
      console.log('data1111', data)
      if (data) {
        this.excelConfig = {
          ...engineeringQuantityConfig,
          cutFillAreaData: data.cutFill,
          borrowData: data.borrow,
          spoilData: data.spoil
        }
        console.log('this.excelConfig', this.excelConfig)
      } else {
        this.excelConfig = { ...engineeringQuantityConfig }
      }
      this.upDataToDB()
    },
    // 添加工程量
    addQuantity() {
      this.dialogVisible = true
      // 调整时间戳
      this.adjustPeriodUnix()
    },
    // 管理施工子项
    manageSubItems() {
      this.manageDialogVisible = true
      // 调整时间戳
      // this.adjustPeriodUnix()
    },
    onMergeChange(type, data) {
      this.tabList.forEach(item => {
        if (item.value === type) {
          item.mergeCells = data
        }
      })
    },
    reset() {
      this.tab = 'cutFill'
      this.excelConfig = null
      this.tabList.forEach(item => {
        item.errors = []
        item.mergeCells = []
        item.isEmpty = false
      })
    },
    close() {
      this.upDataToDB()
      this.$nextTick(() => {
        this.reset()
        window.clearInterval(this.timer)
      })
    },
    upDataToDB() {
      window.clearInterval(this.timer)
      if (!this.excelConfig) return
      const data = {
        cutFill: this.excelConfig.cutFillAreaData,
        borrow: this.excelConfig.borrowData,
        spoil: this.excelConfig.spoilData
      }
      this.indexedDBIns.setItem('data', data)
      this.timer = setTimeout(() => {
        this.upDataToDB()
      }, 15000)
    }
  }
}
</script>
<style lang="scss" scoped>
  .container {
    padding: 8px 16px;
    height: 100%;
    overflow: hidden;
    display: flex;
    background: #ffffff;

    .left-area {
      width: 246px;
      height: 100%;
      padding: 8px 16px;
      border-radius: 6px;
      margin-right: 10px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      .top-section {
        .title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          .time {
            margin-right: 5px;
            color: black;
          }
          .el-icon-setting {
            color: #409eff;
            cursor: pointer;
          }
        }
        .title1 {
          display: flex;
          flex-direction: column;
          align-items: center;
          .time {
            width: 15px;
            color: black;
          }
          .el-icon-setting {
            color: #409eff;
            cursor: pointer;
          }
        }
        .buttonContainer {
          width: 213px;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 12px;
        }
        .middle-section {
          display: flex;
          justify-content: space-between;
          padding: 2px;
          margin-bottom: 10px;
          background: #f5f5f5;
          border-radius: 4px;

          .el-radio-button {
            margin-left: 1px;
            margin-right: 15px; /* 设置右边距 */
          }
        }

        .bottom-section {
          ul {
            list-style-type: none; /* 移除默认的列表样式 */
            padding: 0;
            margin: 0;
            .date {
              display: flex;
              align-items: center;
              height: 42px;
              border-bottom: 1px solid rgba(0, 0, 0, 0.06);
              padding: 10px 8px;
              .value {
                margin-right: 8px;
              }
            }
            li {
              margin-bottom: 5px;
              cursor: pointer;

              &:hover {
                background: rgba(0, 0, 0, 0.06);
              }
              color: rgba(0, 0, 0, 0.88);
              padding: 0;
              margin: 0;
            }
          }
        }
      }
    }
    /* 折叠后属性 */
    .left-area.collapsed {
      width: 38px;
      padding: 8px 5px;
    }
    .icon-fold-left,
    .icon-fold-right {
      cursor: pointer;
    }
    /* 折叠后属性 */
    .period {
      color: #ff4d4f;
    }

    .right-area {
      display: flex;
      background: #ffffff;
      min-width: 1331px;
      .right-side {
        width: 100%;
        .top-buttons {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .bottom-table {
          .excel {
            width: 100%;
            height: 700px;
            // height: calc(100% - 38px);
          }
          .bottomContainer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .tabs {
              height: 38px;
              .tab-item {
                width: 100px;
                height: 38px;
                line-height: 38px;
                margin-right: 5px;
                text-align: center;
                display: inline-block;
                border-radius: 6px 6px 0px 0px;
                border-width: 1px 1px 0px 1px;
                border-style: solid;
                border-color: rgba(0, 0, 0, 0.06);
                background: rgba(0, 0, 0, 0.02);
                color: rgba(0, 0, 0, 0.88);
                cursor: pointer;
                &.active {
                  color: #409eff;
                }
              }
            }
            .quantity-legend {
              display: flex;
              .date {
                margin-right: 16px;
                color: rgba(0, 0, 0, 0.45);
              }
              .legend-container {
                display: flex;
                .legend-item {
                  display: flex;
                  align-items: center;
                  margin-right: 20px;

                  .color {
                    border: 1px solid rgba(0, 0, 0, 0.25);
                    width: 25px;
                    height: 13px;
                    margin-right: 5px;
                  }
                  .text {
                    color: rgba(0, 0, 0, 0.45);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ::v-deep .el-dialog {
    width: 500px;
  }
  ::v-deep .el-button.el-button--default:not(.is-disabled) {
    border: 1px solid #d9d9d9;
    color: #595959;
  }
  ::v-deep .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 4px;
  }
  ::v-deep .el-radio-button:first-child .el-radio-button__inner {
    width: 89px;
    border-radius: 4px;
  }
</style>
