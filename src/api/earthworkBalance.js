import Services from './baseServices'

const baseUrl = '/api'
export const services = new Services(baseUrl)

// 获取施工时间段列表
export const getRangeTimeList = (projectId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/stage`)
}

// 获取工程量清单
export const getQuantityList = (projectId, params) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/quantities`, { params })
}

// 保存施工阶段
export const saveRangeTime = (projectId, data) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/quantities`, data)
}

// 查询工程量
export const getQuantityTableData = (projectId, quantityId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/quantity/${quantityId}/statistics`)
}

// 添加工程量
export const addQuantityData = (projectId, quantityId, taskId, periodsComparisonId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/quantity/${quantityId}/statistics/with-biz`, {
    params: {
      ...(taskId && { taskId }),
      ...(periodsComparisonId && { periodsComparisonId })
    }
  })
}

// 保存工程量表格数据
export const saveQuantityTableData = (projectId, quantityId, data) => {
  return services.baseService.post(`/earthwork/projects/${projectId}/quantity/${quantityId}/statistics`, data)
}

// 获取施工子项
export const getSubitemList = (projectId, quantityId) => {
  return services.baseService.get(`/earthwork/projects/${projectId}/quantity/${quantityId}/sub-items`)
}
