import Vue from 'vue'
import VueRouter from 'vue-router'
import routers from './router'
import App from './App.vue'
import vueWorker from 'vue-worker'
import myStore from './store'
import '@/components/basicComponents/index'
import NoContent from '@/components/NoContent'
import { setHeaders, MicroAppStore } from '@geip/portal-utils/lib/microApp'
import { getQueryString } from './utils'
import '@/styles/index.scss'
import '@/styles/icons.scss'
import i18n from './i18n' // 开启国际化引入此包
import localForage from 'localforage'

Vue.use(localForage)
Vue.use(VueRouter)
Vue.use(vueWorker)
Vue.component('NoContent', NoContent)
Vue.config.productionTip = false
Vue.prototype.$localForage = localForage
let instance = null
// Vue 根实例的 $data
const rootState = {
  orgId: null, // 门户当前组织ID
  orgType: '', // 门户当前组织类型
  orgFullId: '', // 门户当前组织的 fullId
  moduleCode: '', // 模块编码，用于界面中的权限控制
  authorityCodes: '', // 模块权限项，用于界面中的权限控制
  isI18nEnv: false, // 当前版本是否为国际化环境
  userId: '', // 可选; 当前用户ID
  tenantId: null, // 可选; 当前租户ID
  refresh: false // 可选; 仅在实例化 new MicroAppStore(props, { selfRefresh: true
  // }) 时配置为true才有效，具体参考下文中的 initStore()
}

// 初始化微应用状态管理，实现与门户之间的通信
function initStore(props) {
  const options = {
    selfRefresh: false // 当门户上下文变更时，是否自行实现数据刷新；默认是 false 门户会强行刷新子应用
  }
  const store = new MicroAppStore(props, options)
  // 可选：便于在组件中使用 store.setState() 方法设置门户全局状态，如：
  // this.$microAppStore.setState({ lang: 'zh-CN' })
  Vue.prototype.$microAppStore = store // 按需使用
  // 获取全局状态：
  // store.state // state对象包含所有的全局状态
  // 一、绑定状态变更事件
  // 1. 推荐方式：自动绑定状态变更事件，并处理相关逻辑，把状态放入Vue根实例rootState中；rootState 必传
  store.toBindStateChange({ rootState, setHeaders }, (value, prev) => {
    // console.log('当前状态变化', value)
    myStore.commit('setPlatformStore', value) // 存入子应用状态管理
    // 参数：value:最新状态对象，prev:上次的状态, 详情参考 qiankun 官方文档
    // 支持的状态：
    // {
    // ignore: 'appName', // 可用于判断是否忽略自己的变更
    // needRefreshApp: false, // 是否需要刷新子应用
    // selfRefresh: false, // 子应用是否实现了自行刷新功能
    // invalidToken: false, // token是否失效了
    // isForbidden: false, // 后端接口 403 无权限时为 true
    // errorMessage: '', // 后端接口返回的 非 401，403 的错误信息
    // orgFullId: '', // 门户当前组织的 fullId
    // orgId: '', // 门户当前组织ID，用于设置http headers
    // productCode: '', // 模块编码，用于界面中的权限控制和设置http headers
    // applicationCode: '',// 入口编码，主要用于子应用菜单间跳转
    // menuCode: '', // 菜单权限编码，用于设置http headers
    // token: '', // 门户token，用于设置http headers
    // moduleCode: '', // 模块编码，用于界面中的权限控制
    // authorityCodes: '', // 模块权限项，用于界面中的权限控制
    // userId: '', // 当前用户ID
    // tenantId: '', // 当前租户ID
    // projectId: '', // 当前项目ID
    // productsState: {}, // 存放产品私有状态
    // lang: 'zh-CN', // 当前国际化语言
    // themeColor: '#268dff',
    // isIntranet:false, //是否是私有化内网环境
    // isI18nEnv:false, //当前是否是国际化环境,
    // isWidget: false // 是否是首页部件
    // }
    // ...依赖全局状态，子应用可做一些扩展
    // ...与 Vuex，Redux 状态管理的集成等
  })
  // 2. 可选方式（不推荐）：需自行实现与平台门户的交互逻辑、绑定，比如使用Vuex，Redux管理状态
  // store.onStateChange((value, prev) => {})
  // 二、提供产品层私有全局状态管理能力 (可选)
  // 1. 设置产品私有的全局状态
  store.setProductState({})
  // 可以通过调用store.getProductState()取到上次设置的状态，判断其有效性，再决定是否需要覆盖设置，如下：
  // const productState = store.getProductState()
  // if (!productState) {
  // store.setProductState({ projectName: '测试项目' })
  // }
  // 2. 获取产品私有的全局状态
  store.getProductState() // return { projectName: '测试项目' }
}

// 路由白名单, 不受权限限制
const menuCodeWhitelist = ['error', 'infra_construction_business_share', 'infra_construction_projectSetting_regional', 'bim']
/**
 * render函数,初始化页面
 * @param {object} props 平台参数
 */
function render(props = {}) {
  const { container } = props
  const router = initRouter(props)
  instance = new Vue({
    router,
    store: myStore,
    data() {
      return rootState
    },
    i18n,
    render: (h) => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}
// 初始化router
function initRouter(props) {
  const { baseUrl } = props
  let routerTemp = []
  if (process.env.NODE_ENV === 'production') {
    // 获取当前菜单menuCode, 以子系统中菜单配置为准,非功能模块编码
    const menuCode = Vue.prototype.$microAppStore?.state?.menuCode || rootState.moduleCode || ''
    // console.log('当前menuCode', menuCode)
    // 根据menuCode过滤路由表, 路由表中menuCode需要与平台配置一一对应
    routerTemp = routers.filter((i) => {
      if (i.meta?.menuCode) {
        return menuCode.includes(i.meta.menuCode) || menuCodeWhitelist.includes(i.meta.menuCode)
      } else {
        return false
      }
    })
  } else {
    routerTemp = routers
  }
  const router = new VueRouter({
    mode: 'history',
    base: window.__POWERED_BY_QIANKUN__ ? `${baseUrl}` : `${process.env.BASE_URL}`,
    routes: routerTemp
  })
  routerBeforeEach(router)
  return router
}
// 路由守卫
function routerBeforeEach(router) {
  let redirectPath = ''
  // 全局前置守卫, 用于页面跳转, 仅在平台首次进入时指向path参数指向的地址
  router.beforeEach((to, form, next) => {
    console.log('%c导航信息', 'color: red;font-size: 20px', window.location.search, to, window.location.href)
    if (window.location.search) {
      const url = window.location.search
      redirectPath = getQueryString(url, 'path')
      const path = decodeURIComponent(redirectPath)
      // 判断是否进入
      // if (![null, '', 'null'].includes(path)) {
      //   if (to.path === '/' || to.path === '/index.html') {
      //     console.log(11, path)
      //     next({ path: `/${path}`, replace: true })
      //   } else if (to.name === 'error' && to.query.path) {
      //     console.log(11, path)
      //     next({ path: `/${path}`, replace: true })
      //   } else {
      //     redirectPath = ''
      //     next()
      //   }
      // } else {
      //   next()
      // }
      if (![null, '', 'null'].includes(path)) {
        if (to.path === '/' || to.path === '/index.html') {
          console.log('进入111', path, redirectPath)
          next({ path: `/${path}`, replace: true })
        } else {
          console.log('进入222', path, redirectPath)
          redirectPath = ''
          next()
        }
      } else {
        console.log('进入333', path, redirectPath)
        next()
      }
    } else {
      next()
    }
  })
}
// ---------------------------- 乾坤必要配置 begin ----------------------------
// eslint-disable-next-line
var __webpack_public_path__ = ''
// 单独运行
if (!window.__POWERED_BY_QIANKUN__) {
  render()
} else {
  // eslint-disable-next-line
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ // 重要:运行时资源路径
  // console.log('运行时路径', window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__)
}
/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 */
export async function bootstrap() {
  console.log('[vue] vue app bootstraped')
}
/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  console.log('[vue] props from main framework', props)
  initStore(props)
  Vue.prototype.$microAppRouter = props.microAppRouter // 可选：详情参阅 3.平台门户路由 -> 1)微应用导航、2)路由导航守位
  Vue.prototype.$openWindow = props.openWindow // 可选：详情参阅 3.平台门户路由 ->3)新窗口独立浏览微应用
  render(props)
}
/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
// ---------------------------- 乾坤必要配置 end ----------------------------
