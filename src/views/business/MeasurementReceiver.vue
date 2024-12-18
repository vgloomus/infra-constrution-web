<!--
 * @author: lvzj
 * @Date: 2024-08-08 13:48:13
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-25 08:27:47
 * @description: 测量收方
-->
<template>
  <div class="measurement-receiver">
    <div class="main-project-inner-box">
      <div class="main-content">
        <!-- 头部搜索框 -->
        <div class="header-top">
          <div class="right">
            <el-button
              type="primary"
              @click="showDialog"
            >{{ $t('addNew') }}</el-button>
          </div>
        </div>
        <div
          class="content-main"
          v-loading="disable"
          :element-loading-text="$t('loading')"
          element-loading-background="rgba(0, 0, 0, 0.8)"
        >
          <no-content
            element-loading-background="rgba(0, 0, 0, 0.8)"
            v-if="!disable && cardList?.length === 0"
          />

          <template v-else>
            <!-- 判断 cardList 是否存在且有数据 -->
            <div class="card-content">
              <div
                ref="flexContainer"
                class="card-list"
              >
                <div
                  v-for="(card, index) in cardList"
                  :key="index"
                  :style="{ width: cardWidth }"
                  class="card"
                >
                  <div class="top">
                    <img :src="card.thumbnailUrl">
                    <div class="measure-time">
                      {{ $t('collectDate') }}：{{ card.collectStartDate }} ~ {{ card.collectEndDate }}
                    </div>
                  </div>
                  <div class="bottom">
                    <div class="content">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="card.name"
                        placement="bottom"
                      >
                        <span
                          ref="projectName"
                          class="project-name"
                        >{{ card.name }}</span>
                      </el-tooltip>
                      <div class="icon">
                        <el-tooltip placement="bottom">
                          <template slot="content">
                            <div class="id">{{ $t('id') }}: {{ card.id }}</div>
                            <div class="person">{{ $t('operator') }}：{{ card.updaterName }}</div>
                          </template>
                          <div class="prompt"></div>
                        </el-tooltip>
                        <el-dropdown
                          @command="(command) => handleAction(command, card)"
                          :key="'dropdown' + index"
                          trigger="click"
                          @click.native.stop
                          :hide-on-click="false"
                        >
                          <div class="el-dropdown-link operate"></div>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="edit">{{ $t('edit') }}</el-dropdown-item>
                            <el-dropdown-item command="share">{{ $t('share') }}</el-dropdown-item>
                            <el-dropdown-item command="download">{{ $t('download') }}</el-dropdown-item>
                            <el-popconfirm
                              class="item"
                              effect="dark"
                              placement="top-start"
                              :title="$t('confirmDelete')"
                              :cancel-button-text="$t('cancel')"
                              :confirm-button-text="$t('confirm')"
                              @confirm="(ev) => handleDelete(ev)"
                            >
                              <el-dropdown-item
                                slot="reference"
                                command="delete"
                              >{{ $t('delete') }}</el-dropdown-item>
                            </el-popconfirm>
                          </el-dropdown-menu>
                        </el-dropdown>

                        <el-dialog
                          :title="$t('shareLink')"
                          :visible.sync="shareDialogVisible"
                          width="30%"
                          @close="handleCloseDialog"
                          @click.native.stop
                        >
                          <div class="success-tip">
                            <i class="el-icon-success"></i>
                            <span>{{ $t('successCreatedLink') }}</span>
                          </div>

                          <div
                            v-loading="isLoading"
                            v-if="isLoading"
                            :text="$t('gettingLink')"
                            :spinner="'el-icon-loading'"
                            lock
                          ></div>

                          <el-input
                            v-if="!isLoading"
                            :placeholder="$t('inputContent')"
                            v-model="shareUrl"
                            :disabled="true"
                          />
                          <span
                            slot="footer"
                            class="dialog-footer"
                          >
                            <el-button
                              type="primary"
                              @click="shareDialogVisible = false"
                            >{{ $t('cancel') }}</el-button>
                            <el-button
                              type="primary"
                              @click="confirmShare"
                            >{{ $t('copy') }}</el-button>
                          </span>
                        </el-dialog>
                      </div>
                    </div>
                    <div class="update-time">{{ $t('updateTime') }}：{{ card.updateTime }}</div>
                  </div>
                </div>
              </div>

              <el-pagination
                :total="page.total"
                :page-size="page.pageSize"
                :current-page="page.currentPage"
                @current-change="page => handlePageChange(page)"
              />
            </div>
          </template>

          <!-- 新建任务的弹窗 -->
          <el-dialog
            :title="$t('createTask')"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            width="555px"
          >
            <el-form
              ref="ruleForm"
              :model="ruleForm"
              :rules="rules"
              label-width="100px"
              label-position="top"
            >
              <el-form-item
                :label="$t('taskName')"
                prop="inputTaskName"
              >
                <el-input
                  v-model="ruleForm.inputTaskName"
                  :placeholder="$t('input')"
                  :maxlength="50"
                ></el-input>
              </el-form-item>
              <el-form-item
                :label="$t('collectDate')"
                prop="rangeTime"
              >
                <el-date-picker
                  v-model="ruleForm.rangeTime"
                  type="daterange"
                  :range-separator="$t('to')"
                  :start-placeholder="$t('startDate')"
                  :end-placeholder="$t('endDate')"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                  unlink-panels
                  @change="handleDateChange"
                />
              </el-form-item>
            </el-form>
            <span
              slot="footer"
              class="dialog-footer"
            >
              <el-button
                type="primary"
                @click="handleCancel"
                size="small"
              >{{ $t('cancel') }}</el-button>
              <el-button
                type="primary"
                @click="jumpToEdit"
                size="small"
              >{{ $t('confirm') }}</el-button>
            </span>
          </el-dialog>
        </div>
      </div>
    </div>
    <MRDownLoadDialog
      :taskId="taskId"
      :visible.sync="downloadVisible"
      @resultDownload="resultDownload"
      :downLoading="downLoading"
    />
  </div>
</template>

<script>
import { getReceiveList, getTagDate, getReceiveShareCode, getReceiveResultExcel, mergeDrawing, deleteReceiveTask } from '@/api/business'
import { mapState } from 'vuex'
import moment from 'moment'
import JSONbig from 'json-bigint'
import MRDownLoadDialog from './components/MRDownLoadDialog.vue'

export default {
  name: 'MeasurementReceiver',
  components: {
    MRDownLoadDialog
  },
  data() {
    return {
      cardList: [],
      dialogVisible: false, // 控制新建任务对话框的显示
      visiblePopover: null,
      ruleForm: {
        inputTaskName: '',
        rangeTime: [] // 修改为数组，初始值为空数组
      },
      rules: {
        inputTaskName: [
          { required: true, message: '任务名称不能为空', trigger: 'blur' },
          { max: 50, message: '最多输入50个个字符', trigger: 'blur' }
        ],
        rangeTime: [{ required: true, message: '请选择采集日期', trigger: 'blur' }]
      },
      shareDialogVisible: false, // 控制分享弹框的显示
      pickerOptions: {
        disabledDate(time) {
          const today = new Date()
          const oneYearAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365 * 2)
          // 禁用365天之前的日期和今天之后的日期
          return time.getTime() < oneYearAgo.getTime() || time.getTime() > today.getTime()
        },
        cellClassName: time => {
          const month = time.getMonth() + 1
          const day = time.getDate()
          const val = time.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
          return this.specialDates.includes(val) ? 'underline' : ''
        }
      },
      specialDates: [], // 存储需打下划线的特殊日期
      shareUrl: '', // 分享链接
      bizId: null, // 业务id
      page: {
        total: 50,
        pageSize: 10,
        currentPage: 1
      },
      disable: true,
      isLoading: true,
      taskId: null,
      downloadVisible: false,
      downLoading: false,
      cardWidth: '383px'
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  mounted() {
    this.queryMeasurementReceiverList()
    this.checkTextOverflow()
    window.addEventListener('resize', this.checkTextOverflow)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkTextOverflow)
  },
  methods: {
    // 获取测量收方列表页面数据
    queryMeasurementReceiverList() {
      const params = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      getReceiveList(this.projectId, params).then(data => {
        this.cardList = data?.records?.map(record => {
          return {
            name: record?.name,
            updateTime: moment(record?.updateTime).format('YYYY-MM-DD') || '',
            collectStartDate: moment(record?.collectStartDate).format('YYYY-MM-DD') || '',
            collectEndDate: moment(record?.collectEndDate).format('YYYY-MM-DD') || '',
            thumbnailUrl: record?.thumbnailUrl || require('../../assets/images/star.jpg'),
            id: record?.id,
            updaterName: record?.updaterName
          }
        }) || []
        this.disable = false
        this.page.total = data?.total
        this.page.pageSize = data?.size
        this.$nextTick(() => {
          this.checkTextOverflow()
        })
        console.log('获取测量收方列表页数据成功:', this.data)
      }).catch(error => {
        console.error('获取测量收方列表页数据失败:', error)
      })
    },
    handlePageChange(page) {
      this.page.currentPage = page
      this.queryMeasurementReceiverList()
    },
    // 格式化时间戳
    formatTimestamp(timestamp) {
      const date = new Date(timestamp * 1000) // 将秒转换为毫秒
      const Y = date.getFullYear() + '-'
      const M = (date.getMonth() + 1).toString().padStart(2, '0') + '-'
      const D = date.getDate().toString().padStart(2, '0') + ' '
      const h = date.getHours().toString().padStart(2, '0') + ':'
      const m = date.getMinutes().toString().padStart(2, '0') + ':'
      const s = date.getSeconds().toString().padStart(2, '0')
      return Y + M + D + h + m + s
    },
    // 验证任务名称是否重复
    isTaskNameDuplicate(taskName) {
      // 检查 this.cardList 是否定义，如果未定义则返回 false
      return Array.isArray(this.cardList) && this.cardList.length > 0 && this.cardList.some(card => card.name === taskName)
    },

    jumpToEdit() {
      // 先验证任务名称是否重复
      if (this.isTaskNameDuplicate(this.ruleForm.inputTaskName)) {
        this.$message.error('任务名称已存在，请重新输入')
        return
      }
      // 进行表单验证
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          // 只有验证通过时才会执行下面的代码
          this.dialogVisible = false
          // 跳转到测量收方编辑页面
          this.$router.push({
            path: '/business/measurementReceiverEdit',
            query: {
              type: 'add',
              name: this.ruleForm.inputTaskName,
              start: this.ruleForm.rangeTime[0],
              end: this.ruleForm.rangeTime[1]
            }
          })
        } else {
          // 验证失败时，给出提示
          this.$message.warning('请确保任务名称和采集日期都已填写完整！')
        }
      })
    },
    showDialog() {
      this.dialogVisible = true
      // 点击新建发请求获取标签日期
      getTagDate(this.projectId).then(data => {
        this.specialDates = data
        console.log('获取标签日期成功:', this.specialDates)
      }).catch(error => {
        console.error('获取标签日期失败:', error)
      })
    },
    getReceiveShareCode(projectId, body) {
      getReceiveShareCode(projectId, body).then(data => {
        const shareCode = data?.data || ''
        const baseUrl = window.location.origin
        this.shareUrl = `${baseUrl}/bimtwins/infra-construction-web/business/measurementReceiverShare?shareCode=${shareCode}&projectId=${projectId}`
        this.isLoading = false
        // 本地调试用
        // this.shareUrl = `${baseUrl}/business/measurementReceiverShare?shareCode=${shareCode}`
        console.log('获取分享码成功:', this.shareUrl)
      }).catch(error => {
        this.isLoading = false
        console.error('获取分享码失败:', error)
      })
    },
    async handleAction(command, card) {
      if (command === 'share') {
        this.isLoading = true // 显示加载状态
        // 使用 JSONbig 解析 ID，确保处理大整数
        this.bizId = JSONbig.parse(card.id.toString())
        const body = {
          // 使用大整数库将 bizId 转换为字符串
          bizId: JSONbig.stringify(this.bizId),
          bizName: card.name,
          type: 1
        }
        // 调用合并图纸接口
        await this.mergeDrawing(this.projectId, body)
        // 点击分享按钮，发请求，获取分享码，拼接到shareUrl中
        this.getReceiveShareCode(this.projectId, body)
        this.shareDialogVisible = true
      } else if (command === 'download') {
        this.taskId = card?.id
        this.openDownloadDialog()
        // this.handleDownload()
      } else if (command === 'edit') {
        this.handleClick(card)
      } else if (command === 'delete') {
        this.taskId = card?.id
      }
    },
    // TODO：调后端的接口，删除数据，然后重新渲染列表
    async handleDelete() {
      try {
        await deleteReceiveTask(this.projectId, this.taskId)
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.queryMeasurementReceiverList()
      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    handleCloseDialog() {
      this.shareDialogVisible = false // 关闭分享弹框
    },
    confirmShare() {
      this.copyToClipboard(this.shareUrl)
      this.$message({
        message: '分享链接复制成功',
        type: 'success'
      })
      this.shareDialogVisible = false
    },

    // 实现复制功能
    copyToClipboard(text) {
      // 创建一个隐藏的输入框
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      input.setSelectionRange(0, 99999) // 对于移动设备
      document.execCommand('copy')
      document.body.removeChild(input)
    },
    // 打开弹窗
    openDownloadDialog() {
      this.downloadVisible = true
    },

    async resultDownload() {
      this.downLoading = true
      // 下载功能的实现
      getReceiveResultExcel(this.projectId, this.taskId)
        .then((res) => {
          if (res) {
            // window.location.href = res
            window.open(res, '_blank')
          }
        })
        .finally(() => {
          this.downLoading = false
        })
    },

    handleClick(item) {
      this.$router.push({
        path: '/business/measurementReceiverEdit',
        query: {
          type: 'edit',
          id: item.id
        }
      })
    },
    // 处理日期选择范围
    handleDateChange(val) {
      const [start, end] = val
      const hasSpecialDate = this.specialDates.some((date) => {
        return date >= start && date <= end
      })

      if (!hasSpecialDate) {
        this.$message.warning('所选日期范围内无影像数据，请重新选择！')
        this.ruleForm.rangeTime = null
      }
    },
    // 取消重置表单
    handleCancel() {
      this.dialogVisible = false
      this.$refs.ruleForm.resetFields()
    },
    // 监测标题是否溢出
    checkTextOverflow() {
      const flexContainer = this.$refs.flexContainer
      if (flexContainer) {
        const containerWidth = this.$refs.flexContainer.offsetWidth
        const len = Math.floor(containerWidth / 383)
        this.cardWidth = 100 / len + '%'
      }
    },
    // 合并图纸
    async mergeDrawing(projectId, body) {
      return mergeDrawing(projectId, body.bizId)
    }

  }
}
</script>
<style lang="scss" scoped>
  .measurement-receiver {
    width: 100%;
    height: 100%;
    .el-icon-success {
      color: #67c23a;
      font-size: 14px;
      margin-right: 5px;
    }
    .main-project-inner-box {
      height: 100%;
      .header-top {
        width: 100%;
        height: 64px;
        display: flex;
        align-items: center;
        padding-left: 20px;
      }

      .main-content {
        height: 100%;
        overflow: hidden;
        background-color: #191d21;

        // 卡片列表
        .content-main {
          background: #1e2227;
          height: 100%;
          max-height: calc(100% - 60px);
          overflow: hidden;
          .card-content {
            height: 100%;
            width: 100%;
          }
          .card-list {
            max-height: calc(100% - 70px);
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            flex-direction: row;
            // gap: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
          }
          //TODO:卡片需要做成自适应的，不要写死宽度，最小宽度383px，最大宽度不超过父元素宽度
          .card {
            // margin-right: 20px;
            padding: 10px;
            width: 312px;
            height: 210px;
            // margin-bottom: 20px;
            position: relative; /* 为了定位伪元素 */
            overflow: hidden; /* 确保遮罩不会超出边界 */
            transition: background-color 0.3s ease; /* 平滑过渡效果 */

            &::after {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(67, 77, 90, 0); /* 初始状态下没有遮罩 */
              transition: background 0.3s ease; /* 过渡效果 */
              pointer-events: none; /* 使遮罩不影响点击事件 */
            }

            // &:hover::after {
            //   background: rgba(67, 77, 90, 0.3); /* 悬浮时的半透明遮罩 */
            // }

            // &:active::after {
            //   background: rgba(67, 77, 90, 0.5); /* 点击时的半透明遮罩 */
            // }

            .top {
              position: relative;
              height: 140px;
              border-radius: 8px 8px 0 0;

              img {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 8px 8px 0 0;
              }

              .measure-time {
                left: 8px;
                top: 8px;
                position: absolute;
                height: 28px;
                padding: 4px 12px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 412px;
              }

              /* 添加伪元素覆盖图片部分 */
              .measure-time::before {
                content: "";
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
                z-index: -1; /* 确保伪元素在文本后面 */
              }
            }
            .bottom {
              background: #2e343e;
              padding: 12px 12px;
              height: 60px;
              border-radius: 0 0 8px 8px;

              .content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;

                .item {
                  .project-name {
                    height: 100%;
                    font-size: 14px;
                    color: #fff;
                    font-weight: bold;
                    cursor: pointer;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                  }
                }

                .project-name {
                  height: 100%;
                  font-size: 14px;
                  color: #fff;
                  font-weight: bold;
                  cursor: pointer;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                .icon {
                  display: flex;
                  .prompt {
                    width: 20px;
                    height: 20px;
                    background: url("../../assets/images/prompt.png") no-repeat
                      top left / 20px 20px;
                    margin-right: 8px;
                  }
                  .operate {
                    width: 20px;
                    height: 20px;
                    background: url("../../assets/images/operate.png") no-repeat
                      top left / 20px 20px;
                    background-size: cover;
                    cursor: pointer;
                  }
                }
              }

              .update-time {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.45);
              }
            }
          }
        }
      }
    }
  }

  ::v-deep {
    .el-form-item {
      display: flex;
      align-items: center;
    }

    .el-input__inner {
      background-color: transparent;
      border-color: $inputBorderColor;
      height: 32px !important;
      line-height: 32px !important;
      color: black;
    }
    .el-form-item__content {
      display: flex;
      flex: 1;
      border: 1px solid #d9d9d9;
      border-radius: 5px;
      height: 32px !important;
      line-height: 32px !important;
    }

    .el-form-item__label {
      padding: 0;
    }

    .el-date-editor--daterange.el-input,
    .el-date-editor--daterange.el-input__inner,
    .el-date-editor--timerange.el-input,
    .el-date-editor--timerange.el-input__inner {
      width: 100%;
    }

    .el-input.is-disabled .el-input__inner {
      background-color: #f5f5f5 !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      height: 32px !important;
      line-height: 32px !important;
    }

    // 将分页器固定在底部
    .el-pagination {
      position: absolute;
      bottom: 0;
      width: 100%;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
      background-color: #191d21;
      border-top: 1px solid #2e343e;
      display: flex;
      justify-content: center;

      .el-pagination__sizes .el-select--mini .el-input__inner,
      .btn-prev,
      .btn-next,
      .el-pager li.number,
      .el-pager li.el-icon-more {
        color: #bfbfbf;
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
      }

      .el-pagination__total {
        color: rgba(255, 255, 255, 0.85);
      }

      .el-pager li:not(.disabled).active {
        color: #268dff !important;
        border: 1px solid #1677ff !important;
        background: #15325b !important;
      }

      .el-pager li:not(.disabled):hover {
        color: #bfbfbf;
        border-color: rgba(255, 255, 255, -0.15) !important ;
        background: rgba(255, 255, 255, 0.15) !important;
      }
    }
  }
  .person {
    margin-top: 5px;
  }
</style>

<style lang='scss'>
  .underline div span {
    text-decoration: underline;
    color: red; // 或者你想要的颜色
  }
  .success-tip {
    margin-bottom: 8px;
  }
</style>
