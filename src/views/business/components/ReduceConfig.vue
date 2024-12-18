<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-09-19 13:44:46
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\ReduceConfig.vue
 * @Description: 简化配置
-->
<template>
  <div class="reduce-config">
    <div class="reduce-config-top">
      <div class="reduce-config-group">
        <div class="reduce-config-item">
          <span class="label">{{ $t('simplifyConfig.removeOverExcavation') }}</span>
          <el-switch
            v-model="reduceConfig.removeOverExcavation"
            active-color="#1668DB"
            inactive-color="#616467"
          >
          </el-switch>
        </div>
        <div class="reduce-config-item">
          <span class="label">{{ $t('simplifyConfig.removeOverFill') }}</span>
          <el-switch
            v-model="reduceConfig.removeOverFill"
            active-color="#1668DB"
            inactive-color="#616467"
          >
          </el-switch>
        </div>
        <div class="reduce-config-item">
          <span class="label">{{ $t('simplifyConfig.removeAboveGround') }}</span>
          <el-switch
            v-model="reduceConfig.removeAboveGround"
            active-color="#1668DB"
            inactive-color="#616467"
          >
          </el-switch>
        </div>
      </div>
      <div class="reduce-config-group">
        <div class="reduce-config-item">
          <span class="label">{{ $t('simplifyConfig.flattenLine') }}</span>
          <el-switch
            v-model="reduceConfig.flattenLine"
            active-color="#1668DB"
            inactive-color="#616467"
          >
          </el-switch>
        </div>
        <div class="reduce-config-item">
          <span class="label">{{ $t('simplifyConfig.closeEarthworkDesignLine') }}</span>
          <el-switch
            v-model="reduceConfig.closeEarthworkDesignLine"
            active-color="#1668DB"
            inactive-color="#616467"
          >
          </el-switch>
        </div>
        <div class="reduce-config-item">
          <span class="label">{{ $t('simplifyConfig.simplifyLine') }}
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('simplifyConfig.simplifyLineTooltip')"
              placement="top"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <span>
            {{ reduceConfig.simplifyLine }}%
          </span>
        </div>
        <div class="reduce-config-item">
          <el-slider
            v-model="reduceConfig.simplifyLine"
            @change="$emit('change', reduceConfig)"
            :step="10"
          >
          </el-slider>
        </div>
      </div>
    </div>
    <div class="control-group">
      <div class="reduce-config-item">
        <span>{{ $t('simplifyConfig.applyTo') }}</span>
        <el-radio-group
          v-model="reduceConfig.applyType"
          size="small"
        >
          <el-radio-button label="1">{{ $t('simplifyConfig.currentSection') }}</el-radio-button>
          <el-radio-button label="2">{{ $t('simplifyConfig.currentArea') }}</el-radio-button>
          <el-radio-button label="3">{{ $t('simplifyConfig.allAreas') }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="reduce-config-item">
        <el-button
          type="default"
          size="small"
          class="btn"
          @click="resetHandler"
        >{{ $t('simplifyConfig.reset') }}</el-button>
        <el-button
          type="default"
          size="small"
          class="btn"
          @click="closeHandle"
        >{{ $t('simplifyConfig.cancel') }}</el-button>
        <el-button
          type="primary"
          size="small"
          class="btn"
          @click="saveReduceConfig"
        >{{ $t('simplifyConfig.confirm') }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReduceConfig',
  data() {
    return {
      reduceConfig: {
        removeOverExcavation: false,
        removeOverFill: false,
        removeAboveGround: false,
        flattenLine: false,
        closeEarthworkDesignLine: false,
        simplifyLine: 100,
        applyType: '1'
      }
    }
  },
  props: {
    settings: {
      type: Object,
      default: () => {
        return null
      }
    }
  },
  watch: {
    settings(val) {
      if (val) {
        this.reset(val)
        this.$nextTick(() => {
          this.$emit('change', this.reduceConfig)
        })
      }
    }
  },
  methods: {
    reset(config) {
      const settings = config.settings
      this.reduceConfig.applyType = String(config.applyType)
      settings.forEach(it => {
        this.reduceConfig[it.item] = it.item === 'simplifyLine' ? Number(it.value) : it.value === 'true'
      })
    },
    resetHandler() {
      this.reset(this.settings)
      this.$nextTick(() => {
        this.$emit('change', this.reduceConfig)
      })
    },
    closeHandle() {
      this.resetHandler()
      this.$emit('close')
    },
    saveReduceConfig() {
      const params = {}
      const settings = []
      for (const key in this.reduceConfig) {
        if (key === 'applyType') {
          params[key] = this.reduceConfig[key]
        } else {
          settings.push({
            item: key,
            value: this.reduceConfig[key]
          })
        }
      }
      params.settings = settings
      this.$emit('save', params)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
  .reduce-config {
    padding: 8px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    .el-input-number {
      width: 50px;
    }
    .reduce-config-top {
      height: calc(100% - 80px);
      overflow-y: auto;
      overflow-x: hidden;
    }
    .reduce-config-group {
      padding: 8px;
      border-radius: 6px;
      background: #1e2227;
      margin-bottom: 8px;
      .reduce-config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        .label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
        }
        .el-slider {
          width: calc(100% - 20px);
          margin: 0 auto;
          ::v-deep .el-slider__runway {
            background: rgba(255, 255, 255, 0.08) !important;
          }
        }
      }
    }
    .control-group {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 8px;
      background: #1e2227;
      .reduce-config-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px;
      }
      .el-radio-group {
        display: flex;
        border: 1px solid #000;
        border-radius: 6px;
      }
      .btn {
        width: 32%;
        border: none;
        height: 24px;
      }
      ::v-deep .el-radio-button--small .el-radio-button__inner {
        padding: 0 7px;
        height: 28px;
        line-height: 28px;
        background: #272a2e;
        color: rgba(255, 255, 255, 0.65);
        border: none;
      }
      ::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        color: rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0px 1px 2px -2px rgba(0, 0, 0, 0.16),
          0px 3px 6px 0px rgba(0, 0, 0, 0.12),
          0px 5px 12px 4px rgba(0, 0, 0, 0.09);
      }
    }
  }
</style>
