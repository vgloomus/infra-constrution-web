<template>
  <div class="excel-container">
    <hot-table
      :ref="`hotTableRef${type}`"
      class="excel-table"
      :settings="hotSettings"
    ></hot-table>
  </div>
</template>
<script>
import { HotTable } from '@handsontable/vue' // export { HotTable as default, HotTable, HotColumn, BaseEditorComponent };
import Handsontable from 'handsontable'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/dist/handsontable.full.css'

registerAllModules()

export default {
  name: 'ExcelComponentEQStatics',
  components: {
    HotTable
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    hotSettings() {
      return {
        ...this.baseSettings,
        ...this.config,
        data: this.data.map(row => {
          const newRow = { ...row }
          Object.keys(newRow).forEach(key => {
            if (newRow[key] && typeof newRow[key] === 'object' && newRow[key].value !== undefined) {
              newRow[key] = newRow[key].value
            }
          })
          return newRow
        }),
        fixedColumnsLeft: 3,
        cells: this.cellStyle
      }
    },
    // 区域列数
    regionalColumn() {
      return this.hotSettings.columns.findIndex((item) => item.data === 'regionName')
    },
    // 子项列数
    subItemNameColumn() {
      return this.hotSettings.columns.findIndex((item) => item.data === 'subItemName')
    },
    // 类型列数
    regionTypeColumn() {
      return this.hotSettings.columns.findIndex((item) => item.data === 'regionType')
    }
  },
  data() {
    return {
      currentRow: 0,
      isScroll: false,
      errors: [],
      hotInstance: null,
      baseSettings: {
        autoColumnSize: true,
        colWidths: 180, // 默认单元格宽度
        rowHeights: 38, // 默认单元格高度
        minRows: 0, // 默认数据最小行数
        wordWrap: true, // 单元格文字是否换行展示
        width: '100%', // auto  or  100%
        height: '100%', // auto  or  100%
        className: 'htMiddle, htCenter',
        // comments: true,
        // stretchH: 'all',
        // allowHtml: true,
        columns: [
          {
            title: '区域名称',
            data: 'regionName',
            type: 'text', // 字符列
            align: 'center',
            width: 150,
            comments: '名称必填，不能重复，且不大于50个字符'
          },
          {
            title: '子项名称',
            data: 'subItemName',
            type: 'text', // 数值列
            align: 'center',
            width: 120,
            comments: '名称必填，相同区域内子项名称不能重复，且不大于50个字符'
          },
          {
            title: '区域类型',
            data: 'regionType',
            type: 'dropdown',
            align: 'center',
            width: 80,
            comments: '区域类型必选，且同区域类型需相同！',
            source: ['挖方区', '填方区']
          },
          {
            title: '总',
            data: 'designVolume',
            type: 'numeric', // 下拉选择列
            align: 'center',
            comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
            width: 60
          },
          {
            title: '土',
            data: 'designEarthVolume',
            type: 'numeric',
            align: 'center',
            comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
            width: 60
          },
          {
            title: '石',
            data: 'designStoneVolume',
            type: 'numeric',
            align: 'center',
            comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
            width: 60
          },
          {
            title: '总',
            data: 'accumulatedVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100！',
            align: 'center',
            width: 60
          },
          {
            title: '土',
            data: 'accumulatedEarthVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100！',
            align: 'center',
            width: 60
          },
          {
            title: '石',
            data: 'accumulatedStoneVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          },
          {
            title: '总',
            data: 'currentVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          },
          {
            title: '土',
            data: 'currentEarthVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          },
          {
            title: '石',
            data: 'currentStoneVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          },
          {
            title: '总',
            data: 'remainingVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          },
          {
            title: '土',
            data: 'remainingEarthVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          },
          {
            title: '石',
            data: 'remainingStoneVolume',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 60
          }
        ],
        contextMenu: {
          callback: this.contextMenuCallback,
          items: {
            row_above: {
              name: '在上方插入一行'
            },
            row_below: {
              name: '在下方插入一行'
            },
            remove_row: {
              name: '删除行'
            },
            undo: {
              name: '撤销'
            },
            mergeCells: {
              name: '合并单元格',
              disabled: () => {
                const select = this.hotInstance.getSelectedLast()
                if (this.type === 'spoil' || this.type === 'transit') return true
                return select[1] !== 1 || select[3] !== 1 || select[0] === select[2]
              }
            }
          }
        },
        // afterValidate: this.afterValidate,
        // beforeValidate: this.beforeValidate,
        // afterScrollVertically: this.afterScrollVertically,
        afterPaste: this.afterPaste,
        afterLoadData: this.afterLoadData,
        afterOnCellMouseOver: this.afterOnCellMouseOver,
        licenseKey: 'non-commercial-and-evaluation'
      }
    }
  },
  beforeDestroy() {
    if (this.hotInstance) {
      this.hotInstance.destroy()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.hotInstance = this.$refs[`hotTableRef${this.type}`]?.hotInstance
    })
  },
  methods: {
    cellStyle(row, col) {
      const cellData = this.data[row]
      console.log('cellData', cellData)

      if (!cellData) return

      const column = this.hotSettings.columns[col]
      console.log('column', column)

      if (!column) return

      const field = column.data
      const cellValue = cellData[field]

      if (cellValue && cellValue.style) {
        return { renderer: this.customRenderer }
      }
    },
    customRenderer(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, arguments)
      const cellData = this.data[row]
      const field = this.hotSettings.columns[col].data
      const cellValue = cellData[field]

      if (cellValue && cellValue.style) {
        td.style.cssText = cellValue.style
      }
    },
    exportExcel() {
      this.hotInstance?.validateCells()
    },
    clearExcel() {
      this.hotInstance?.clear()
    },
    afterLoadData(data, initialLoad) {
      if (initialLoad) {
        setTimeout(() => {
          this.handleMerge()
        }, 100)
      }
    },
    getExcel() {
      this.hotInstance?.getData()
    },
    afterScrollVertically() {
      this.isScroll = true
    },
    beforeValidate(val, row, columnType) {
      // console.log('校验数值', this.hotSettings.data, val, row, columnType)
      // this.hotSettings.data[row][columnType] = val
    },
    afterValidate(valid, val, row, columnType) {
      // console.log('校验结果', valid, val, row, columnType)
      // this.currentRow = row
      // const commentsPlugin = this.$refs.hotTableRef?.hotInstance?.getPlugin('comments')
      // if (!valid) {
      //   const column = this.hotSettings.columns.findIndex((item) => item.data === columnType)
      //   commentsPlugin?.setCommentAtCell(row, column, this.hotSettings.columns[column].comments)
      //   commentsPlugin.updatePlugin()
      // } else {
      //   const column = this.hotSettings.columns.findIndex((item) => item.data === columnType)
      //   commentsPlugin?.removeCommentAtCell(row, column)
      // }
    },
    afterPaste(changes) {
      if (changes.length > 0) {
        setTimeout(() => {
          this.handleMerge()
          // 处理数据
          // this.handlePastedData()
        }, 100)
      }
    },
    // 处理粘贴数据
    handlePastedData() {
      const hot = this.hotInstance
      const data = hot.getData()
      const columns = this.hotSettings.columns
      const regionTypeIndex = columns.findIndex((item) => item.data === 'regionType')
      const availableDateIndex = columns.findIndex((item) => item.data === 'availableDate')
      if (regionTypeIndex !== -1) {
        const options = columns[regionTypeIndex].selectOptions
        data.forEach((row, rowIndex) => {
          if (row[regionTypeIndex] && !options.includes(row[regionTypeIndex])) {
            hot.setDataAtCell(rowIndex, regionTypeIndex, null)
          }
        })
      }
      if (availableDateIndex !== -1) {
        const regex = /^\d{4}年\d{1,2}月\d{1,2}日$/
        data.forEach((row, rowIndex) => {
          if (row[availableDateIndex] && !regex.test(row[availableDateIndex])) {
            hot.setDataAtCell(rowIndex, availableDateIndex, null)
          }
        })
      }
    },
    // 处理合并
    handleMerge() {
      const hot = this.hotInstance
      const data = hot.getData()

      const mergeCells = []
      let len = 1
      let startRow = 0
      for (let row = data.length - 1; row >= 0; row--) {
        // 假设我们想要合并包含 null 值的单元格
        // 遍历当前行，寻找前一个非 null 值的单元格
        const cellValue = data[row][0]
        console.log('cellValue', cellValue, data[row])
        const rowData = data[row]
        const hasData = rowData.some((item) => item !== null && item !== '')
        if (cellValue === null && hasData) {
          len++
        } else if (cellValue) {
          // 找到起点
          startRow = row
          // 添加合并单元格
          mergeCells.push({
            row: startRow,
            col: 1,
            rowspan: len,
            colspan: 1
          })
          len = 1
        } else {
          len = 1
        }
      }
      hot.updateSettings({
        mergeCells
      })
    },
    contextMenuCallback(key, selection) {
      if (key === 'mergeCells') {
        const hot = this.hotInstance
        const mergeCellsPlugin = hot.getPlugin('MergeCells')
        const mergeCells =
          mergeCellsPlugin?.mergedCellsCollection?.mergedCells?.map((item) => {
            return {
              row: item?.row,
              col: item?.col,
              rowspan: item?.rowspan,
              colspan: item?.colspan
            }
          }) || []
        const startRow = selection[0].start.row
        const startColumn = selection[0].start.col
        const endRow = selection[0].end.row
        const endColumn = selection[0].end.col
        const cells = [
          {
            row: startRow,
            col: startColumn,
            rowspan: endRow - startRow + 1,
            colspan: endColumn - startColumn + 1
          }
        ]
        mergeCells.push(...cells)
        hot.updateSettings({
          mergeCells
        })
      }
    },
    afterOnCellMouseOver(event, coords, TD) {
      const hot = this.hotInstance
      try {
        const cellMeta = hot?.getCellMeta(coords.row, coords.col)
        if (cellMeta && (TD.className?.includes('invalid-error') || TD.className?.includes('htInvalid'))) {
          const className = `tooltip-${this.type}-${coords.row}-${coords.col}`
          let tooltip = document.querySelector(`.${className}`)
          if (tooltip) {
            tooltip.style.display = 'none'
          } else {
            tooltip = document.createElement('div')
            tooltip.className = className
            tooltip.style.display = 'none' // 默认不显示工具提示
            TD?.appendChild(tooltip)
          }
          // 鼠标进入单元格时显示工具提示
          TD.onmouseenter = function () {
            tooltip.style.position = 'fixed'
            const getBoundingClientRect = TD.getBoundingClientRect()
            tooltip.style.left = getBoundingClientRect.left + getBoundingClientRect.width + 'px'
            tooltip.style.top = getBoundingClientRect.top + getBoundingClientRect.height + 'px'
            tooltip.textContent = cellMeta?.comments || '请按要求填写/选择' // 这里可以设置工具提示的内容
            tooltip.style.display = 'block'
            tooltip.style.backgroundColor = '#FF4D4F'
            tooltip.style.color = '#FFF'
            tooltip.style.boxShadow = '0px 3px 6px -4px rgba(0, 0, 0, 0.12),0px 6px 16px 0px rgba(0, 0, 0, 0.08),0px 9px 28px 8px rgba(0, 0, 0, 0.05)'
            tooltip.style.padding = '5px 8px'
            tooltip.style.borderRadius = '6px'
            tooltip.style.zIndex = '9999'
          }
          // 鼠标离开单元格时隐藏工具提示
          TD.onmouseleave = function () {
            tooltip.style.display = 'none'
          }
        }
      } catch (error) { }
    },
    // 校验区域名称重复逻辑
    checkRegionalName() {
      const data = this.hotSettings.data
      const indicesMap = new Map()
      const errors = []
      const rows = this.getMergeCells()
      // 遍历数组，填充映射
      data.forEach((item, index) => {
        const keys = Object.keys(item)
        const hasData = keys?.some((key) => !!item[key])
        if (hasData) {
          if (item.regionName) {
            if (item.regionName.length > 50) {
              errors.push(index)
            } else {
              if (!indicesMap.has(item.regionName)) {
                indicesMap.set(item.regionName, [])
              }
              indicesMap.get(item.regionName).push(index)
            }
          } else {
            if (rows.find((item) => index === item[0])) {
              errors.push(index)
            }
            if (!rows.find((item) => index > item[0] && index <= item[1])) {
              errors.push(index)
            }
          }
        }
      })
      // 获取所有重复项的索引
      indicesMap.forEach((indices) => {
        if (indices.length > 1) {
          errors.push(...indices)
        }
      })
      return errors.map((index) => {
        return [index, this.regionalColumn]
      })
    },
    // 校验区域名称重复逻辑
    checkSubRegionalName() {
      const data = this.hotSettings.data
      const errors = []
      const cells = this.getMergeCells()
      const indicesMap = new Map()
      // 遍历数组，填充映射
      data.forEach((item, index) => {
        const keys = Object.keys(item)
        const hasData = keys?.some((key) => !!item[key])
        if (hasData) {
          const findRow = cells.find((item) => item[0] <= index && item[1] >= index)
          const curRow = findRow ? findRow[0] : index
          if (item.subItemName) {
            if (item.subItemName.length > 50) {
              errors.push(index)
            } else {
              const key = `${item.subItemName}_${curRow}`
              if (!indicesMap.has(key)) {
                indicesMap.set(key, [])
              }
              indicesMap.get(key).push(index)
            }
          } else {
            errors.push(index)
          }
        }
      })
      // 获取所有重复项的索引
      indicesMap.forEach((indices) => {
        if (indices.length > 1) {
          errors.push(...indices)
        }
      })
      return errors.map((index) => {
        return [index, this.subItemNameColumn]
      })
    },
    // 校验数字
    checkNumber() {
      const data = this.hotSettings.data
      // const columns = [
      //   'designVolume',
      //   'designEarthVolume',
      //   'designStoneVolume',
      //   'designEarthProportion',
      //   'designStoneProportion',
      //   'utilizationRatioEarth',
      //   'utilizationRatioStone',
      //   'maxMiningVolume',
      //   'maxMiningVolumeEarth',
      //   'maxMiningVolumeStone',
      //   'capacity'
      // ]
      const numbers = ['designVolume', 'designEarthVolume', 'designStoneVolume', 'maxMiningVolume', 'maxMiningVolumeEarth', 'maxMiningVolumeStone', 'capacity']
      const percentage = ['designEarthProportion', 'designStoneProportion', 'utilizationRatioEarth', 'utilizationRatioStone']
      const columns = [...numbers, ...percentage]
      const columnsMaps = {}
      columns.forEach((item) => {
        const curColumns = this.hotSettings.columns.findIndex((column) => {
          return column.data === item
        })
        if (curColumns !== -1) {
          columnsMaps[item] = curColumns
        }
      })
      const errors = []
      data.forEach((item, index) => {
        const keys = Object.keys(item)
        const hasData = keys?.some((key) => !!item[key])
        if (hasData) {
          Object.keys(columnsMaps).forEach((key) => {
            if (item[key]) {
              const isPercentage = percentage.includes(key)
              const reg = /^[0-9]+(\.[0-9]{1,2})?$/
              if (!reg.test(item[key])) {
                errors.push([index, columnsMaps[key]])
              } else {
                if (isPercentage) {
                  if (item[key] > 100) {
                    errors.push([index, columnsMaps[key]])
                  }
                }
                if (numbers.includes(key)) {
                  if (parseInt(item[key]) >= 100000000000) {
                    errors.push([index, columnsMaps[key]])
                  }
                }
              }
            }
          })
        }
      })
      return errors
    },
    // 校验区域类型
    checkRegionalType() {
      const data = this.hotSettings.data
      const errors = []
      data.forEach((item, index) => {
        const keys = Object.keys(item)
        const hasData = keys?.some((key) => !!item[key])
        if (hasData) {
          if (!item.regionType) {
            errors.push(index)
          }
        }
      })
      const cells = this.getMergeCells()
      cells.forEach((item) => {
        const curRow = item[0]
        const curRowEnd = item[1]
        const indicesSet = new Set()
        const rows = []
        for (let i = curRow; i <= curRowEnd; i++) {
          const key = `${data[i].regionType}`
          indicesSet.add(key)
          rows.push(i)
        }
        if (indicesSet.size > 1) {
          errors.push(...rows)
        }
      })
      return errors.map((index) => {
        return [index, this.regionTypeColumn]
      })
    },
    getMergeCells() {
      const hot = this.hotInstance
      const mergeCellsPlugin = hot.getPlugin('MergeCells')
      const cells =
        mergeCellsPlugin?.mergedCellsCollection?.mergedCells?.map((item) => {
          return [item?.row, item?.row + item?.rowspan - 1]
        }) || []
      return cells
    },
    // 校验表格是否为空
    isEmpty() {
      const hot = this.hotInstance
      const columns = this.hotSettings.columns
      return columns.every((item, index) => {
        return hot.isEmptyCol(index)
      })
    },
    // 校验
    validate() {
      const hot = this.hotInstance
      const commentsPlugin = hot?.getPlugin('comments')
      if (this.errors.length) {
        try {
          this.errors.forEach((item) => {
            commentsPlugin?.removeCommentAtCell(item[0], item[1])
            hot?.removeCellMeta(item[0], item[1], 'className')
          })
          this.errors = []
        } catch (error) {
          console.log('error', error)
        }
      }
      const checkRegionalName = this.checkRegionalName()
      const checkSubRegionalName = this.checkSubRegionalName()
      const checkRegionalType = this.checkRegionalType()
      const checkNumber = this.checkNumber()
      this.errors.push(...checkRegionalName, ...checkSubRegionalName, ...checkRegionalType, ...checkNumber)
      this.errors = this.errors.filter((item) => {
        return item[1] !== -1
      })
      if (this.errors.length) {
        this.errors.forEach((item) => {
          try {
            commentsPlugin?.setCommentAtCell(item[0], item[1], 'error')
            hot?.setCellMeta(item[0], item[1], 'className', 'invalid-error')
          } catch (error) {
            console.log('error', error)
          }
        })
        hot?.render()
      }
      return this.errors
    }
  }
}
</script>
<style lang="scss" scoped>
  .excel-container {
    height: 100%;
    width: 100%;
    background: #fff;
    position: relative;
  }
  ::v-deep .hiddenHeader {
    display: none !important;
  }
  ::v-deep .handsontable th {
    background-color: rgba(0, 0, 0, 0.04);
    color: rgba(0, 0, 0, 0.88);
    border-color: rgba(0, 0, 0, 0.06) !important;
    &.ht__highlight {
      background-color: rgba(0, 0, 0, 0.04);
      color: rgba(0, 0, 0, 0.88);
    }
  }
  ::v-deep .handsontable .htCenter,
  ::v-deep .handsontable th {
    vertical-align: middle !important;
  }
  ::v-deep .handsontable tr:first-child th,
  ::v-deep .handsontable tr td {
    border-color: rgba(0, 0, 0, 0.06) !important;
  }
  ::v-deep .handsontable .invalid-error {
    text-align: center !important;
    vertical-align: middle !important;
    position: relative;
  }
  ::v-deep .handsontable .invalid-error.htCommentCell,
  ::v-deep .handsontable .htInvalid {
    background-color: #ffccc7 !important;
    position: relative;
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      right: 0;
      top: unset;
      left: unset;
      border-left: 6px solid transparent;
      border-top: 6px solid transparent;
      border-right: 6px solid #ff4d4f;
    }
  }
  ::v-deep .handsontable {
    .handsontableInput[aria-haspopup="listbox"] {
      opacity: 0 !important;
    }
    .computed-mode {
      display: inline-block;
      font-size: 12px;
      padding: 1px 8px;
      border-radius: 4px;
    }
    .computed-mode1 {
      color: #13a8a8;
      background-color: #e6fffb;
    }
    .computed-mode2 {
      color: #1677ff;
      background-color: #e6f4ff;
    }
    .computed-mode3 {
      color: #722ed1;
      background-color: #f9f0ff;
    }
  }
</style>
<style>
  .htContextMenu:not(.htGhostTable) {
    z-index: 9999 !important;
  }
</style>
