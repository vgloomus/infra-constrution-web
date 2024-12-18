/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-11-07 14:50:58
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-17 11:28:05
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\i18n\zh.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default {
  addNew: '新增',
  loading: '数据加载中...',
  sceneDataLoading: '场景数据加载中...',
  saving: '保存中...',
  collectDate: '采集日期',
  id: 'ID',
  name: '名称',
  updateTime: '更新时间',
  operator: '操作人员',
  edit: '编辑',
  share: '分享',
  save: '保存',
  return: '返回',
  download: '成果下载',
  delete: '删除',
  confirmDelete: '确定删除吗？',
  shareLink: '链接分享',
  successCreatedLink: '成功创建分享链接',
  fetchingLink: '正在获取分享链接...',
  input: '请输入内容',
  cancel: '取消',
  confirm: '确定',
  copy: '复制',
  createTask: '新建任务',
  taskName: '任务名称',
  enterTaskName: '请输入任务名称',
  startDate: '开始日期',
  endDate: '结束日期',
  to: '至',
  packUp: '收起',
  noData: '暂无数据',
  submit: '提交',
  removed: '已移除',
  restore: '恢复',
  // 测量收方
  measurement: {
    startMatching: '开始匹配',
    reMatching: '重新匹配',
    noLayerData: '暂无图层数据',
    noMeasurementResult: '暂无收方成果数据',
    noSectionComparisonData: '暂无横断面对比数据',
    noDataSync: '暂无数据，请同步数据',
    clickSectionComparisonData: '请点击左侧断面对比数据',
    participateCalculation: '参与收方计算的桩号，其断面必须全部在场景中的地形范围内',
    calculateFailed: '计算失败',
    matchFailed: '匹配失败',
    reCompute: '重新计算'
  },
  // 图纸
  drawing: {
    addDrawing: '新增图纸',
    uploadTip: '文件上传中，您可随时点击“确定”，稍后将完成上传。',
    dragFiles: '将文件拖到此处，或',
    clickUpload: '点击上传',
    supportedFormats: '仅支持 .dwg 格式',
    tooltipContent: '启用后此图纸将会在所有场景中作为设计数据出现',
    switchInactiveText: '启用',
    updateTimeLabel: '更新于'
  },
  // 断面对比
  section: {
    computedStart: '断面计算发起',
    currentReceiverBasis: '当前收方基准',
    note: '（对比断面时，系统默认选择日期较新的断面结果为基准；无法判断时，请手动选择）'
  },
  // 模板
  template: {
    placeHolder: '请输入模板名称',
    unnamedTemplate: '未命名模板'
  },
  // 挖填方信息卡片
  excavation: {
    excavationArea: '挖方面积',
    fillArea: '填方面积',
    design: '设计',
    accumulated: '开累',
    earth: '土',
    stone: '石',
    current: '本期',
    remaining: '剩余'
  },
  // 图表折叠
  chartCollapseChart: {
    section: '横断面',
    close: '关闭',
    correct: '修正'
  },
  // 下载图纸弹窗
  downloadDrawingDialog: {
    title: '下载',
    download: '下载',
    sectionComparisonDrawingName: '横断面两期收方图纸',
    sectionComparisonLedgerName: '横断面两期收方台账',
    sectionDrawingName: '横断面收方图纸',
    sectionLedgerName: '横断面收方台账',
    drawingName: '收方图纸',
    ledgerName: '收方台账',
    section: '横断面',
    sectionComparison: '横断面两期'
  },
  // 简化配置
  simplifyConfig: {
    removeOverExcavation: '去除超挖区',
    removeOverFill: '去除超填区',
    removeAboveGround: '去除原地面线以上的收方线',
    flattenLine: '拉平摊铺线',
    closeEarthworkDesignLine: '闭合收方线与设计线',
    simplifyLine: '简化收方线',
    simplifyLineTooltip: '保留收方线整体特征的同时按百分比减少线上点的数量',
    applyTo: '应用到：',
    currentSection: '当前断面',
    currentArea: '当前区域',
    allAreas: '全部区域',
    reset: '重置',
    cancel: '取消',
    confirm: '确定'
  },
  // 步骤卡片
  stepCard: {
    matchTerrain: '匹配地形',
    earthworkCalculation: '土方计算'
  },
  // 收方模板
  recipientTemplate: {
    newTemplate: '新建收方模版',
    loadingData: '数据加载中...',
    tooltipContent: '启用后此模板将会应用于所有测量收方场景中。注意：只允许启用1个模板',
    switchInactiveText: '启用',
    updateTimeLabel: '更新于',
    edit: '编辑'
  },
  // 模板编辑
  templateEdit: {
    placeHolder: '请输入模板名称',
    addArea: '新增区域',
    addAreaData: '新增区域数据'
  },
  // 新增区域弹窗
  addAreaDialog: {
    title: '新增区域数据',
    dataType: '数据类型',
    selectDataType: '请选择数据类型',
    stoneBoundary: '土石分界',
    baseBoundary: '基底分界',
    terrainSection: '断面数据',
    name: '名称',
    enterName: '请输入名称',
    area: '所属区域',
    selectArea: '请选择所属区域',
    measurementTime: '测量时间',
    startDate: '开始日期',
    endDate: '结束日期',
    file: '文件',
    reupload: '重新上传',
    uploadFile: '上传文件',
    supportedFormats: '仅支持{format}格式'
  },
  // 卡片
  card: {
    enable: '启用',
    transforming: '转换中...',
    queuing: '排队中...',
    transformFailed: '转换失败'
  },
  // 场景
  scene: {
    longitude: '经度',
    latitude: '纬度',
    layerList: '图层列表',
    measurePoint: '点测量',
    measureDistance: '距离测量',
    measureArea: '多边型面积测量',
    measureTriangle: '三角面测量',
    measureAngle: '角度测量',
    clear: '清除',
    spatialArea: '空间面积测量',
    projectedArea: '投影面积测量',
    surfaceArea: '贴地面积测量'
  },
  // 区域管理
  region: {
    addData: '批量添加数据',
    cutFill: '挖方区',
    fillArea: '填方区',
    cutFillArea: '挖填方区',
    borrow: '借方区',
    spoil: '弃土场',
    transit: '中转场',
    information: '基本信息',
    name: '区域名称',
    regionName: '所属区域名称',
    subName: '子项名称',
    type: '区域类型',
    date: '可用起始日期',
    backfill: '可二次回填',
    processing: '可加工系统',
    capacity: '容量',
    excavationDesignVolume: '挖方设计量',
    fillDesignVolume: '填方设计量',
    maxExcavationVolume: '最大开采量',
    designEarthStonePercentage: '设计土石比例',
    utilizationRatio: '利用率',
    MaterialSource: '材源要求（是否可利用）',
    accumulated: '开累',
    earth: '土',
    stone: '石',
    rangeLine: '范围线',
    calculation: '施工过程中土方量计算方式',
    calculationMethod: '选择计算方式',
    dragFiles: '将文件拖到此处，或',
    clickUpload: '点击上传',
    retry: '重新上传',
    delete: '删除',
    uploadLimitExceeded: '上传文件数量超出限制',
    supportedFormats: '请上传.dxf格式文件，大小50Mb以内；范围线闭合且线段之间不相交。',
    errorFormat: '范围线闭合且线段之间不相交',
    manualFill: '人工填报',
    measurementReceivingModule: '测量收方模块(横断面法)',
    sectionComparisonModule: '两期对比模块(地形扣减法)'
  },
  twoPhases: {
    addData: '新增两期对比的地形与区域',
    calculationRegion: '计算区域'
  },
  addQuantityDialog: {
    measurement: '测量收方',
    sectionComparison: '两期对比',
    manageSubItems: '管理施工子项',
    cutFillArea: '挖填方区',
    borrow: '借方区',
    spoil: '弃土场'
  }
}
