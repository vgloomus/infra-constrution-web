<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-08-15 19:29:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-11 18:00:33
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\business\components\StepsCard.vue
 * @Description: 模型卡片
-->
<template>
  <div
    @click="$emit('onActive', name)"
    class="model-card"
    :class="[{'active': active === name}]"
  >
    <div class="title">
      <span
        class="label"
        :title="name"
      >{{name}}</span>
      <span
        v-if="expend"
        @click="expend = false"
      >{{$t('packUp')}}<i class="el-icon-arrow-up" /></span>
    </div>
    <div
      class="row"
      v-if="!expend"
    >
      <span
        class="item first"
        :title="list[0].name"
      >{{list[0].name}}</span>
      <span
        v-if="list.length > 2"
        class="doc"
        @click="expend=!expend"
      >...</span>
      <span
        class="item end"
        :title="list[list.length-1].name"
      >{{list[list.length-1].name}}</span>
    </div>
    <template v-else>
      <RecycleScroller
        :items="mappingList"
        :item-size="36"
        class="scroller"
        key-field="index"
        v-slot="{ item }"
      >
        <div class="list">
          <span
            :title="item.list[0].name"
            :class="['item', {'first': item.index === 0}, {'end': item.list.length===1 && (item.index + 1) * 2 - 1 === item.len}]"
          >{{item.list[0].name}}</span>
          <span
            v-if="item.list.length === 2"
            :class="['item', {'end': (item.index + 1) * 2 === item.len}]"
            :title="item.list[1].name"
          >{{item.list[1].name}}</span>
        </div>
      </RecycleScroller>
    </template>
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import { chunk } from 'lodash'
export default {
  name: 'ModelCard',
  components: {
    RecycleScroller
  },
  data() {
    return {
      expend: false
    }
  },
  computed: {
    mappingList() {
      return chunk(this.list, 2).map((item, index) => {
        return {
          index,
          list: item.sort((a, b) => {
            return a.name > b.name ? 1 : -1
          }),
          len: this.list.length
        }
      })
    }
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: ''
    },
    active: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .model-card {
    background: #2e343e;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 10px;
    cursor: pointer;
    .title {
      margin-bottom: 15px;
      height: 20px;
      line-height: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: $buttonDefaultColor;
      font-size: 14px;
      .el-icon-arrow-up {
        margin-left: 5px;
      }
      .label {
        display: inline-block;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }
      span {
        float: right;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.45);
        font-size: 12px;
      }
    }
    .scroller {
      max-height: 216px;
    }
    .row {
      display: flex;
      align-items: center;
      .item {
        flex: 1;
        display: inline-block;
        height: 26px;
        line-height: 26px;
        text-align: center;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .doc {
        width: 26px;
        display: inline-block;
        height: 26px;
        text-align: center;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 6px;
        margin: 0 10px;
        cursor: pointer;
      }
    }
    .list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      padding-bottom: 10px;
      .item {
        display: inline-block;
        height: 26px;
        line-height: 26px;
        width: 47%;
        text-align: center;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 6px;
      }
    }
    .first {
      border-left: 2px solid #49aa19;
    }
    .end {
      border-left: 2px solid #c43d3a;
    }
  }
  .model-card.active {
    background: rgba(22, 119, 255, 0.3);
  }
</style>
