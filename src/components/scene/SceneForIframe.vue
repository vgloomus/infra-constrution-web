<template>
  <div class="scene-container-iframe">
    <Toolbar
      ref="toolbar"
      :bimInstanceName="bimInstanceName"
      :toolbarStyle="{ right: '42px', top: '200px' }"
    ></Toolbar>

    <MapTool
      :bimInstanceName="bimInstanceName"
      :mapToolStyle="{ right: '42px' }"
    ></MapTool>
    <div
      class="scene-bim"
      :id="id"
    >
    </div>
  </div>

</template>
<script>
import BimFactory from '@/utils/bimComponent/index'
import Toolbar from './toolbar/index.vue'
import MapTool from './map/index.vue'
export default {
  name: 'SceneForIframe',
  components: {
    Toolbar,
    MapTool
  },
  data() {
    return {
      viewToken: null,
      bimInstanceName: '',
      id: 'bim-wrap',
      bimInstance: null
    }
  },
  mounted() {
    this.viewToken = this.$route.query.viewToken
    this.bimInstanceName = this.$route.query.bimInstanceName
    this.id = this.$route.query.id
    this.$nextTick(() => {
      this.init()
    })
    window.addEventListener('message', (messageEvent) => {
      const data = messageEvent.data
      const methods = ['drawBoundaryPlanes', 'setCameraStatus', 'removeExtByNames', 'showExtByName', 'hideExtByName', 'createLabelByNode', 'focusLabelById']
      if (!methods.includes(data.type)) return
      window[this.bimInstanceName]?.[data.type](...data.params)
    })
  },
  beforeDestroy() {
    window[this.bimInstanceName]?.destroy()
  },
  methods: {
    init() {
      const options = {
        id: this.id,
        sceneViewToken: this.viewToken,
        sceneAddedCallback: this.sceneAddedCallback
      }
      window[this.bimInstanceName] = BimFactory.create(options, 'bimface')
    },
    sceneAddedCallback() {
      window.parent.postMessage({
        type: 'sceneAddedCallback'
      }, '*')
    }
  }
}
</script>

<style lang="scss" scoped>
  .scene-container-iframe {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .scene-bim {
    width: 100%;
    height: 100%;
  }
</style>
