<!--
 * @Author: your name
 * @Date: 2021-06-23 09:55:17
 * @LastEditTime: 2024-08-14 10:29:00
 * @LastEditors: lvzj lvzj@glodon.com
 * @Description: In User Settings Edit
 * @FilePath     : \infra-construction-web\src\App.vue
-->
<template>
  <div
    id="app"
    v-cloak
  >
    <Layout />
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import { floor, debounce } from 'lodash'
import Layout from '@/components/layout/index.vue'
import { BURYING_POINT_VERSION, BURYING_POINT_PCODE, buryingPoint } from '@/utils/buryingPoint'
import { mapState } from 'vuex'

export default {
  name: 'App',
  components: { Layout },
  data() {
    return {
      start: new Date().valueOf()
    }
  },
  computed: {
    ...mapState(['projectId', 'tenantId', 'platformStore'])
  },
  async created() {
    console.log('app created')
    const geipToken = localStorage.getItem('geipToken')
    const geipOrgId = sessionStorage.getItem('geipOrgId')
    const geipOrgFullId = sessionStorage.getItem('geipOrgFullId')
    if (geipOrgId) Cookies.set('bimtwinsProjectId', geipOrgId)
    if (geipOrgFullId) Cookies.set('orgFullId', geipOrgFullId)
    if (geipToken) Cookies.set('geipToken', geipToken)

    const projectId = Cookies.get('bimtwinsProjectId')
    const cloudtToken = Cookies.get('.CLOUD_ACCESS_TOKEN')
    const tenantId = Cookies.get('.CLOUDT_TENANT_ID')
    const orgFullId = Cookies.get('orgFullId')

    this.$store.commit('setProjectId', projectId)
    this.$store.commit('setCloudtToken', cloudtToken)
    this.$store.commit('setTenantId', tenantId)
    this.$store.commit('setOrgFullId', orgFullId)
    this.$store.commit('setGeipToken', geipToken)

    this.setSize()
    window.onresize = debounce(this.setSize, 200)

    // const { getUserInfo } = require('@/api/projectInfo')
    // getUserInfo(cloudtToken).then(res => {
    //   if (res) {
    //     this.$store.commit('setUserInfo', res)
    //   }
    // })
  },
  mounted() {
    // this.initBurying()
  },
  beforeDestroy() {
    window.onresize = null
    // this.pageBeaForeLeave()
  },
  methods: {
    // 初始化埋点
    initBurying() {
      const hostName = window.location.hostname
      const isProd = hostName.includes('xmgl.glodon.com')
      window.Report.defineCom({
        pcode: BURYING_POINT_PCODE,
        ver: BURYING_POINT_VERSION,
        tenantid: this.tenantId,
        stdprjid: this.projectId,
        sessionid: '0630',
        debug: !isProd
      })
    },
    // 离开页面埋点
    pageBeaForeLeave() {
      const fncode = this.$route.meta.fncode
      const curTime = new Date().valueOf()
      if (fncode) {
        buryingPoint(fncode, {
          duration: floor((curTime - this.start) / 1000) + ''
        })
      }
    },
    setSize() {
      const { offsetWidth, offsetHeight } = document.getElementById('app')
      this.$store.commit('setSize', { w: offsetWidth, h: offsetHeight })
    }
  }
}
</script>
<style lang="scss" scoped>
  #app {
    width: 100%;
    height: 100%;
    min-height: 100%;
    position: relative;
    font-size: 14px;
    color: #4e5969;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  [v-cloak] {
    display: none !important;
  }
</style>
