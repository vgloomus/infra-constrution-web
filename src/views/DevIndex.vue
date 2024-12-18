<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-07-30 13:46:54
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-06 09:23:40
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\DevIndex.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

<template>
  <el-container class="container">
    <i
      class="el-icon-d-arrow-right"
      @click="drawer = true"
    ></i>
    <el-container class="container">
      <el-main class="main-content">
        <keep-alive>
          <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
      </el-main>
    </el-container>
    <el-drawer
      title="开发-路由列表"
      :visible.sync="drawer"
      direction="ltr"
      size="250px"
    >
      <el-menu :default-openeds="['1']">
        <el-menu-item
          v-for="(route, index) in routeList"
          :key="index"
          :index="route.path"
        >
          <router-link
            :to="route.path"
            @click.native="drawer = false"
            :class="['routerItem', { hightLight: isPresent(route.name) }]"
          >
            {{ route.meta?.title || route.name }}
          </router-link>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </el-container>
</template>

<script>
import router from '@/router'
export default {
  data() {
    return {
      drawer: false,
      routeList: []
    }
  },
  mounted() {
    this.routeList = router[0].children.filter(x => {
      if (x.path && x.path.length > 1) {
        return x
      }
      return false
    })
  },
  methods: {
    isPresent(name) {
      return this.$route.name === name
    }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    height: 100%;
  }
  .main-content {
    position: relative;
    height: 100%;
    padding: 0;
  }
  .menu-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    overflow: hidden;
    height: 100%;
  }
  .child {
    margin-right: 10px;
  }
  .el-icon-d-arrow-right {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 999;
    font-size: 20px;
    cursor: pointer;
    color: #2572e5;
  }
  .routerItem {
    color: #000000;
    text-decoration: none;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .hightLight {
    color: #2572e5;
  }
</style>
