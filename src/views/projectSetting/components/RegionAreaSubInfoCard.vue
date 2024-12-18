<template>
  <div class="area-info-card">
    <div class="top">
      <div class="left-area">
        <span :class="['cut-rect', regionTypeClass]"></span>
        <div class="info-name">{{this.info.subItemName}}</div>
      </div>
      <div class="icon">
        <el-tooltip
          class="item"
          effect="dark"
          content="定位到当前图层"
          placement="top-start"
        >
          <i
            class="icon-focus"
            @click="focusOnArea"
          ></i>
        </el-tooltip>
        <!-- <i class="icon-delete"></i> -->
      </div>
    </div>
    <div class="row">
      <div class="title">
        {{ $t('region.information') }}
      </div>
      <div class="content">
        <div class="item">
          <span>{{ $t('region.regionName') }}</span>
          <div
            class="value"
            :title="info.regionName"
          >{{this.info.regionName}}</div>
        </div>
        <div class="item">
          <span>{{ $t('region.type') }}</span>
          <span>{{ regionTypeLabel }}</span>
        </div>
        <div class="item">
          <span>{{ $t('region.subName') }}</span>
          <div
            class="value"
            :title="info.subItemName"
          >{{this.info.subItemName}}</div>
        </div>
        <div v-if="info.regionType === 1 || info.regionType === 2 ">
          <div class="item">
            <span>{{ computedVolumeLabel }}(m³)</span>
          </div>
          <div class="item1">
            <span>{{ $t('region.accumulated') }}</span>
            <span class="number">{{ formatVolume(accumulatedEarthAll) }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.earth') }}</span>
            <span class="number">{{ formatVolume(info?.designEarthVolume) }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.stone') }}</span>
            <span class="number">{{ formatVolume(info?.designStoneVolume) }}</span>
          </div>
        </div>
        <div v-if="info.regionType === 3 ">
          <div class="item">
            <span>{{ computedVolumeLabel }}(m³)</span>
          </div>
          <div class="item1">
            <span>{{ $t('region.accumulated') }}</span>
            <span class="number">{{ formatVolume(maxAccumulatedEarthAll) }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.earth') }}</span>
            <span class="number">{{ formatVolume(info?.maxMiningVolumeEarth) }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.stone') }}</span>
            <span class="number">{{ formatVolume(info?.maxMiningVolumeStone) }}</span>
          </div>
        </div>
        <!-- 设计土石比例 -->
        <div v-if="info.regionType !== 2">
          <div class="item">
            <span>{{ $t('region.designEarthStonePercentage') }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.earth') }}</span>
            <span class="number">{{ formatVolume(info?.designEarthProportion) }}%</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.stone') }}</span>
            <span class="number">{{ formatVolume(info?.designStoneProportion) }}%</span>
          </div>
        </div>
        <!--材源要求（是否可利用） -->
        <div v-if="info.regionType === 2">
          <div class="item">
            <span>{{ $t('region.MaterialSource') }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.earth') }}</span>
            <span class="number">{{ formatMaterialSource(info?.materialSourceRequireEarth) }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.stone') }}</span>
            <span class="number">{{ formatMaterialSource(info?.materialSourceRequireStone) }}</span>
          </div>
        </div>
        <!-- 利用率 -->
        <div v-if="info.regionType !== 2">
          <div class="item">
            <span>{{ $t('region.utilizationRatio') }}</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.earth') }}</span>
            <span class="number">{{ formatVolume(info?.utilizationRatioEarth) }}%</span>
          </div>
          <div class="item1">
            <span class="rect-border">{{ $t('region.stone') }}</span>
            <span class="number">{{ formatVolume(info?.utilizationRatioStone) }}%</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="title">
        {{ $t('region.calculation') }}
      </div>
      <div class="bottom-content">
        <span class="calculation-method">{{ $t('region.calculationMethod') }}</span>
        <div class="dropdown-container">
          <el-dropdown
            ref="dropdown"
            placement="bottom"
            :key="'dropdown' + index"
            trigger="click"
            @click.native.stop
            :hide-on-click="false"
          >
            <div class="el-dropdown-link operate"></div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="selectMethod('manualFill')">{{ $t('region.manualFill') }}</el-dropdown-item>
              <el-dropdown-item @click.native="selectMethod('measurementReceivingModule')">{{ $t('region.measurementReceivingModule') }}</el-dropdown-item>
              <el-dropdown-item @click.native="selectMethod('sectionComparisonModule')">{{ $t('region.sectionComparisonModule') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div class="right-content">
            <span
              class="selected-method"
              :title="selectedCalculationMethod"
            >{{ selectedCalculationMethod }}</span>
          </div>
          <i
            class="icon-drop"
            @click="showDropdown"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRangeLine } from '@/api/business'
import { mapState } from 'vuex'
export default {
  name: 'RegionAreaSubInfoCard',
  data() {
    return {
      index: 0,
      selectedMethod: this.$t('region.manualFill'),
      regionType: this.$t('region.cutFill'),
      value: '',
      radio: 3,
      radio1: 3,
      isDragging: false,
      uploadError: false,
      uploadedFileName: '',
      isUploading: false,
      progress: 10,
      isComplete: false
    }
  },
  props: {
    type: {
      type: Number,
      default: 1
    },
    info: {
      type: Object,
      default: null
    },
    rangeLineData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState(['projectId']),
    accumulatedEarthAll() {
      const designEarthVolume = Number(this.info?.designEarthVolume || 0).toFixed(2)
      const designStoneVolume = Number(this.info?.designStoneVolume || 0).toFixed(2)
      const total = (parseFloat(designEarthVolume) + parseFloat(designStoneVolume)).toFixed(2)
      return total > 0 ? total : 0
    },
    maxAccumulatedEarthAll() {
      const maxMiningVolumeEarth = Number(this.info?.maxMiningVolumeEarth || 0).toFixed(2)
      const maxMiningVolumeStone = Number(this.info?.maxMiningVolumeStone || 0).toFixed(2)
      const total = (parseFloat(maxMiningVolumeEarth) + parseFloat(maxMiningVolumeStone)).toFixed(2)
      return total > 0 ? total : 0
    },
    regionTypeClass() {
      const typeClassMap = {
        1: 'cut-fill',
        2: 'fill-area',
        3: 'borrow',
        4: 'spoil',
        5: 'transit'
      }
      return typeClassMap[this.info.regionType] || ''
    },
    computedVolumeLabel() {
      const volumeLabelMap = {
        1: this.$t('region.excavationDesignVolume'),
        2: this.$t('region.fillDesignVolume'),
        3: this.$t('region.maxExcavationVolume')
      }
      return volumeLabelMap[this.info.regionType] || ''
    },
    regionTypeLabel() {
      const regionTypeMap = {
        1: this.$t('region.cutFill'),
        2: this.$t('region.fillArea'),
        3: this.$t('region.borrow'),
        4: this.$t('region.spoil'),
        5: this.$t('region.transit')
      }
      return regionTypeMap[this.info.regionType] || ''
    },
    selectedCalculationMethod() {
      const calculationMethodMap = {
        1: this.$t('region.measurementReceivingModule'),
        2: this.$t('region.sectionComparisonModule'),
        3: this.$t('region.manualFill')
      }
      return calculationMethodMap[this.info.computedMode] || ''
    }
  },
  methods: {
    showDropdown() {
      // this.$refs.dropdown.handleClick()
    },
    selectMethod(method) {
      this.selectedMethod = this.$t(`region.${method}`)
      this.$refs.dropdown.hide()
    },
    // 查询范围线
    getRangeLine() {
      return getRangeLine(this.projectId).then(res => {
        return res
      }).catch(error => {
        this.$message.error('查询失败')
        throw error
      })
    },
    // 定位到当前图层
    focusOnArea() {
      const currentRangeLine = this.rangeLineData.find(item => {
        return item.regionId === this.info.regionId
      })
      if (!currentRangeLine) return
      const position = {
        lon: currentRangeLine.gisCenter[0],
        lat: currentRangeLine.gisCenter[1],
        alt: currentRangeLine.gisCenter[2] + 200
      }
      const cameraStatus = {
        position: position,
        orientation: {
          pitch: -Math.PI / 2,
          yaw: 0,
          roll: 0
        }
      }
      window.bimInstance?.setCameraStatus(cameraStatus)
    },
    formatVolume(volume) {
      if (volume == null) return '0'
      const num = Number(volume)
      return num % 1 === 0 ? num.toString() : num.toFixed(2)
    },
    formatMaterialSource(value) {
      if (!value) {
        return ''
      }
      const values = value.split(',')
      if (values.includes('1') && values.includes('2')) {
        return '可利用+不可利用'
      } else if (values.includes('1')) {
        return '可利用'
      } else if (values.includes('2')) {
        return '不可利用'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .area-info-card {
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 8px;
      margin-right: 5px;

      .left-area {
        display: flex;
        justify-content: space-around;
        align-items: center;
        .info-name {
          width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
          color: $buttonDefaultColor;
          font-weight: bold;
        }
        .cut-rect {
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-right: 5px;
        }

        .cut-fill {
          background: #f3af56;
        }

        .fill-area {
          background: #77fbfd;
        }

        .borrow {
          background: #cf4df3;
        }

        .spoil {
          background: #5688f7;
        }

        .transit {
          background: #c2ef4e;
        }
      }
    }
    .row {
      border-radius: 6px;
      margin-bottom: 10px;
      .title {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: 12px;
        color: #fff;
      }

      .upload-demo {
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;

          .el-upload__text {
            margin-top: 12px;
          }
        }

        .uploaded-file {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: 16px 16px;

          .uploaded-file-content {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            .name {
              color: #fff;
              min-width: 20px;
              max-width: 216px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 4px;
            }
            .error-icon {
              color: #ff4d4f;
            }

            .loading-icon {
              color: orange;
            }

            .success-icon {
              color: #52c41a;
            }
          }

          .actions {
            cursor: pointer;
            color: #409eff;
            a:first-child {
              margin-right: 10px;
            }
          }
        }
      }

      .bottom-content {
        display: flex;
        align-items: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .calculation-method {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
        }

        .dropdown-container {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: flex-end;
          padding: 5px 12px;

          .right-content {
            min-width: 40px;
            max-width: 145px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            .selected-method {
              color: rgba(255, 255, 255, 0.65);
              border-radius: 6px;
              border-bottom: 1px solid #1554ad;
              text-align: right;
              padding-right: 6px;
            }
          }
          .icon-drop {
            color: rgba(255, 255, 255, 0.65);
            cursor: pointer;
            margin-left: 4px;
          }
        }
      }
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 32px;
        font-size: 14px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
        span {
          &:first-child {
            color: rgba(255, 255, 255, 0.65);
          }
        }
        .value {
          width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border-radius: 6px;
          border-bottom: 1px solid #1554ad;
          text-align: right;
          padding-right: 6px;
        }
      }

      .item1 {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 24px;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .rect-border {
        display: inline-block;
        width: 24px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        background: #434d5a;
        border-radius: 4px;
      }
    }
  }
</style>
