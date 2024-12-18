<template>
  <div class="checkList">
    <div v-show="allDelete">
      <div class="checkList-column">
        <el-input
          class="check-item"
          v-model="fileName"
          placeholder="请输入内容名称或ID搜索"
        ></el-input>
      </div>
      <div class="checkList-column">
        <span>{{searchDate}}</span>
        <el-date-picker
          class="check-time"
          v-model="date"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
        >
        </el-date-picker>
      </div>
      <div class="checkList-column">
        <el-button @click="query">查询</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>
    <div
      class="alldelete"
      v-show="allDelete==false"
    >
      <el-button @click="delAll"> 全部删除 </el-button>
      <p> 全部 {{numPro}} 个项目被选中
        <el-button @click="toggleSelection"> 取消选择 </el-button>
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Bus from '../../../utils/eventBus.js'
export default {
  props: ['searchDate', 'isUploadImage'],
  data() {
    return {
      projectOption: '',
      allDelete: true, // 影像上传批量删除是否显示
      numPro: 1,
      columShow: false
    }
  },
  created() {
    this.readProjectOption()
    // this.keyupSubmit()
    Bus.$on('changeAllDelete', (data) => {
      this.allDelete = data
    })
    Bus.$on('changeNum', (num) => {
      this.numPro = num
    })
  },
  computed: {
    ...mapState({
      projeId: state => state.projeId,
      nameId: state => state.nameId,
      scDate: state => state.scDate,
      projectOptions: state => state.projectOptions
    }),
    projectId: {
      get() {
        return this.projeId
      },
      set(val) {
        this.setProjeId(val)
      }
    },
    fileName: {
      get() {
        return this.nameId
      },
      set(val) {
        this.setNameID(val)
      }
    },
    date: {
      get() {
        return this.scDate
      },
      set(val) {
        this.setScDate(val)
      }
    },
    buttonFocus() {
      return {
        color: '#457BF7',
        borderColor: '#c7d7fd',
        backgroundColor: '#ecf2fe'
      }
    },
    buttonBlur() {
      return {
        color: '#606266',
        borderColor: '#DCDFE6',
        backgroundColor: '#FFF'
      }
    }
  },
  methods: {
    // ...mapActions([
    //   'readProjOption'
    // ]),
    // ...mapMutations(['setProjeId', 'setNameID', 'setScDate', 'changeIsLoadDrillData']),
    // ...mapMutations('rockSoil', [
    //   'setDrillCodeList'
    // ]),

    // //  查询项目列表
    // readProjectOption() {
    //   this.readProjOption()
    //     .then(data => {
    //       this.projectOption = data
    //     })
    //     .catch(() => {})
    // },

    keyupSubmit() {
      document.onkeydown = e => {
        const _key = window.event.keyCode
        if (_key === 13) {
          this.query()
        }
      }
    },
    query() {
      this.$track({
        code: '100000004',
        name: '查询',
        group: '影像上传',
        projectId: this.projeId
      })
      this.$emit('queryData')
    },

    selectChange(val) {
      this.changeIsLoadDrillData(true)
      this.$emit('queryData')
    },

    // 清空下拉框选项
    clear() {
      this.setDrillCodeList([])
      this.setProjeId('')
    },

    // 重置
    reset() {
      this.$track({
        code: '100000005',
        name: '重置',
        group: '影像上传',
        projectId: this.projeId
      })
      // this.setProjeId('')
      this.setNameID('')
      this.setScDate('')
      this.$emit('resetData')
    },

    // 删除选中状态（批量删除）
    delAll() {
      this.$emit('selectsDelete')
    },

    // 取消选择
    toggleSelection() {
      Bus.$emit('cancelChange')
      this.allDelete = true
    },

    // 全部列显示
    allcolumShow() {
      this.columShow = !this.columShow
      Bus.$emit('allcolumShow')
    }
  }
}
</script>

<style lang="scss">
  .promptMes-preview {
    padding: 15px !important;
    min-width: 100px !important;
  }
</style>
<style lang="scss" scoped>
  .checkList {
    margin-top: 10px;
    padding: 10px;
    background-color: #ffffff;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    box-shadow: 0 0 1px #677cdf;
    .checkList-column {
      display: inline-block;
      margin-right: 15px;
      span {
        display: inline-block;
        height: 20px;
        line-height: 20px;
        text-align: left;
        margin-right: 10px;
        font-size: 14px;
        color: #333;
      }
    }
    .check-item {
      width: 190px;
    }
    .check-name {
      width: 140px;
    }
    .check-time {
      width: 338px;
    }
    .el-input--mini .el-input__inner {
      width: 190px;
    }
    .el-date-editor .el-range-input {
      width: 55%;
    }
  }
  .alldelete {
    display: flex;
    align-items: center;
    font-size: 14px;
    button {
      background: none;
      border: none;
      color: #457bf7;
    }
    p {
      width: 90%;
      text-align: center;
      color: #5a5a5a;
    }
  }
</style>
