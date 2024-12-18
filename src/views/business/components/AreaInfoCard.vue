<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-01 10:52:36
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\StepsCard.vue
 * @Description: 模型卡片
-->
<template>
  <div class="area-info-card">
    <div class="info-name">{{ info.name || info.stakeName }}</div>
    <div class="row">
      <div class="title">
        <span class="cut-rect"></span>
        {{ $t('excavation.excavationArea') }}（m²）
      </div>
      <div class="content">
        <div class="item">
          <span>{{ $t('excavation.design') }}</span>
          <span class="number">{{ info?.designExcavationArea ? Number(info?.designExcavationArea).toFixed(2) : 0 }}</span>
        </div>
        <div class="item">
          <span>{{ $t('excavation.accumulated') }}</span>
          <span class="number">{{ accumulatedEarthAll }}</span>
        </div>
        <div
          v-show="showStone"
          class="item"
        >
          <span class="rect-border">{{ $t('excavation.earth') }}</span>
          <span class="number">{{ `${info?.accumulatedEarthExcavationArea ? Number(info?.accumulatedEarthExcavationArea).toFixed(2) : 0}` }}</span>
        </div>
        <div
          v-show="showStone"
          class="item"
        >
          <span class="rect-border">{{ $t('excavation.stone') }}</span>
          <span class="number">{{ `${info?.accumulatedStoneExcavationArea ? Number(info?.accumulatedStoneExcavationArea).toFixed(2) : 0}` }}</span>
        </div>
        <template v-if="type === 2">
          <div class="item">
            <span>{{ $t('excavation.current') }}</span>
            <span class="number">{{ curEarthAll }}</span>
          </div>
          <div
            v-show="showStone"
            class="item"
          >
            <span class="rect-border">{{ $t('excavation.earth') }}</span>
            <span class="number">{{ `${info?.curEarthExcavationArea ? Number(info?.curEarthExcavationArea).toFixed(2) : 0}` }}</span>
          </div>
          <div
            v-show="showStone"
            class="item"
          >
            <span class="rect-border">{{ $t('excavation.stone') }}</span>
            <span class="number">{{ `${info?.curStoneExcavationArea ? Number(info?.curStoneExcavationArea).toFixed(2) : 0}` }}</span>
          </div>
        </template>
        <div class="item">
          <span>{{ $t('excavation.remaining') }}</span>
          <span class="number">{{ `${info?.remainExcavationArea ? Number(info?.remainExcavationArea).toFixed(2) : 0}` }}</span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="title">
        <span class="fill-rect"></span>
        {{ $t('excavation.fillArea') }}（m²）
      </div>
      <div class="content">
        <div class="item">
          <span>{{ $t('excavation.design') }}</span>
          <span class="number">{{ info?.designFillArea ? Number(info?.designFillArea).toFixed(2) : 0 }}</span>
        </div>
        <div class="item">
          <span>{{ $t('excavation.accumulated') }}</span>
          <span class="number">{{ `${info?.accumulatedFillArea ? Number(info?.accumulatedFillArea).toFixed(2) : 0}` }}</span>
        </div>
        <div
          v-if="type === 2"
          class="item"
        >
          <span>{{ $t('excavation.current') }}</span>
          <span class="number">{{ `${info?.curFillArea ? Number(info?.curFillArea).toFixed(2) : 0}` }}</span>
        </div>
        <div class="item">
          <span>{{ $t('excavation.remaining') }}</span>
          <span class="number">{{ `${info?.remainFillArea ? Number(info?.remainFillArea).toFixed(2) : 0}` }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AreaInfoCard',
  data() {
    return {
    }
  },
  props: {
    info: {
      type: Object,
      default: null
    },
    type: {
      type: Number,
      default: 1
    }
  },
  computed: {
    accumulatedEarthAll() {
      const accumulatedEarthExcavationArea = Number(this.info?.accumulatedEarthExcavationArea || 0).toFixed(2)
      const accumulatedStoneExcavationArea = Number(this.info?.accumulatedStoneExcavationArea || 0).toFixed(2)
      const total = (parseFloat(accumulatedEarthExcavationArea) + parseFloat(accumulatedStoneExcavationArea)).toFixed(2)
      return total > 0 ? total : 0
    },
    curEarthAll() {
      const curEarthExcavationArea = Number(this.info?.curEarthExcavationArea || 0).toFixed(2)
      const curStoneExcavationArea = Number(this.info?.curStoneExcavationArea || 0).toFixed(2)
      const total = (parseFloat(curEarthExcavationArea) + parseFloat(curStoneExcavationArea)).toFixed(2)
      return total > 0 ? total : 0
    },
    showStone() {
      return this.info?.stoneBoundaryEngineerCoords || this.info?.postStoneBoundaryEngineerCoords
    }
  }
}
</script>

<style lang="scss" scoped>
  .area-info-card {
    .info-name {
      font-size: 14px;
      color: $buttonDefaultColor;
      margin-bottom: 10px;
      height: 46px;
      line-height: 46px;
      font-weight: bold;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .row {
      background: #2e343e;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 10px;
      .title {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: 12px;
        color: #fff;
      }
      .item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        margin-bottom: 8px;
        &:last-child {
          margin-bottom: 0;
        }
        span {
          &:first-child {
            color: rgba(255, 255, 255, 0.65);
          }
          &:last-child {
            color: $buttonDefaultColor;
            font-weight: bold;
          }
        }
      }
      .cut-rect {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: linear-gradient(180deg, #ff0000 0%, #ff8000 100%);
        margin-right: 5px;
      }
      .fill-rect {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: linear-gradient(180deg, #0080ff 0%, #0000ff 100%);
        margin-right: 5px;
      }
      .rect-border {
        display: inline-block;
        width: 24px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        background: #1e2227;
        border-radius: 4px;
      }
    }
  }
</style>
