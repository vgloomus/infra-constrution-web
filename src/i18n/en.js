export default {
  addNew: 'addNew',
  loading: 'Loading data...',
  sceneDataLoading: 'Scene data loading...',
  saving: 'Saving...',
  collectDate: 'Collection Date',
  id: 'ID',
  name: 'name',
  updateTime: 'Update Time',
  operator: 'Operator',
  edit: 'Edit',
  share: 'Share',
  save: 'Save',
  return: 'Return',
  download: 'Download',
  delete: 'Delete',
  confirmDelete: 'Are you sure you want to delete?',
  shareLink: 'Share Link',
  successCreatedLink: 'Successfully created the sharing link',
  fetchingLink: 'Fetching sharing link...',
  input: 'Please enter content',
  cancel: 'Cancel',
  confirm: 'Confirm',
  copy: 'Copy',
  createTask: 'New Task',
  taskName: 'Task Name',
  enterTaskName: 'Please enter task name',
  startDate: 'Start Date',
  endDate: 'End Date',
  to: 'to',
  packUp: 'Pack Up',
  noData: 'No data',
  submit: 'Submit',
  removed: 'Removed',
  restore: 'Restore',
  // 测量收方
  measurement: {
    startMatching: 'Start Matching',
    reMatching: 'Restart Match',
    noLayerData: 'No Layer Data',
    noMeasurementResult: 'No Measurement Result',
    noSectionComparisonData: 'No Section Comparison Data',
    noDataSync: 'No data, please sync data first',
    clickSectionComparisonData: 'Please click on the left section comparison data',
    participateCalculation: 'The pile numbers participating in the measurement calculation must all be within the terrain range of the scene',
    calculateFailed: 'Calculation Failed',
    matchFailed: 'Match Failed',
    reCompute: 'Recompute'
  },
  // 图纸
  drawing: {
    addDrawing: 'Add Drawing',
    uploadTip: 'File is uploading, you can click "Confirm" at any time, and the upload will be completed later.',
    dragFiles: 'Drag files here, or',
    clickUpload: 'click to upload',
    supportedFormats: 'Only .dwg format is supported',
    tooltipContent: 'Once enabled, this drawing will appear as design data in all scenarios',
    switchInactiveText: 'Enable',
    updateTimeLabel: 'Updated at'
  },
  // 断面对比
  section: {
    computedStart: 'Section Calculation Initiated',
    currentReceiverBasis: 'Current Receiver Basis',
    note: '(When comparing sections, the system defaults to the more recent section result as the basis; if it cannot be determined, please select manually.)'
  },
  // 模板
  template: {
    placeHolder: 'Please enter template name',
    unnamedTemplate: 'Unnamed Template'
  },
  // 挖填方信息卡片
  excavation: {
    excavationArea: 'Excavation Area',
    fillArea: 'Fill Area',
    design: 'Design',
    accumulated: 'Accumulated',
    earth: 'Earth',
    stone: 'Stone',
    current: 'Current',
    remaining: 'Remaining'
  },
  // 图表折叠
  chartCollapseChart: {
    section: 'Section',
    close: 'Close',
    correct: 'Correct'
  },
  // 下载图纸弹窗
  downloadDrawingDialog: {
    title: 'Download',
    download: 'Download',
    sectionComparisonDrawingName: 'Cross-section Two-phase Measurement Drawing',
    sectionComparisonLedgerName: 'Cross-section Two-phase Measurement Ledger',
    sectionDrawingName: 'Cross-section Measurement Drawing',
    sectionLedgerName: 'Cross-section Measurement Ledger',
    drawingName: 'Cross-section Drawing',
    ledgerName: 'Cross-section Ledger',
    section: 'Section',
    sectionComparison: 'Two-phase Section Comparison'
  },
  // 简化配置
  simplifyConfig: {
    removeOverExcavation: 'Remove Over-excavation Area',
    removeOverFill: 'Remove Over-fill Area',
    removeAboveGround: 'Remove Measurement Line Above Ground Line',
    flattenLine: 'Flatten Paving Line',
    closeEarthworkDesignLine: 'Close Measurement Line with Design Line',
    simplifyLine: 'Simplify Measurement Line',
    simplifyLineTooltip: 'Reduce the number of points on the line by percentage while retaining the overall characteristics of the measurement line',
    applyTo: 'Apply to:',
    currentSection: 'Current Section',
    currentArea: 'Current Area',
    allAreas: 'All Areas',
    reset: 'Reset',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  // 步骤卡片
  stepCard: {
    matchTerrain: 'Match Terrain',
    earthworkCalculation: 'Earthwork Calculation'
  },
  // 收方模板
  recipientTemplate: {
    newTemplate: 'New Recipient Template',
    loadingData: 'Loading data...',
    tooltipContent: 'Once enabled, this template will be applied to all measurement recipient scenarios. Note: Only one template can be enabled.',
    switchInactiveText: 'Enable',
    updateTimeLabel: 'Updated at',
    edit: 'Edit'
  },
  // 模板编辑
  templateEdit: {
    placeHolder: 'Please enter template name',
    addArea: 'Add Area',
    addAreaData: 'Add Area Data'
  },
  // 新增区域弹窗
  addAreaDialog: {
    title: 'Add Area Data',
    dataType: 'Data Type',
    selectDataType: 'Please select data type',
    stoneBoundary: 'Stone Boundary',
    baseBoundary: 'Base Boundary',
    terrainSection: 'Terrain Section',
    name: 'Name',
    enterName: 'Please enter name',
    area: 'Area',
    selectArea: 'Please select area',
    measurementTime: 'Measurement Time',
    startDate: 'Start Date',
    endDate: 'End Date',
    file: 'File',
    reupload: 'Reupload',
    uploadFile: 'Upload File',
    supportedFormats: 'Only supports {format} format'
  },
  // 卡片
  card: {
    enable: 'Enable',
    transforming: 'Transforming...',
    queuing: 'Queuing...',
    transformFailed: 'Transform Failed'
  },
  // 场景
  scene: {
    longitude: 'Longitude',
    latitude: 'Latitude',
    layerList: 'Layer List',
    measurePoint: 'Measure Point',
    measureDistance: 'Measure Distance',
    measureArea: 'Measure Area',
    measureTriangle: 'Measure Triangle',
    measureAngle: 'Measure Angle',
    clear: 'Clear',
    spatialArea: 'Spatial Area',
    projectedArea: 'Projected Area',
    surfaceArea: 'Surface Area'
  },
  // 区域管理
  region: {
    addData: 'Batch Add Data',
    cutFill: 'Cut and Fill Area',
    cutFillArea: 'Cut and Fill Area',
    fillArea: 'Fill Area',
    borrow: 'Borrow Area',
    spoil: 'Spoil Area',
    transit: 'Transit Area',
    information: 'Basic Information',
    name: 'Area Name',
    regionName: 'Region Name',
    subName: 'Sub-item Name',
    type: 'Area Type',
    date: 'Available Start Date',
    backfill: 'Secondary Backfill',
    processing: 'Processing',
    capacity: 'Capacity',
    excavationDesignVolume: 'Excavation Design Volume',
    fillDesignVolume: 'Fill Design Volume',
    maxExcavationVolume: 'Maximum Excavation Volume',
    designEarthStonePercentage: 'Design Earth-Stone Percentage',
    utilizationRatio: 'Utilization Ratio',
    MaterialSource: 'Material Source Requirements (Is it available?)',
    accumulated: 'Accumulated',
    earth: 'Earth',
    stone: 'Stone',
    rangeLine: 'Range Line',
    calculation: 'Earthwork Calculation Method During Construction',
    calculationMethod: 'Select Calculation Method',
    dragFiles: 'Drag files here, or',
    clickUpload: 'click to upload',
    retry: 'Retry Upload',
    delete: 'Delete',
    uploadLimitExceeded: 'Upload limit exceeded',
    supportedFormats: 'Please upload .dxf format files, within 50Mb',
    errorFormat: 'Range line is closed and line segments do not intersect',
    manualFill: 'Manual Fill',
    measurementReceivingModule: 'Measurement Receiving Module (Cross-section Method)',
    sectionComparisonModule: 'Section Comparison Module (Terrain Reduction Method)'
  },
  twoPhases: {
    addData: 'Add two new phases of terrain and regions for comparison',
    calculationRegion: 'Calculation Region'
  },
  addQuantityDialog: {
    measurement: 'measurement',
    sectionComparison: 'section comparison',
    manageSubItems: 'manage sub-items',
    cutFillArea: 'Cut and Fill Area',
    borrow: 'Borrow Area',
    spoil: 'Spoil Area'
  }
}
