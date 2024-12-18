/*
 * @Description  : 请求实例,此实例会携带orgId
 * @Author       : 吕宗军
 * @Date         : 2023-04-10 14:34:37
 * @LastEditTime: 2024-09-13 10:01:51
 * @LastEditTime: 2023-08-25 10:01:28
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\api\baseServices.js
 */

import axios from 'axios'
import Cookies from 'js-cookie'
import { Notification, Message } from '@geip/basic-components'
import { sysLogout } from '@/common/sysLogout'
import setHttpBaseHeader from './config'
// import { getQueryString } from '@/utils'

const baseApi = process.env.VUE_APP_BASE_API

class Services {
  constructor(baseURL = '', timeout = 60000) {
    // 基础service
    this.baseService = this.BaseService(`${baseApi}${baseURL}`, timeout)
    // 上传
    this.uploadService = this.UploadService()
  }

  // 创建axios实例
  createAxios(baseURL = '', header = {}, timeout = 60000) {
    const defaultHeaders = {
      Accept: 'application/json, text/plain, */*'
    }
    const resultHeaders = Object.assign(
      {},
      {
        ...defaultHeaders
      },
      {
        ...header
      }
    )
    return axios.create({
      baseURL,
      headers: resultHeaders,
      timeout: timeout
    })
  }

  // axios拦截Request
  // hasAuth: 是否需要认证信息
  handleRequest(service, hasAuth = true) {
    service.interceptors.request.use(
      (config) => {
        const { url } = config
        config.url += `${url.indexOf('?') > -1 ? '&' : '?'}_ts=${new Date().getTime()}`
        return hasAuth ? setHttpBaseHeader(config) : config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    return service
  }

  // axios拦截Response
  handleResponse(service) {
    service.interceptors.response.use(
      (response) => {
        // console.log('axios拦截Response', response)
        const { config, data, status } = response
        const { code, data: _data, message } = data
        const isGet = config.method === 'get'
        if (Number(code) === 401) {
          sysLogout()
          return Promise.reject(data || 'error')
        } else if (status && status >= 200 && status < 300) {
          // 返回类型是二进制流或者blob时直接返回
          // if (['arraybuffer', 'blob'].includes(config.responseType)) {
          //   return this.handleArrayBuffer(config, data, headers)
          // }
          if (code === 0) {
            return Promise.resolve(isGet ? _data : data)
          } else {
            Message({
              message: message || 'error',
              type: 'error'
            })
            return Promise.reject(data || 'error')
          }
        } else {
          Notification({
            type: 'error',
            message: '从服务器获取数据发生错误！'
          })
          return Promise.reject(data || 'error')
        }
      },
      (error) => {
        const { data = {} } = error?.response || {}
        const { code, message } = data
        if (Number(code) === 401) {
          sysLogout()
          return Promise.reject(message || 'error')
        }
        if (error.code === 'ERR_CANCELED') {
          return Promise.reject(error || 'error')
        }
        Notification({
          type: 'error',
          message: '从服务器获取数据发生错误！'
        })
        return Promise.reject(error || 'error')
      }
    )
    return service
  }

  handleArrayBuffer(config, data, headers) {
    if (headers['content-type'] === 'application/json' && config.responseType === 'arraybuffer') {
      const env = new TextDecoder('utf-8')
      const uintMsg = new Uint8Array(data)
      const newData = JSON.parse(env.decode(uintMsg))
      Message({
        message: newData.message,
        type: 'error'
      })
      return Promise.reject(data)
    }
    return Promise.resolve(data)
  }

  BaseService(baseURL, timeout = 60000) {
    const cloudToken = Cookies.get('.CLOUD_ACCESS_TOKEN')
    const service = this.createAxios(
      baseURL,
      {
        Authorization: `Bearer ${cloudToken}`
      },
      timeout
    )
    return this.handleResponse(this.handleRequest(service, true))
  }

  UploadService(baseURL, isAuth = false) {
    const cloudToken = Cookies.get('.CLOUD_ACCESS_TOKEN')
    const service = this.createAxios(
      baseURL,
      {
        Authorization: `Bearer ${cloudToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      600000
    )
    return this.handleResponse(this.handleRequest(service, false))
  }
}

export default Services
