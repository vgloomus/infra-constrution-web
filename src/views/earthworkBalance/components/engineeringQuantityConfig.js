// import i18n from '@/i18n'
// console.log(i18n.t('fetchingLink'))

// const computedModeHtmlList = [
//   '<span class="computed-mode computed-mode1">测量收方模块(横断面法)</span>',
//   '<span class="computed-mode computed-mode2">两期对比模块(地形扣减法)</span>',
//   '<span class="computed-mode computed-mode3">人工填报</span>'
// ]
// const useHtmlList = ['<span class="use1">可利用</span>', '<span class="use2">不可利用</span>', '<span class="use3">可利用+不可利用</span>']
// const useList = ['可利用', '不可利用', '可利用+不可利用']
// const regionTypeHtmlList1 = ['<span class="region-type1">挖方区</span>', '<span class="region-type2">填方区</span>']
// const regionTypeHtmlList2 = ['<span class="region-type3">借方区</span>']
// const regionTypeHtmlList3 = ['<span class="region-type4">弃土场</span>']
// const regionTypeHtmlList4 = ['<span class="region-type5">中转场</span>']

const regionTypeList1 = ['挖方区', '填方区']
// const trueHtmlList = trueList
// const tsHtmlList = tsList
export const cutFillArea = {
  nestedHeaders: [
    [
      '区域名称',
      '子项名称',
      '区域类型',
      { label: '设计量(m³)', colspan: 3 },
      { label: '开累量(m³)', colspan: 3 },
      { label: '本期量(m³)', colspan: 3 },
      { label: '剩余量(m³)', colspan: 3 }
    ],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '总', '土', '石', '总', '土', '石', '总', '土', '石', '总', '土', '石']
  ],
  columns: [
    {
      title: '区域名称',
      data: 'regionName',
      type: 'text', // 字符列
      align: 'center',
      width: 120,
      comments: '名称必填，不能重复，且不大于50个字符'
    },
    {
      title: '子项名称',
      data: 'subItemName',
      type: 'text', // 数值列
      align: 'center',
      width: 90,
      comments: '名称必填，相同区域内子项名称不能重复，且不大于50个字符'
    },
    {
      title: '区域类型',
      data: 'regionType',
      type: 'dropdown',
      align: 'center',
      strict: true,
      allowInvalid: false,
      width: 68,
      comments: '区域类型必选，且同区域类型需相同！',
      source: regionTypeList1
    },
    {
      title: '总',
      data: 'designVolume',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 90
    },
    {
      title: '土',
      data: 'designEarthVolume',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 90
    },
    {
      title: '石',
      data: 'designStoneVolume',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 90
    },
    {
      title: '总',
      data: 'accumulatedVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100！',
      align: 'center',
      width: 90
    },
    {
      title: '土',
      data: 'accumulatedEarthVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100！',
      align: 'center',
      width: 90
    },
    {
      title: '石',
      data: 'accumulatedStoneVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '总',
      data: 'currentVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '土',
      data: 'currentEarthVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '石',
      data: 'currentStoneVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '总',
      data: 'remainingVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '土',
      data: 'remainingEarthVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '石',
      data: 'remainingStoneVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    }
  ],
  afterGetColHeader(col, th) {
    const cols3 = [0, 1, 2]
    const cols2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
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
export const cutFillAreaBaseData = {
  regionName: null,
  subItemName: null,
  regionTypeId: null,
  designVolume: null, // 设计量(总)
  designEarthVolume: null, // 设计量(土)
  designStoneVolume: null, // 设计量(石)
  accumulatedVolume: null, // 开累量(总)
  accumulatedEarthVolume: null, // 开累量(土)
  accumulatedStoneVolume: null, // 开累量(石)
  currentVolume: null, // 本期量(总)
  currentEarthVolume: null, // 本期量(土)
  currentStoneVolume: null, // 本期量(石)
  remainVolume: null, // 剩余量(总)
  remainEarthVolume: null, // 剩余量(土)
  remainStoneVolume: null // 剩余量(石)
}

export const cutFillAreaData = Array.from({ length: 200 }, () => ({ ...cutFillAreaBaseData }))

export const borrow = {
  nestedHeaders: [
    [
      '区域名称',
      '子项名称',
      { label: '最大开采量(m³)', colspan: 3 },
      { label: '开累量(m³)', colspan: 3 },
      { label: '本期量(m³)', colspan: 3 },
      { label: '剩余量(m³)', colspan: 3 }
    ],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '总', '土', '石', '总', '土', '石', '总', '土', '石', '总', '土', '石']
  ],
  columns: [
    {
      title: '区域名称',
      data: 'regionName',
      type: 'text', // 字符列
      align: 'center',
      width: 120,
      comments: '名称必填，不能重复，且不大于50个字符'
    },
    {
      title: '子项名称',
      data: 'subItemName',
      type: 'text', // 数值列
      align: 'center',
      width: 90,
      comments: '名称必填，相同区域内子项名称不能重复，且不大于50个字符'
    },
    {
      title: '总',
      data: 'maxMiningVolume',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 90
    },
    {
      title: '土',
      data: 'maxMiningEarthVolume',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 90
    },
    {
      title: '石',
      data: 'maxMiningStoneVolume',
      type: 'numeric',
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 90
    },
    {
      title: '总',
      data: 'accumulatedVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100！',
      align: 'center',
      width: 90
    },
    {
      title: '土',
      data: 'accumulatedEarthVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100！',
      align: 'center',
      width: 90
    },
    {
      title: '石',
      data: 'accumulatedStoneVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '总',
      data: 'currentVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '土',
      data: 'currentEarthVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '石',
      data: 'currentStoneVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '总',
      data: 'remainingVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '土',
      data: 'remainingEarthVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    },
    {
      title: '石',
      data: 'remainingStoneVolume',
      type: 'numeric',
      comments: '必须为数字，最多保留两位小数且不大于100',
      align: 'center',
      width: 90
    }
  ],
  afterGetColHeader(col, th) {
    const cols3 = [0, 1]
    const cols2 = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
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
  regionName: null,
  subItemName: null,
  maxMiningVolume: null, // 最大开采量(总)
  maxMiningEarthVolume: null, // 最大开采量(土)
  maxMiningStoneVolume: null, // 最大开采量(石)
  accumulatedVolume: null, // 开累量(总)
  accumulatedEarthVolume: null, // 开累量(土)
  accumulatedStoneVolume: null, // 开累量(石)
  currentVolume: null, // 本期量(总)
  currentEarthVolume: null, // 本期量(土)
  currentStoneVolume: null, // 本期量(石)
  remainVolume: null, // 剩余量(总)
  remainEarthVolume: null, // 剩余量(土)
  remainStoneVolume: null // 剩余量(石)
}
export const borrowData = Array.from({ length: 200 }, () => ({ ...borrowBaseData }))
export const spoil = {
  columnHeaderHeight: 54,
  nestedHeaders: [['区域', '容量 (m³)', '开累回填量 (m³)', '本期回填量 (m³)', '剩余容量 (m³)']],
  columns: [
    {
      title: '区域',
      data: 'regionName',
      type: 'text', // 字符列
      align: 'center',
      width: 150,
      comments: '名称必填，不能重复，且不大于50个字符'
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
      title: '开累回填量 (m³）',
      data: 'accumulatedBackFillVolume',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '本期回填量 (m³）',
      data: 'currentBackFillVolume',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    },
    {
      title: '剩余容量 (m³）',
      data: 'remainCapacity',
      type: 'numeric', // 下拉选择列
      align: 'center',
      comments: '必须为数字，最多保留两位小数，且整数部分不超过11位！',
      width: 80
    }
  ]
}
export const spoilBaseData = {
  regionName: '',
  capacity: null,
  accumulatedBackFillVolume: null,
  currentBackFillVolume: null,
  remainCapacity: null
}
export const spoilData = Array.from({ length: 200 }, () => ({ ...spoilBaseData }))
export default {
  cutFillArea,
  borrow,
  spoil,
  cutFillAreaBaseData,
  borrowBaseData,
  spoilBaseData,
  cutFillAreaData,
  borrowData,
  spoilData
}
