<!--
 * @author: lvzj
 * @Date: 2024-08-07 13:49:04
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-13 15:59:51
 * @description: file content
-->
<template>
  <div class="scene-wrap">
    <TopMenu v-if="showHeader">
      <slot name="top-menu">
        <el-button type="primary">{{$t('save')}}</el-button>
      </slot>
    </TopMenu>
    <div
      class="container"
      :style="`height: calc(100% - ${otherHeight}px);`"
    >
      <DragContainer
        :draggable="false"
        v-if="showLeftMenu"
        @collapseChange="collapseChange"
        ref="leftAside"
        defaultWidth="300"
        dragPosition="right"
        @widthChange="(val) => widthChange('left', val)"
        v-slot="slotProps"
      >
        <LeftAside
          v-show="!slotProps.isCollapse"
          :is-show-left-title="isShowLeftTitle"
          @addLayer="$emit('addLayer')"
        >
          <div v-show="isShowLeftTitle">
            <slot
              name="title"
              slot="title-btn"
            >
            </slot>
          </div>
          <slot name="left"></slot>
        </LeftAside>
      </DragContainer>
      <div
        class="scene-bim-wrap"
        v-if="type === 'dom'"
        v-loading="loading"
        :element-loading-text="$t('sceneDataLoading')"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :id="id"
      ></div>
      <div
        v-else
        v-loading="loading"
        :element-loading-text="$t('sceneDataLoading')"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        class="scene-bim-wrap"
      >
        <iframe
          v-if="url"
          :src="url"
          ref="bimIframe"
          frameborder="0"
          width="100%"
          height="100%"
        ></iframe>
      </div>
      <Toolbar
        ref="toolbar"
        v-show="!loading"
        v-if="type==='dom'"
        :bimInstanceName="bimInstanceName"
        :toolbarStyle="{ right: toolbarRightPosition + 'px', top: '200px' }"
      ></Toolbar>

      <MapTool
        v-show="!loading"
        v-if="type==='dom'"
        :bimInstanceName="bimInstanceName"
        :mapToolStyle="{ right: toolbarRightPosition + 'px' }"
      ></MapTool>
      <DragContainer
        v-if="showRightMenu"
        :draggable="false"
        ref="rightAside"
        @collapseChange="collapseChange"
        defaultWidth="300"
        dragPosition="left"
        @widthChange="(val) => widthChange('right', val)"
        v-slot="slotProps"
      >
        <RightAside v-show="!slotProps.isCollapse">
          <slot name="right"></slot>
        </RightAside>
      </DragContainer>
    </div>
    <BottomMenu v-if="showFooter" />
  </div>
</template>

<script>
import BimFactory from '@/utils/bimComponent/index'
import { createSnapshot } from '@/utils/index'
import TopMenu from './top-menu/index.vue'
import BottomMenu from './bottom-menu/index.vue'
import LeftAside from './left-aside/index.vue'
import RightAside from './right-aside/index.vue'
import DragContainer from './DragContainer.vue'
import Toolbar from './toolbar/index.vue'
import MapTool from './map/index.vue'

export default {
  name: 'SceneComponent',
  components: {
    TopMenu,
    BottomMenu,
    LeftAside,
    RightAside,
    DragContainer,
    Toolbar,
    MapTool
  },
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showRightMenu: {
      type: Boolean,
      default: false
    },
    showLeftMenu: {
      type: Boolean,
      default: true
    },
    isShowLeftTitle: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: 'scene-bim-wrap'
    },
    type: {
      type: String,
      default: 'dom'
    },
    bimInstanceName: {
      type: String,
      default: 'bimInstance'
    }
  },
  data() {
    return {
      loading: true,
      leftWidth: 300,
      rightWidth: 300,
      url: ''
    }
  },
  computed: {
    toolbarRightPosition() {
      // const position = this.rightWidth === 0 || !this.showRightMenu ? 42 : 342
      const position = this.showRightMenu ? this.rightWidth ? 342 : 42 : 42
      // this.$emit('update-toolbar-position', position)
      return position
    },
    otherHeight() {
      const footer = this.showFooter ? 30 : 0
      const header = this.showHeader ? 50 : 0
      return footer + header
    }
  },
  watch: {
    'options.sceneViewToken': {
      handler() {
        if (this.type === 'dom') {
          this.initBim()
        } else {
          this.url = `${process.env.VUE_APP_BIM}?id=${this.id}&bimInstanceName=${this.bimInstanceName}&viewToken=${this.options.sceneViewToken}`
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    window[this.bimInstanceName]?.destroy()
    const wrap = document.getElementById(this.id)
    if (wrap) {
      wrap.innerHTML = ''
    }
  },
  mounted() {
    // 监听iframe 事件
    window.addEventListener('message', (messageEvent) => {
      const data = messageEvent.data
      if (data.type === 'sceneAddedCallback') {
        this.sceneAddedCallback(data.data)
      }
    })
  },
  methods: {
    // 初始化bim组件
    initBim() {
      if (this.type !== 'dom') return
      const options = {
        id: this.id,
        ...this.options,
        sceneAddedCallback: this.sceneAddedCallback
      }
      this.loading = false
      window[this.bimInstanceName] = BimFactory.create(options, 'bimface')
    },
    // 场景加载完毕回调
    sceneAddedCallback(data) {
      this.loading = false
      this.$nextTick(() => {
        this.options?.sceneAddedCallback && this.options.sceneAddedCallback(data)
      })
    },
    // 侧边栏折叠
    collapseChange() {
      this.$nextTick(() => {
        this.resize()
        this.leftWidth = this.$refs.leftAside ? this.$refs.leftAside.width : 0
        this.rightWidth = this.$refs.rightAside ? this.$refs.rightAside.width : 0
        const position = this.showRightMenu ? this.rightWidth ? 342 : 42 : 42
        this.$emit('update-toolbar-position', position)
        this.$emit('collapseChange', { left: this.leftWidth, right: this.rightWidth })
      })
    },
    // 更新size
    resize() {
      if (this.type !== 'dom') return
      this.$nextTick(() => {
        const box = document.getElementById(this.id)
        const width = box.clientWidth
        const height = box.clientHeight
        window[this.bimInstanceName]?.resize([width, height])
      })
    },
    // 截图 返回file
    createSnapshot() {
      return createSnapshot(this.id)
    },
    openAside(type) {
      if (type === 'left') {
        this.$refs.leftAside.open()
      } else {
        this.$refs.rightAside.open()
      }
      this.collapseChange()
    },
    closeAside(type) {
      if (type === 'left') {
        this.$refs.leftAside.close()
      } else {
        this.$refs.rightAside.close()
      }
      this.collapseChange()
    },
    widthChange(type, width) {
      if (type === 'left') {
        this.leftWidth = width
      } else {
        this.rightWidth = width
      }
    },
    clear() {
      window[this.bimInstanceName]?.destroy()
      window[this.bimInstanceName] = null
      const bimWrap = document.getElementById(this.id)
      if (bimWrap) {
        bimWrap.innerHTML = ''
      }
    },
    // 发送事件
    sendEvent(type, ...params) {
      this.$refs.bimIframe?.contentWindow?.postMessage(
        {
          type,
          params
        },
        '*'
      )
    }
  }
}
</script>
<style lang="scss" scoped>
  .scene-wrap {
    height: 100%;
    position: relative;
    .container {
      position: relative;
      width: 100%;
      overflow: hidden;
      display: flex;
      .scene-bim-wrap {
        overflow: hidden;
        height: 100%;
        min-width: 10px;
        display: block;
        flex: 1;
        flex-basis: auto;
        position: relative;
      }
    }
  }
</style>
