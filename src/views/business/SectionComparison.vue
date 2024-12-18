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
            >{{$t('addNew')}}</el-button>
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
                    <img :src="card.thumbnailUrl" />

                    <div class="after-measure-time">
                      <div class="back">后</div>
                      <div class="icon"></div>
                      {{$t('collectDate')}}：{{ card.postTerrainCollectionStartDate }} ~ {{ card.postTerrainCollectionEndDate }}
                    </div>
                    <div class="before-measure-time">
                      <span class="before">前</span>
                      <div class="icon"></div>
                      {{$t('collectDate')}}：{{ card.preTerrainCollectionStartDate }} ~ {{ card.preTerrainCollectionEndDate }}
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
                            <div class="id">ID:{{ card.id }}</div>
                            <div class="person"> {{$t('operator')}}：{{ card.updaterName }}</div>
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
                            <el-dropdown-item command="edit">{{$t('edit')}}</el-dropdown-item>
                            <el-dropdown-item
                              command="share"
                              :disabled="card.status !==3"
                            >{{$t('share')}}
                            </el-dropdown-item>
                            <el-dropdown-item
                              command="download"
                              :disabled="card.status !==3"
                            >{{$t('download')}}
                            </el-dropdown-item>
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
                            <span>{{$t('successCreatedLink')}}</span>
                          </div>

                          <div
                            v-loading="isLoading"
                            v-if="isLoading"
                            :text="$t('fetchingLink')"
                            :spinner="'el-icon-loading'"
                            lock
                          ></div>

                          <el-input
                            v-if="!isLoading"
                            :placeholder="$t('input')"
                            v-model="shareUrl"
                            :disabled="true"
                          > </el-input>

                          <span
                            slot="footer"
                            class="dialog-footer"
                          >
                            <el-button
                              type="primary"
                              @click="shareDialogVisible = false"
                            >{{$t('cancel')}}</el-button>
                            <el-button
                              type="primary"
                              @click="confirmShare"
                            >{{$t('copy')}}</el-button>
                          </span>
                        </el-dialog>
                      </div>
                    </div>
                    <div class="update-time">{{$t('updateTime')}}：{{ card.updateTime }}</div>
                  </div>
                </div>
              </div>

              <template>
                <el-pagination
                  class="main-pagination"
                  type="manual"
                  layout="sizes,->,total,prev, pager, next"
                  :total="page.total"
                  :page-size="page.pageSize"
                  :current-page="page.currentPage"
                  @current-change="(page) => handlePageChange(page)"
                  @size-change="(page) =>handleSizePageChange(page)"
                >
                </el-pagination>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
    <SCDownLoadDialog
      :taskId="taskId"
      :visible.sync="downloadVisible"
      @resultDownload="resultDownload"
      :downLoading="downLoading"
      :type="type"
    />
    <SectionComparisonDialog
      :project-id="projectId"
      :visible.sync="dialogVisible"
    />
  </div>
</template>
<script>
import { getReceiveShareCode, getComparisonsReceiveResultExcel, getSectionComparisonList, mergeCompareDrawing, getComparisonDownload, deleteComparison } from '@/api/business'
import { mapState } from 'vuex'
import moment from 'moment'
import JSONbig from 'json-bigint'
import SCDownLoadDialog from './components/SCDownLoadDialog.vue'
import SectionComparisonDialog from './components/SectionComparisionDialog.vue'

export default {
  name: 'MeasurementReceiver',
  components: {
    SCDownLoadDialog,
    SectionComparisonDialog
  },
  data() {
    return {
      cardList: [],
      dialogVisible: false, // 控制新建任务对话框的显示
      visiblePopover: null,
      tableData: [], // 表格数据
      multipleSelection: [],
      selectedRadio: null,
      selectedItems: [
        { id: 1, date: '2023-01-01' },
        { id: 2, date: '2023-01-02' }
      ], // 存储最后勾选的两个选项
      shareDialogVisible: false, // 控制分享弹框的显示
      specialDates: [], // 存储需打下划线的特殊日期
      shareUrl: '', // 分享链接
      bizId: null, // 业务id
      page: {
        total: 50,
        pageSize: 10,
        currentPage: 1
      },
      page1: {
        total: 50,
        pageSize: 10,
        currentPage: 1
      },
      disable: true,
      isLoading: true,
      taskId: null,
      type: 'comparison',
      downloadVisible: false,
      downLoading: false,
      cardWidth: '383px',
      listIsLoading: true
    }
  },
  computed: {
    ...mapState(['projectId'])
  },
  mounted() {
    this.queryMeasureReceiverList()
    this.checkTextOverflow()
    window.addEventListener('resize', this.checkTextOverflow)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkTextOverflow)
  },
  methods: {
    // 获取测量收方列表页面数据
    queryMeasureReceiverList() {
      const params = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      getSectionComparisonList(this.projectId, params)
        .then((data) => {
          this.cardList =
            data?.records?.map((record) => {
              return {
                name: record?.name,
                updateTime: moment(record?.updateTime).format('YYYY-MM-DD') || '',
                preTerrainCollectionStartDate: moment(record?.preTerrainCollectionStartDate).format('YYYY-MM-DD') || '',
                preTerrainCollectionEndDate: moment(record?.preTerrainCollectionEndDate).format('YYYY-MM-DD') || '',
                postTerrainCollectionStartDate: moment(record?.postTerrainCollectionStartDate).format('YYYY-MM-DD') || '',
                postTerrainCollectionEndDate: moment(record?.postTerrainCollectionEndDate).format('YYYY-MM-DD') || '',
                thumbnailUrl: record?.thumbnailUrl || require('../../assets/images/star.jpg'),
                id: record?.id,
                updaterName: record?.updaterName,
                status: record?.status
              }
            }) || []
          this.disable = false
          this.page.total = data?.total
          this.page.pageSize = data?.size
          this.$nextTick(() => {
            this.checkTextOverflow()
          })
          console.log('获取测量收方列表页数据成功:', this.data)
        })
        .catch((error) => {
          console.error('获取测量收方列表页数据失败:', error)
        })
    },
    handlePageChange(page) {
      this.page.currentPage = page
      this.queryMeasureReceiverList()
    },
    handleSizePageChange(page) {
      this.page.pageSize = page
      this.queryMeasureReceiverList()
    },

    // 验证任务名称是否重复
    isTaskNameDuplicate(taskName) {
      // 检查 this.cardList 是否定义，如果未定义则返回 false
      return Array.isArray(this.cardList) && this.cardList.length > 0 && this.cardList.some((card) => card.name === taskName)
    },
    showDialog() {
      this.dialogVisible = true
    },
    getReceiveShareCode(projectId, body) {
      getReceiveShareCode(projectId, body)
        .then((data) => {
          const shareCode = data?.data || ''
          const baseUrl = window.location.origin
          this.shareUrl = `${baseUrl}/bimtwins/infra-construction-web/business/sectionComparisonShare?shareCode=${shareCode}`
          this.isLoading = false
          // 本地调试用
          // this.shareUrl = `${baseUrl}/business/measurementReceiverShare?shareCode=${shareCode}`
          console.log('获取分享码成功:', this.shareUrl)
        })
        .catch((error) => {
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
          // bizId 转换为字符串
          bizId: JSONbig.stringify(this.bizId),
          bizName: card.name,
          type: 2
        }
        // 调用合并图纸的接口
        await this.mergeDrawing(this.projectId, body)
        this.getReceiveShareCode(this.projectId, body)
        this.shareDialogVisible = true
      } else if (command === 'download') {
        this.taskId = card?.id
        this.openDownloadDialog()
      } else if (command === 'edit') {
        this.handleClick(card)
      } else if (command === 'delete') {
        this.taskId = card?.id
      }
    },
    // TODO：调后端的接口，删除数据，然后重新渲染列表
    async handleDelete() {
      try {
        await deleteComparison(this.projectId, this.taskId)
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.queryMeasureReceiverList()
      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    // 打开弹窗
    openDownloadDialog() {
      this.downloadVisible = true
    },
    // 关闭分享弹框
    handleCloseDialog() {
      this.shareDialogVisible = false
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
      input.setSelectionRange(0, 99999)
      document.execCommand('copy')
      document.body.removeChild(input)
    },

    async resultDownload() {
      this.downLoading = true
      // 下载功能的实现
      getComparisonsReceiveResultExcel(this.projectId, this.taskId)
        .then((res) => {
          if (res) {
            window.open(res, '_blank')
          }
        })
        .finally(() => {
          this.downLoading = false
        })
    },

    handleClick(item) {
      const { name, preTerrainCollectionStartDate, preTerrainCollectionEndDate, postTerrainCollectionStartDate, postTerrainCollectionEndDate } = item
      const dates = [preTerrainCollectionStartDate, preTerrainCollectionEndDate, postTerrainCollectionStartDate, postTerrainCollectionEndDate].sort(
        (a, b) => new Date(a) - new Date(b)
      )
      this.$router.push({
        path: '/business/sectionComparisonEdit',
        query: {
          type: 'edit',
          id: item.id,
          name,
          gatherDate: `${dates[0]}-${dates[3]}`
        }
      })
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
    async mergeCompareDrawing(projectId) {
      return mergeCompareDrawing(projectId)
    },
    // 合并图纸
    async mergeDrawing(projectId, body) {
      return getComparisonDownload(projectId, [body.bizId])
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

              .icon {
                width: 16px;
                height: 16px;
                background: url("../../assets/images/icon-calendar.png") no-repeat
                  top left / 16px 16px;
                margin-right: 4px;
              }

              .after-measure-time {
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
                border-radius: 4px;

                .back {
                  width: 24px;
                  height: 28px;
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                  font-size: 12px;
                  color: #6abe39;
                  background: #1d3712;
                  margin-left: -12px;
                  margin-right: 8px;
                  border-radius: 4px 0 0 4px;
                }
              }
              .before-measure-time {
                left: 8px;
                top: 40px;
                position: absolute;
                height: 28px;
                padding: 4px 12px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;

                .before {
                  width: 24px;
                  height: 28px;
                  display: flex;
                  flex-direction: row;
                  justify-content: center;
                  align-items: center;
                  font-size: 12px;
                  color: #3c89e8;
                  background: #112545;
                  margin-left: -12px;
                  margin-right: 8px;
                  border-radius: 4px 0 0 4px;
                }
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
                    width: 270px;
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
                  width: 270px;
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

        .section-comparison-base {
          display: flex;
          justify-content: flex-end;
          align-items: center;

          .required-marker {
            color: red;
            margin-right: 4px; /* 调整星号和文本之间的间距 */
          }

          .note {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
  }

  ::v-deep {
    .el-table__body-wrapper {
      max-height: 365px;
      overflow: hidden;
      overflow-y: auto;
    }

    .selectAllBtnDis .cell {
      visibility: hidden;
    }
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

    .main-pagination {
      // 底部分页器
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

<style lang="scss">
  .underline div span {
    text-decoration: underline;
    color: red; // 或者你想要的颜色
  }
  .success-tip {
    margin-bottom: 8px;
  }
</style>
