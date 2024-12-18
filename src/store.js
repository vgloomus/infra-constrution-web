/*
 * @Author: your name
 * @Date: 2021-06-23 09:55:17
 * @LastEditTime: 2024-07-08 17:30:30
 * @LastEditors: lvzj
 * @Description: In User Settings Edit
 * @FilePath     : \infra-construction-web\src\store.js
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    size: { w: 0, h: 0 },
    org: {},
    menuCollapse: false,
    tenantId: '',
    cloudtToken: '',
    projectId: '', // 项目id
    orgFullId: '',
    frontConfig: {},
    userInfo: {},
    platformStore: {}, // 项企平台信息
    geipToken: '' // 项企平台token
  },
  actions: {},
  mutations: {
    /**
     * 获取平台返回的信息
     */
    setPlatformStore(state, data) {
      state.platformStore = data
    },
    setFrontConfig(state, data) {
      state.frontConfig = data
    },
    setSize(state, data) {
      state.size = data
    },
    setOrganization(state, data) {
      state.org = data
    },
    setMenuCollapse(state) {
      state.menuCollapse = !state.menuCollapse
    },
    setTenantId(state, data) {
      state.tenantId = data
    },
    setCloudtToken(state, data) {
      state.cloudtToken = data
    },
    setUserInfo(state, data) {
      state.userInfo = data
    },
    setProjectId(state, data) {
      state.projectId = data
    },
    setOrgFullId(state, data) {
      state.orgFullId = data
    },
    setGeipToken(state, data) {
      state.geipToken = data
    }
  }
})
