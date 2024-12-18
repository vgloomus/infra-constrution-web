<template>
  <div
    class="toolbar"
    :style="toolbarStyle"
  >
    <slot></slot>
    <el-tooltip
      :content="$t('scene.measurePoint')"
      placement="right"
    >
      <div
        class="icon-container"
        :class="{ selected: currentMeasureMode === 'point' }"
        @click="handleMeasurePointClick"
      >
        <i class="icon-measure-point"></i>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="$t('scene.measureDistance')"
      placement="right"
    >
      <div
        class="icon-container"
        :class="{ selected: currentMeasureMode === 'polylineDistance' }"
        @click="handleMeasurePolylineDistanceClick"
      >
        <i class="icon-measure-polyline-distance"></i>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="$t('scene.measureArea')"
      placement="right"
    >
      <div
        class="icon-container"
        :class="{ selected: currentMeasureMode === 'area', expanded: showAreasIcons }"
        :style="{ backgroundColor: isMeasureModeActive ? '#1677ff' : '' }"
        @click="selectMeasureMode"
      >
        <i :class="currentAreaIcon"></i>
        <i class="icon-measure-expand expand"></i>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="$t('scene.measureTriangle')"
      placement="right"
    >
      <div
        class="icon-container"
        :class="{ selected: currentMeasureMode === 'triangleDistance' }"
        @click="handleMeasureTriangleDistanceClick"
      >
        <i class="icon-measure-triangle"></i>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="$t('scene.measureAngle')"
      placement="right"
    >
      <div
        class="icon-container"
        :class="{ selected: currentMeasureMode === 'angle' }"
        @click="handleMeasureAngleClick"
      >
        <i class="icon-measure-angle"></i>
      </div>
    </el-tooltip>
    <div class="dividingLine"></div>
    <el-tooltip
      :content="$t('scene.clear')"
      placement="right"
    >
      <div
        class="icon-container"
        @click="clearMeasureData"
      >
        <i class="icon-measure-delete"></i>
      </div>
    </el-tooltip>
    <div
      v-if="showAreasIcons"
      class="areas-icons"
    >
      <el-tooltip
        :content="$t('scene.spatialArea')"
        placement="right"
      >
        <div
          class="icon-additional-container"
          :class="{ selected: currentMeasureMode === 'spatialArea' }"
          @click="handleSpatialAreaClick"
        >
          <i class="icon-measure-spatial"></i>
          <span class="right">{{ $t('scene.spatialArea') }}</span>
        </div>
      </el-tooltip>
      <el-tooltip
        :content="$t('scene.projectedArea')"
        placement="right"
      >
        <div
          class="icon-additional-container"
          :class="{ selected: currentMeasureMode === 'projectedArea' }"
          @click="handleProjectedAreaClick"
        >
          <i class="icon-measure-projected"></i>
          <span class="right">{{ $t('scene.projectedArea') }}</span>
        </div>
      </el-tooltip>
      <el-tooltip
        :content="$t('scene.surfaceArea')"
        placement="right"
      >
        <div
          class="icon-additional-container"
          :class="{ selected: currentMeasureMode === 'surfaceArea' }"
          @click="handleSurfaceAreaClick"
        >
          <i class="icon-measure-surface"></i>
          <span class="right">{{ $t('scene.surfaceArea') }}</span>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Toolbar',
  props: {
    toolbarStyle: {
      type: Object,
      default: () => ({})
    },
    bimInstanceName: {
      type: String,
      default: 'bimInstance'
    }
  },
  data() {
    return {
      currentMeasureMode: null,
      flag: false,
      showAreasIcons: false,
      currentAreaIcon: 'icon-measure-area',
      isMeasure: false
    }
  },
  computed: {
    isMeasureModeActive() {
      return ['spatialArea', 'projectedArea', 'surfaceArea'].includes(this.currentMeasureMode)
    }
  },
  methods: {
    // 用户点击图标时调用的方法
    handleIconClick() {
      if (this.flag) return
      window[this.bimInstanceName]?.handleIconClick()
      this.flag = true
    },

    // 测量点
    handleMeasurePointClick() {
      if (this.isMeasure && this.currentMeasureMode === 'point') {
        this.exitMeasureModeNotAreaMeasure()
      } else {
        this.enterMeasureModeNotAreaMeasure('point', () => window[this.bimInstanceName]?.measurePoint())
      }
    },
    // 测量多段线
    handleMeasurePolylineDistanceClick() {
      if (this.isMeasure && this.currentMeasureMode === 'polylineDistance') {
        this.exitMeasureModeNotAreaMeasure()
      } else {
        this.enterMeasureModeNotAreaMeasure('polylineDistance', () => window[this.bimInstanceName]?.measureDistance())
      }
    },
    // 测量三角
    handleMeasureTriangleDistanceClick() {
      if (this.isMeasure && this.currentMeasureMode === 'triangleDistance') {
        this.exitMeasureModeNotAreaMeasure()
      } else {
        this.enterMeasureModeNotAreaMeasure('triangleDistance', () => window[this.bimInstanceName]?.measureTriangleDistance())
      }
    },
    // 测量角度
    handleMeasureAngleClick() {
      if (this.isMeasure && this.currentMeasureMode === 'angle') {
        this.exitMeasureModeNotAreaMeasure()
      } else {
        this.enterMeasureModeNotAreaMeasure('angle', () => window[this.bimInstanceName]?.measureAngle())
      }
    },
    // 选择哪种面积测量模式
    selectMeasureMode() {
      this.showAreasIcons = !this.showAreasIcons
    },
    // 测量空间面积
    handleSpatialAreaClick() {
      if (this.isMeasure && this.currentMeasureMode === 'spatialArea') {
        this.exitMeasureMode()
      } else {
        this.enterMeasureMode('spatialArea', 'icon-measure-spatial', () => window[this.bimInstanceName]?.measureSpatialArea())
      }
    },
    // 测量投影面积
    handleProjectedAreaClick() {
      if (this.isMeasure && this.currentMeasureMode === 'projectedArea') {
        this.exitMeasureMode()
      } else {
        this.enterMeasureMode('projectedArea', 'icon-measure-projected', () => window[this.bimInstanceName]?.measureProjectedArea())
      }
    },
    // 测量贴地面积
    handleSurfaceAreaClick() {
      if (this.isMeasure && this.currentMeasureMode === 'surfaceArea') {
        this.exitMeasureMode()
      } else {
        this.enterMeasureMode('surfaceArea', 'icon-measure-surface', () => window[this.bimInstanceName]?.measureSurfaceArea())
      }
    },
    // 清除所有测量数据，扫把图标
    clearMeasureData() {
      window[this.bimInstanceName]?.clearMeasureData()
    },
    // 面积测量退出测量模式
    exitMeasureMode() {
      window[this.bimInstanceName]?.exitMeasure()
      this.isMeasure = false
      this.currentMeasureMode = null
      this.selectMeasureMode()
      this.currentAreaIcon = 'icon-measure-area'
    },
    // 面积测量重新进入测量模式
    enterMeasureMode(mode, icon, measureMethod) {
      this.handleIconClick()
      this.currentMeasureMode = mode
      measureMethod()
      window[this.bimInstanceName]?.reEnterMeasure()
      this.isMeasure = true
      this.currentAreaIcon = icon
      this.selectMeasureMode()
    },
    // 其他四种测量退出测量模式
    exitMeasureModeNotAreaMeasure() {
      window[this.bimInstanceName]?.exitMeasure()
      this.isMeasure = false
      this.currentMeasureMode = null
    },
    // 其他四种测量重新进入测量模式
    enterMeasureModeNotAreaMeasure(mode, measureMethod) {
      this.handleIconClick()
      this.currentMeasureMode = mode
      measureMethod()
      window[this.bimInstanceName]?.reEnterMeasure()
      this.isMeasure = true
    }
  }

}
</script>

<style lang="scss" scoped>
  .toolbar {
    width: 34px;
    border-radius: 4px;
    background: #191d21;
    position: absolute;
    top: 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 2px 0 2px;
    z-index: 10;
  }

  .icon-container {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    margin-bottom: 4px;
    cursor: pointer;
    .expand {
      position: relative;
      top: 8px;
      right: 1px;
    }
  }

  .icon-container:hover {
    background: #434d5a;
  }

  .icon-container.selected {
    background: #1677ff;
  }

  .areas-icons {
    position: absolute;
    top: 80px;
    right: 40px;
    width: 84px;
    padding: 4px 4px;
    background: #1e2227;
    border-radius: 4px;

    .icon-additional-container {
      display: flex;
      width: 74px;
      padding: 3px 2px;
      border-radius: 4px;

      .right {
        margin-left: 4px;
        font-size: 12px;
        width: 48px;
      }
    }

    .icon-additional-container:hover {
      background: #434d5a;
    }
    .icon-additional-container.selected {
      background: #1677ff;
    }
  }

  .dividingLine {
    width: 21px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-bottom: 4px;
  }
</style>
