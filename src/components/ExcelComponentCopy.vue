<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-11-14 13:39:29
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-28 10:07:00
 * @FilePath: \plan-modeling-web:\glodon\infra-construction-web\src\components\ExcelComponent.vue
 * @Description: excel组件
-->
<template>
  <div class="excel-container">
    <el-button
      type="primary"
      @click="validate"
    >校验</el-button>
    <hot-table
      ref="hotTableRef"
      class="excel-table"
      :settings="hotSettings"
    ></hot-table>
  </div>
</template>
<script>
import { HotTable } from '@handsontable/vue' // export { HotTable as default, HotTable, HotColumn, BaseEditorComponent };
import { registerAllModules } from 'handsontable/registry'
import list from './mock'
import 'handsontable/dist/handsontable.full.css'

registerAllModules()

export default {
  name: 'ExcelComponent',
  components: {
    HotTable
  },
  computed: {
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
      hotSettings: {
        autoColumnSize: true,
        colWidths: 180, // 默认单元格宽度
        rowHeights: 38, // 默认单元格高度
        minRows: 0, // 默认数据最小行数
        wordWrap: true, // 单元格文字是否换行展示
        width: '100%', // auto  or  100%
        height: '100%', // auto  or  100%
        className: 'htMiddle, htCenter',
        // comments: true,
        data: list,
        nestedHeaders: [
          [
            '施工过程中土方量计算方式',
            '区域名称',
            '子项名称',
            '区域类型',
            { label: '设计量(m³)', colspan: 3 },
            { label: '挖方属性', colspan: 4 },
            { label: '填方属性', colspan: 4 }
          ],
          [
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            { label: '设计土石比例(%)', colspan: 2 },
            { label: '利用率(%)', colspan: 2 },
            { label: '料源要求(是否可利用)', colspan: 2 },
            { label: '是否加工', colspan: 2 }
          ],
          ['', '', '', '', '总', '土', '石', '土', '石', '土', '石', '土', '石', '土', '石']
        ],
        columns: [
          {
            title: '施工过程中土方量计算方式',
            data: 'computedMode',
            type: 'dropdown', // 数值列
            align: 'center',
            source: ['测量收方模块(横断面法)', '两期对比模块(地形扣减法)', '人工填报']
          },
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
            comments: '名称必填，区域内名称不能重复，且不大于50个字符'
          },
          {
            title: '区域类型',
            data: 'regionType',
            type: 'dropdown',
            align: 'center',
            width: 80,
            comments: '区域类型必选',
            source: ['挖方区', '填方区']
          },
          {
            title: '总',
            data: 'designVolume',
            type: 'numeric', // 下拉选择列
            align: 'center',
            comments: '必须为数字，且最多保留两位小数！',
            width: 80
          },
          {
            title: '土',
            data: 'designEarthVolume',
            type: 'numeric',
            align: 'center',
            comments: '必须为数字，且最多保留两位小数！',
            width: 80
          },
          {
            title: '石',
            data: 'designStoneVolume',
            type: 'numeric',
            align: 'center',
            comments: '必须为数字，且最多保留两位小数！',
            width: 80
          },
          {
            title: '土',
            data: 'designEarthProportion',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100！',
            align: 'center',
            width: 80
          },
          {
            title: '石',
            data: 'designStoneProportion',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 80
          },
          {
            title: '土',
            data: 'utilizationRatioEarth',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 80
          },
          {
            title: '石',
            data: 'utilizationRatioStone',
            type: 'numeric',
            comments: '必须为数字，最多保留两位小数且不大于100',
            align: 'center',
            width: 80
          },
          {
            title: '土',
            data: 'materialSourceRequireEarth',
            type: 'dropdown',
            align: 'center',
            source: ['可利用', '不可利用', '可利用+不可利用']
          },
          {
            title: '石',
            data: 'materialSourceRequireStone',
            type: 'dropdown',
            align: 'center',
            source: ['可利用', '不可利用', '可利用+不可利用']
          },
          {
            title: '土',
            data: 'processedEarth',
            type: 'dropdown',
            align: 'center',
            source: ['是', '否'],
            width: 80
          },
          {
            title: '石',
            data: 'processedStone',
            type: 'dropdown',
            align: 'center',
            source: ['是', '否'],
            width: 80
          }
        ],
        afterGetColHeader(col, th) {
          const cols3 = [0, 1, 2, 3]
          const cols2 = [4, 5, 6]
          const isRow2 = cols2.includes(col)
          const isRow3 = cols3.includes(col)
          if (isRow2 || isRow3) {
            const theads = th.parentNode.parentNode // 获取当前表头的thead对象
            const trs = theads.getElementsByTagName('tr') // 获取所有行
            const trCols1 = trs[0].getElementsByTagName('th') // 获取第一行所有列
            const trCols2 = trs[1].getElementsByTagName('th') // 获取第二行所有列
            const trCols3 = trs[2]?.getElementsByTagName('th') // 获取第二行所有列
            // trCols1[col].style.borderBottom = 'none'
            trCols1[col].rowSpan = isRow2 ? 2 : 3
            trCols1[col].style.verticalAlign = 'middle'
            trCols1[col].style.height = isRow2 ? '54px' : '81px'
            trCols2[col].className = 'hiddenHeader'
            if (isRow3) {
              trCols3[col].className = 'hiddenHeader'
            }
          }
        },
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
              disabled: function () {
                const select = this.getSelectedLast()
                return select && select[1] === select[3] && select[1] !== 1
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
    const hot = this.$refs.hotTableRef?.hotInstance
    if (hot) {
      hot.destroy()
    }
  },
  methods: {
    exportExcel() {
      this.$refs.hotTableRef?.hotInstance?.validateCells()
    },
    clearExcel() {
      this.$refs.hotTableRef?.hotInstance?.clear()
    },
    afterLoadData(data, initialLoad) {
      if (initialLoad) {
        setTimeout(() => {
          this.handleMerge()
        }, 100)
      }
    },
    getExcel() {
      this.$refs.hotTableRef?.hotInstance?.getData()
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
          this.handleMerge(changes)
        }, 100)
      }
    },
    // 处理合并
    handleMerge() {
      const hot = this.$refs.hotTableRef?.hotInstance
      const data = hot.getData()
      const mergeCells = []
      let len = 1
      let startRow = 0
      for (let row = data.length - 1; row >= 0; row--) {
        // 假设我们想要合并包含 null 值的单元格
        // 遍历当前行，寻找前一个非 null 值的单元格
        const cellValue = data[row][1]
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
        const hot = this.$refs.hotTableRef?.hotInstance
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
      const hot = this.$refs.hotTableRef?.hotInstance
      try {
        const cellMeta = hot?.getCellMeta(coords.row, coords.col)
        if (cellMeta && cellMeta.className?.includes('invalid-error')) {
          let tooltip = document.querySelector('.tooltip')
          if (tooltip) {
            tooltip.style.display = 'none'
          } else {
            tooltip = document.createElement('div')
            tooltip.className = 'tooltip'
            tooltip.textContent = cellMeta?.comments // 这里可以设置工具提示的内容
            tooltip.style.display = 'none' // 默认不显示工具提示
            TD?.appendChild(tooltip)
          }
          // 鼠标进入单元格时显示工具提示
          TD.onmouseenter = function () {
            tooltip.style.position = 'fixed'
            const getBoundingClientRect = TD.getBoundingClientRect()
            tooltip.style.left = getBoundingClientRect.left + getBoundingClientRect.width + 'px'
            tooltip.style.top = getBoundingClientRect.top + getBoundingClientRect.height + 'px'
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
      const hot = this.$refs.hotTableRef?.hotInstance
      const mergeCellsPlugin = hot.getPlugin('MergeCells')
      const rows =
        mergeCellsPlugin?.mergedCellsCollection?.mergedCells?.map((item) => {
          return [item?.row, item?.row + item?.rowspan - 1]
        }) || []
      // 遍历数组，填充映射
      data.forEach((item, index) => {
        const keys = Object.keys(item)
        const hasData = keys?.some((key) => !!item[key])
        if (hasData) {
          if (item.regionName) {
            if (!indicesMap.has(item.regionName)) {
              indicesMap.set(item.regionName, [])
            }
            indicesMap.get(item.regionName).push(index)
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
      const hot = this.$refs.hotTableRef?.hotInstance
      const mergeCellsPlugin = hot.getPlugin('MergeCells')
      const errors = []
      const cells =
        mergeCellsPlugin?.mergedCellsCollection?.mergedCells?.map((item) => {
          return [item?.row, item?.row + item?.rowspan - 1]
        }) || []
      const indicesMap = new Map()
      // 遍历数组，填充映射
      data.forEach((item, index) => {
        const keys = Object.keys(item)
        const hasData = keys?.some((key) => !!item[key])
        if (hasData) {
          const findRow = cells.find((item) => item[0] <= index && item[1] >= index)
          const curRow = findRow ? findRow[0] : index
          if (item.subItemName) {
            const key = `${item.subItemName}_${curRow}`
            if (!indicesMap.has(key)) {
              indicesMap.set(key, [])
            }
            indicesMap.get(key).push(index)
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
      const columns = [
        'designVolume',
        'designEarthVolume',
        'designStoneVolume',
        'designEarthProportion',
        'designStoneProportion',
        'utilizationRatioEarth',
        'utilizationRatioStone',
        'maxMiningVolume',
        'capacity'
      ]
      const percentage = ['designEarthProportion', 'designStoneProportion', 'utilizationRatioEarth', 'utilizationRatioStone']
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
      return errors.map((index) => {
        return [index, this.regionTypeColumn]
      })
    },
    getMergeCells() {
      const hot = this.$refs.hotTableRef?.hotInstance
      const mergeCellsPlugin = hot.getPlugin('MergeCells')
      const cells =
        mergeCellsPlugin?.mergedCellsCollection?.mergedCells?.map((item) => {
          return [item?.row, item?.row + item?.rowspan - 1]
        }) || []
      return cells
    },
    // 校验表格是否为空
    isEmpty() {
      const hot = this.$refs.hotTableRef?.hotInstance
      const columns = this.hotSettings.columns
      return columns.every((item, index) => {
        return hot.isEmptyCol(index)
      })
    },
    // 校验
    validate() {
      const hot = this.$refs.hotTableRef?.hotInstance
      // const commentsPlugin = hot?.getPlugin('comments')
      if (this.errors.length) {
        try {
          this.errors.forEach((item) => {
            // commentsPlugin?.removeCommentAtCell(item[0], item[1])
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
            // commentsPlugin?.setCommentAtCell(item[0], item[1], 'error')
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
  ::v-deep .handsontable .invalid-error,
  ::v-deep .handsontable .htInvalid {
    background-color: #ffccc7 !important;
    text-align: center !important;
    vertical-align: middle !important;
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
</style>
<style>
  .htContextMenu:not(.htGhostTable) {
    z-index: 9999 !important;
  }
</style>
