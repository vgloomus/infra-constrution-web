/*
 * @author: lvzj
 * @Date: 2023-06-16 13:30:30
 * @LastEditors: lvzj
 * @LastEditTime: 2024-08-02 14:28:04
 * @description: file content1.1.230630.02
 */
import moment from 'moment'
import store from '@/store'

export const BURYING_POINT_VERSION = '1.3.0.1'
export const BURYING_POINT_PCODE = '146166'
export const BURYING_POINT_GROUP = {
  1: '数据准备'
}
export const BURYING_POINT_MAP = {
  100101: '模型-页面'
}
export function buryingPoint(code, data = {}) {
  if (!code) return
  if (process.env.NODE_ENV === 'development') {
    return
  }
  const params = {
    fngroup: BURYING_POINT_GROUP[parseInt(code / 100000)],
    fncode: code + '',
    fnname: BURYING_POINT_MAP[code],
    trigertime: moment().format('YYYY/MM/DD HH:mm:ss SSS'),
    sessionid: '0630',
    gid: store?.state?.userInfo?.userId || 'null',
    device_id: store?.state?.platformStore?.userId || 'null',
    ...data
  }
  window?.Report?.track(params)
}
