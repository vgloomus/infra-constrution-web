<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-11-27 17:40:19
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-27 17:55:47
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\views\projectSetting\RegionalAdd.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="regional-add">
    <div class="excel">
      <template v-for="item in tabList">
        <ExcelComponent
          v-show="tab === item.value && excelConfig"
          v-if="excelConfig"
          :ref="item.value"
          :key="item.value"
          :type="item.value"
          :data="excelConfig[`${item.value}Data`]"
          :config="excelConfig[item.value]"
          @onMergeChange="onMergeChange"
        />
      </template>
    </div>
    <div class="tabs">
      <span
        v-for="item in tabList"
        :key="item.value"
        @click="tab = item.value"
        :class="['tab-item', { active: tab === item.value }]"
      >{{item.label}}
        <i
          class="icon-error"
          v-if="item.errors.length"
        />
      </span>
    </div>
  </div>
</template>
<script>
import config from './components/regionalConfig'
import { mapState } from 'vuex'
import { saveRegionsData } from '@/api/projectSetting'
import { EnumComputeTypeMap, EnumRegionTypeMap, EnumMaterialTypeMap, EnumAcceptMaterialTypeMap } from '@/common/enum'
import ExcelComponent from '@/components/ExcelComponent'

import moment from 'moment'
export default {
  name: 'RegionalAdd',
  components: {
    ExcelComponent
  },
  data() {
    return {
      loading: false,
      tab: 'cutFill',
      indexedDBIns: null,
      timer: null,
      excelConfig: null,
      tabList: [
        {
          label: this.$t('region.cutFill'),
          value: 'cutFill',
          errors: [],
          mergeCells: [],
          isEmpty: false
        },
        {
          label: this.$t('region.borrow'),
          value: 'borrow',
          errors: [],
          mergeCells: [],
          isEmpty: false
        },
        {
          label: this.$t('region.spoil'),
          value: 'spoil',
          errors: [],
          mergeCells: [],
          isEmpty: false
        },
        {
          label: this.$t('region.transit'),
          value: 'transit',
          errors: [],
          mergeCells: [],
          isEmpty: false
        }
      ]
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  beforeDestroy() {
    this.excelConfig = null
    window.clearInterval(this.timer)
  },
  mounted() {
    this.indexedDBIns = this.$localForage.createInstance({
      name: 'regional'
    })
    setTimeout(() => {
      this.init()
    })
  },
  methods: {
    async init() {
      const data = await this.indexedDBIns.getItem('data')
      if (data) {
        this.excelConfig = {
          ...config,
          cutFillData: data.cutFill,
          borrowData: data.borrow,
          spoilData: data.spoil,
          transitData: data.transit
        }
      } else {
        this.excelConfig = { ...config }
      }
      this.upDataToDB()
    },
    close() {
      this.upDataToDB()
      this.$nextTick(() => {
        this.excelConfig = null
        window.clearInterval(this.timer)
      })
    },
    onMergeChange(type, data) {
      this.tabList.forEach(item => {
        if (item.value === type) {
          item.mergeCells = data
        }
      })
    },
    upDataToDB() {
      window.clearInterval(this.timer)
      if (!this.excelConfig) return
      const data = {
        cutFill: this.excelConfig.cutFillData,
        borrow: this.excelConfig.borrowData,
        spoil: this.excelConfig.spoilData,
        transit: this.excelConfig.transitData
      }
      this.indexedDBIns.setItem('data', data)
      this.timer = setTimeout(() => {
        this.upDataToDB()
      }, 15000)
    },
    // 判断二维数组是否有数据
    findHasData(data) {
      return data.some(item => {
        const keys = Object.keys(item)
        return keys?.some(key => !!item[key])
      })
    },
    // 保存
    save() {
      // 获取全部数据，触发校验
      this.tabList.forEach(item => {
        item.errors = this.$refs[item.value][0]?.validate()
        item.isEmpty = this.$refs[item.value][0]?.isEmpty()
        item.mergeCells = this.$refs[item.value][0]?.getMergeCells()
      })
      const isEmpty = this.tabList.every(item => item.isEmpty)
      if (isEmpty) {
        this.$message.error('请填写表格数据')
      }
      const hasError = this.tabList.some(item => item.errors.length)
      if (!isEmpty && !hasError) {
        const data = {
          cutFill: this.excelConfig.cutFillData,
          borrow: this.excelConfig.borrowData,
          spoil: this.excelConfig.spoilData,
          transit: this.excelConfig.transitData
        }
        // 参数映射
        const newData = this.mapParams(data)
        // 字段映射
        const params = {
          excavationFillRegions: newData.cutFill,
          debitRegions: newData.borrow,
          abandonRegions: newData.spoil,
          transferRegions: newData.transit
        }
        saveRegionsData(this.projectId, params).then(res => {
          if (res) {
            this.$message.success('保存成功')
            this.excelConfig = null
            this.indexedDBIns.removeItem('data')
            this.$emit('saveSuccess')
          }
        })
      }
    },
    getValueByLabel(dataMap, label) {
      // 检查 label 是否存在于映射中
      if (!label) return null
      if (dataMap.has(label)) {
        // 如果存在，返回对应的 value
        return dataMap.get(label)
      } else {
        // 如果不存在，返回 null
        return null
      }
    },
    mapParams(data) {
      const keys = Object.keys(data)
      keys.forEach(key => {
        data[key] = data[key].map((item, rowIndex) => {
          const columns = Object.keys(item)
          const newItem = {}
          const isTrue = ['processingSystem', 'processedEarth', 'processedStone', 'secondaryBackfill']
          const isUse = ['materialSourceRequireEarth', 'materialSourceRequireStone']
          columns.forEach(column => {
            if (column === 'regionType') {
              newItem[column] = this.getValueByLabel(EnumRegionTypeMap, item[column])
            } else if (column === 'computedMode') {
              newItem[column] = this.getValueByLabel(EnumComputeTypeMap, item[column])
            } else if (isTrue.includes(column)) {
              newItem[column] = item[column] ? item[column] === '是' : null
            } else if (isUse.includes(column)) {
              newItem[column] = this.getValueByLabel(EnumMaterialTypeMap, item[column])
            } else if (column === 'materialSource') {
              newItem[column] = this.getValueByLabel(EnumAcceptMaterialTypeMap, item[column])
            } else if (column === 'availableDate') {
              newItem[column] = item[column] ? moment(item[column]).valueOf() : null
            } else if (column === 'regionName') {
              const mergeCells = this.tabList.find(item => item.value === key).mergeCells
              const merge = mergeCells.find(cell => cell[0] <= rowIndex && cell[1] >= rowIndex)
              newItem[column] = merge ? data[key][merge[0]][column] : item[column]
            } else {
              newItem[column] = item[column] || null
            }
          })
          return newItem
        })
      })
      // 拿到data 再过滤掉空值
      keys.forEach(key => {
        data[key] = data[key].filter(item => {
          const columns = Object.keys(item)
          return columns.some(column => {
            return item[column]
          })
        })
      })
      return data
    }
  }
}
</script>
<style lang="scss" scoped>
  .regional-add {
    height: 100%;
    width: 100%;
    background: #fff;
    overflow: hidden;
    .tabs {
      height: 38px;
      .tab-item {
        width: 100px;
        height: 38px;
        line-height: 38px;
        margin-right: 5px;
        color: #595959;
        text-align: center;
        display: inline-block;
        border-radius: 6px 6px 0px 0px;
        border-width: 1px 1px 0px 1px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.06);
        cursor: pointer;
        &.active {
          color: #409eff;
        }
      }
    }
    .excel {
      height: calc(100% - 38px);
    }
  }
</style>
