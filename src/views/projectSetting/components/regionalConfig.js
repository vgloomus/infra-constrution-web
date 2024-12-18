// import i18n from '@/i18n'
// console.log(i18n.t('fetchingLink'))

const computedModeList = ['测量收方模块(横断面法)', '两期对比模块(地形扣减法)', '人工填报']
// const computedModeHtmlList = [
//   '<span class="computed-mode computed-mode1">测量收方模块(横断面法)</span>',
//   '<span class="computed-mode computed-mode2">两期对比模块(地形扣减法)</span>',
//   '<span class="computed-mode computed-mode3">人工填报</span>'
// ]
// const useHtmlList = ['<span class="use1">可利用</span>', '<span class="use2">不可利用</span>', '<span class="use3">可利用+不可利用</span>']
const useList = ['可利用', '不可利用', '可利用+不可利用']
// const regionTypeHtmlList1 = ['<span class="region-type1">挖方区</span>', '<span class="region-type2">填方区</span>']
// const regionTypeHtmlList2 = ['<span class="region-type3">借方区</span>']
// const regionTypeHtmlList3 = ['<span class="region-type4">弃土场</span>']
// const regionTypeHtmlList4 = ['<span class="region-type5">中转场</span>']

const regionTypeList1 = ['挖方区', '填方区']
const regionTypeList2 = ['借方区']
const regionTypeList3 = ['弃土场']
const regionTypeList4 = ['中转场']
const trueList = ['是', '否']
// const trueHtmlList = trueList
const tsList = ['土', '石', '土+石']
// const tsHtmlList = tsList
export const cutFill = {
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
      strict: true,
      allowInvalid: false,
      allowHtml: true,
      source: computedModeList
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
      comments: '名称必填，相同区域内子项名称不能重复，且不大于50个字符'
    },
    {
      title: '区域类型',
      data: 'regionType',
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      width: 80,
      comments: '区域类型必选，且同区域类型需相同！',
      source: regionTypeList1
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
      title: '土',
      data: 'designEarthProportion',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100！',
      align: 'center',
      width: 60
    },
    {
      title: '石',
      data: 'designStoneProportion',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 60
    },
    {
      title: '土',
      data: 'utilizationRatioEarth',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 60
    },
    {
      title: '石',
      data: 'utilizationRatioStone',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 60
    },
    {
      title: '土',
      data: 'materialSourceRequireEarth',
      type: 'dropdown',
      strict: true,
      allowInvalid: false,
      allowHtml: true,
      align: 'center',
      source: useList
    },
    {
      title: '石',
      data: 'materialSourceRequireStone',
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: useList
    },
    {
      title: '土',
      data: 'processedEarth',
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: trueList,
      width: 60
    },
    {
      title: '石',
      data: 'processedStone',
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: trueList,
      width: 60
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
  }
}
export const cutFillBaseData = {
  computedMode: null,
  regionName: '',
  subItemName: null,
  regionType: null,
  availableDate: null,
  maxMiningVolume: null,
  designVolume: null,
  designEarthVolume: null,
  designStoneVolume: null,
  designEarthProportion: null,
  designStoneProportion: null,
  utilizationRatioEarth: null,
  utilizationRatioStone: null,
  materialSourceRequireEarth: null,
  materialSourceRequireStone: null,
  processedEarth: null,
  processedStone: null
}

export const cutFillData = Array.from({ length: 200 }, () => ({ ...cutFillBaseData }))

export const borrow = {
  nestedHeaders: [
    [
      '施工过程中土方量计算方式',
      '区域名称',
      '子项名称',
      '区域类型',
      '可用起始日期',
      { label: '最大开采量(m³)', colspan: 3 },
      { label: '挖方属性', colspan: 4 }
    ],
    ['', '', '', '', '', '', '', '', { label: '设计土石比例(%)', colspan: 2 }, { label: '利用率(%)', colspan: 2 }],
    ['', '', '', '', '', '总', '土', '石', '土', '石', '土', '石']
  ],
  columns: [
    {
      title: '施工过程中土方量计算方式',
      data: 'computedMode',
      type: 'dropdown', // 数值列
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: computedModeList
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
      comments: '名称必填，相同区域内子项名称不能重复，且不大于50个字符'
    },
    {
      title: '区域类型',
      data: 'regionType',
      type: 'dropdown',
      comments: '区域类型必选，且同区域类型需相同！',
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: regionTypeList2
    },
    {
      title: '可用起始日期',
      data: 'availableDate',
      type: 'date',
      align: 'center',
      allowInvalid: false,
      dateFormat: 'YYYY年M月D日', // 表内显示格式
      datePickerConfig: {
        i18n: {
          previousMonth: 'Previous Month',
          nextMonth: 'Next Month',
          months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          weekdays: ['日', '一', '二', '三', '四', '五', '六'],
          weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
        }
      }
    },
    {
      title: '总',
      data: 'maxMiningVolume',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '土',
      data: 'maxMiningVolumeEarth',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '石',
      data: 'maxMiningVolumeStone',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '土',
      data: 'designEarthProportion',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 80
    },
    {
      title: '石',
      data: 'designStoneProportion',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数且不大于100',
      width: 80
    },
    {
      title: '土',
      data: 'utilizationRatioEarth',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数且不大于100',
      width: 80
    },
    {
      title: '石',
      data: 'utilizationRatioStone',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数且不大于100',
      width: 80
    }
  ],
  afterGetColHeader(col, th) {
    const cols3 = [0, 1, 2, 3, 4]
    const cols2 = [5, 6, 7]
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
  }
}
export const borrowBaseData = {
  computedMode: null,
  regionName: '',
  subItemName: null,
  regionType: null,
  availableDate: null,
  maxMiningVolume: null,
  maxMiningVolumeEarth: null,
  maxMiningVolumeStone: null,
  designEarthProportion: null,
  designStoneProportion: null,
  utilizationRatioEarth: null,
  utilizationRatioStone: null
}
export const borrowData = Array.from({ length: 200 }, () => ({ ...borrowBaseData }))
export const spoil = {
  columnHeaderHeight: 54,
  nestedHeaders: [['施工过程中土方量计算方式', '区域名称', '区域类型', '容量 (m³)）', '是否可二次回填', '可用起始日期']],
  columns: [
    {
      title: '施工过程中土方量计算方式',
      data: 'computedMode',
      type: 'dropdown', // 数值列
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: computedModeList
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
      title: '区域类型',
      data: 'regionType',
      type: 'dropdown',
      align: 'center',
      comments: '区域类型必选！',
      strict: true,
      allowInvalid: false,
      source: regionTypeList3
    },
    {
      title: '容量 (m³）',
      data: 'capacity',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '是否可二次回填',
      data: 'secondaryBackfill',
      width: 80,
      type: 'dropdown',
      strict: true,
      allowInvalid: false,
      align: 'center',
      source: trueList
    },
    {
      title: '可用起始日期',
      data: 'availableDate',
      type: 'date',
      align: 'center',
      allowInvalid: false,
      dateFormat: 'YYYY年M月D日', // 表内显示格式
      datePickerConfig: {
        i18n: {
          previousMonth: 'Previous Month',
          nextMonth: 'Next Month',
          months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          weekdays: ['日', '一', '二', '三', '四', '五', '六'],
          weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
        }
      }
    }
  ]
}
export const spoilBaseData = {
  computedMode: null,
  regionName: '',
  subItemName: null,
  regionType: null,
  capacity: null,
  secondaryBackfill: null,
  availableDate: null
}
export const spoilData = Array.from({ length: 200 }, () => ({ ...spoilBaseData }))
export const transit = {
  columnHeaderHeight: 54,
  nestedHeaders: [['施工过程中土方量计算方式', '区域名称', '区域类型', '是否为加工系统', '可接受料源', '容量 (m³）', '可用起始日期']],
  columns: [
    {
      title: '施工过程中土方量计算方式',
      data: 'computedMode',
      type: 'dropdown', // 数值列
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: computedModeList
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
      title: '区域类型',
      data: 'regionType',
      type: 'dropdown',
      align: 'center',
      comments: '区域类型必选！',
      strict: true,
      allowInvalid: false,
      source: regionTypeList4
    },
    {
      title: '是否为加工系统',
      data: 'processingSystem',
      width: 80,
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: trueList
    },
    {
      title: '可接受料源',
      data: 'materialSource',
      width: 120,
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      source: tsList
    },
    {
      title: '容量 (m³）',
      data: 'capacity',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '可用起始日期',
      data: 'availableDate',
      type: 'date',
      align: 'center',
      allowInvalid: false,
      dateFormat: 'YYYY年M月D日', // 表内显示格式
      datePickerConfig: {
        i18n: {
          previousMonth: 'Previous Month',
          nextMonth: 'Next Month',
          months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
          weekdays: ['日', '一', '二', '三', '四', '五', '六'],
          weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
        }
      }
    }
  ]
}
export const transitBaseData = {
  computedMode: null,
  regionName: '',
  subItemName: null,
  regionType: null,
  processingSystem: null,
  materialSelectOptions: null,
  capacity: null,
  availableDate: null
}
export const transitData = Array.from({ length: 200 }, () => ({ ...transitBaseData }))
export default {
  cutFill,
  borrow,
  spoil,
  transit,
  cutFillBaseData,
  borrowBaseData,
  spoilBaseData,
  transitBaseData,
  cutFillData,
  borrowData,
  spoilData,
  transitData
}
