<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-08-16 12:12:45
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\StepsCard.vue
 * @Description: 步骤卡片
-->
<template>
  <div class="steps">
    <div class="step step1"><span :class="['doc', { 'active': step === 0}, {'pass': step > 0}]">
        <span v-if="step > 0"><i class="el-icon-check" /></span>
        <span v-else>1</span>
      </span>{{ $t('stepCard.matchTerrain')}}</div>
    <div :class="['line', {'pass': step > 0}]"></div>
    <div class="step step2"><span :class="['doc',{ 'active': step === 1}, {'pass': step > 1}]">
        <span v-if="step > 1"><i class="el-icon-check" /></span>
        <span v-else>2</span>
      </span>{{ $t('stepCard.earthworkCalculation') }}</div>
  </div>
</template>

<script>
export default {
  name: 'StepsCard',
  props: {
    step: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style lang="scss" scoped>
  .steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 46px;
    color: rgba(255, 255, 255, 0.65);
    .line {
      height: 1px;
      flex: 1;
      border-bottom: 1px solid $borderDefaultColor;
      &.pass {
        border-bottom: 1px solid #1668dc;
      }
    }
    .step {
      display: flex;
      align-items: center;
      .doc {
        display: inline-block;
        width: 24px;
        height: 24px;
        text-align: center;
        border-radius: 12px;
        background: #3b3f42;
        margin-right: 5px;
        &.active {
          background: #1677ff;
        }
        &.pass {
          background: #3b3f42;
        }
      }
      &.step1 {
        padding-right: 15px;
      }
      &.step2 {
        padding-left: 15px;
      }
    }
  }
</style>
