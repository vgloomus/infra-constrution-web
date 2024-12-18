<template>
  <div class="area-info-card">
    <div class="top">
      <div class="left-area">
        <span :class="['cut-rect', regionTypeClass]"></span>
        <div class="info-name">{{this.info.regionName}}</div>
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
          <span>{{ $t('region.name') }}</span>
          <div
            class="value"
            :title="info.regionName"
          >{{this.info.regionName}}</div>
        </div>
        <div class="item">
          <span>{{ $t('region.type') }}</span>
          <span>{{ regionTypeLabel }}</span>
        </div>
        <div
          class="item"
          v-if="info.regionType === 4 || info.regionType === 5"
        >
          <span>{{ $t('region.capacity') }}(m³)</span>
          <div class="value">{{this.info.capacity}}</div>
        </div>
        <div
          class="item"
          v-if="info.regionType !== 1 && info.regionType !== 2"
        >
          <span>{{ $t('region.date') }}</span>
          <el-date-picker
            v-model="formattedDate"
            type="date"
            placeholder=""
            class="value"
            disabled
          >
          </el-date-picker>
        </div>
        <div
          class="item"
          v-if="info.regionType === 4"
        >
          <span>{{ $t('region.backfill') }}</span>
          <el-radio-group
            v-model="radio"
            disabled
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </div>
        <div
          class="item"
          v-if="info.regionType === 5"
        >
          <span>{{ $t('region.processing') }}</span>
          <el-radio-group
            v-model="radio1"
            disabled
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
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
      </div>
    </div>
    <div class="row">
      <div class="title">
        {{ $t('region.rangeLine') }}
      </div>
      <el-upload
        v-if="showUploadComponent"
        ref="fileRefs"
        class="upload-demo"
        :class="{ 'is-dragging': isDragging, 'upload-error': uploadError }"
        drag
        action="#"
        :limit="1"
        :before-upload="beforeUpload"
        :http-request="uploadFileHandle"
        :show-file-list="false"
        :disabled=" uploadedFileName !== ''"
        accept=".dxf"
      >
        <template v-slot:default>
          <template v-if="!uploadedFileName">
            <div class="upload-content">
              <div><i class="icon-upload"></i></div>
              <div class="el-upload__text">
                {{ $t('region.dragFiles') }}<em>{{ $t('region.clickUpload') }}</em>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="uploaded-file">
              <div class="uploaded-file-content">
                <span class="name">{{ uploadedFileName }}</span>
                <i :class="uploadError ? 'el-icon-error error-icon' : isUploading ? 'el-icon-loading loading-icon' : 'el-icon-success success-icon'"></i>
              </div>
              <span class="actions">
                <a @click="retryUpload">{{ $t('region.retry') }}</a>
                <a @click="removeFile">{{ $t('region.delete') }}</a>
              </span>
            </div>
          </template>
        </template>
      </el-upload>
      <div
        class="el-upload__tip__error"
        v-if="uploadError"
      >{{ $t('region.errorFormat') }}
      </div>
      <div
        class="el-upload__tip"
        v-else
      >{{ $t('region.supportedFormats') }}
      </div>
    </div>
    <div
      class="row"
      v-if="info.regionType !== 1 && info.regionType !== 2 && info.regionType !== 3"
    >
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
import { uploadFile, getUploadUrl } from '@/api/common'
import { saveRangeLine, getRangeLine, deleteRangeLine } from '@/api/business'
import { mapState } from 'vuex'
export default {
  name: 'RegionAreaInfoCard',
  data() {
    return {
      showUploadComponent: true,
      index: 0,
      selectedMethod: this.$t('region.manualFill'),
      regionType: this.$t('region.cutFill'),
      value: this.info.availableDate || '',
      radio: this.info.secondaryBackfill || false,
      radio1: this.info.processingSystem || false,
      isDragging: false,
      uploadError: false,
      uploadedFileName: '',
      isUploading: false,
      progress: 10,
      isComplete: false,
      dxfName: []
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
  watch: {
    info: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // this.value = newVal ? newVal.availableDate : ''
        if (newVal) {
          this.findLastDxfFile()
          this.radio = newVal.secondaryBackfill
          this.radio1 = newVal.processingSystem
        }
      }
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
    curEarthAll() {
      const curEarthExcavationArea = Number(this.info?.curEarthExcavationArea || 0).toFixed(2)
      const curStoneExcavationArea = Number(this.info?.curStoneExcavationArea || 0).toFixed(2)
      const total = (parseFloat(curEarthExcavationArea) + parseFloat(curStoneExcavationArea)).toFixed(2)
      return total > 0 ? total : 0
    },
    showStone() {
      return this.info?.stoneBoundaryEngineerCoords || this.info?.postStoneBoundaryEngineerCoords
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
    formattedDate() {
      if (!this.info.availableDate) return ''
      const date = new Date(this.info.availableDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
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
    beforeUpload(file) {
      // 文件名长度校验
      if (file.name.length > 50) {
        this.$message.error('文件名不能超过50个字符')
        return false
      }
      // 文件大小校验
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        this.$message.error('文件大小不能超过50Mb')
        return false
      }
      // 文件类型校验
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (fileExtension !== 'dxf') {
        this.$message.error('上传失败，请上传dxf文件')
        return false
      }
      this.uploadedFileName = file.name
      this.uploadError = false
      this.isUploading = true
      return true
    },
    retryUpload() {
      this.$refs.fileRefs.clearFiles()
      this.uploadedFileName = ''
      this.uploadError = false
      this.isDragging = false
      this.isUploading = false
    },
    // 删除文件，同时清空范围线，调删除接口
    removeFile() {
      this.deleteRangeLine()
      window.bimInstance?.removeExtByNames([`boundary_mesh_${this.info.regionId}`])
      this.showUploadComponent = false // 先隐藏组件
      this.$nextTick(() => {
        this.showUploadComponent = true // 重新显示组件，重新初始化
        this.uploadedFileName = ''
        this.uploadError = false
        this.isDragging = false
        this.isUploading = false
        this.progress = 0
        this.isComplete = false
        this.dxfName = []
      })
    },
    async uploadFileHandle(data) {
      const file = data.file
      const fileName = file.name
      this.uploadedFileName = fileName
      this.getUploadUrlAndUploadFile(fileName, file)
      this.$refs.fileRefs.clearFiles()
    },
    // 获取地址并上传文件
    getUploadUrlAndUploadFile(name, file) {
      // 获取上传地址上传文件
      const params = {
        fileName: encodeURIComponent(name),
        dataType: 'UploadDXF'
      }
      getUploadUrl(this.projectId, params).then(res => {
        const uploadUrl = res?.uploadUrl
        const configId = res?.configId
        if (!uploadUrl) return this.$message.error('获取上传地址失败')
        let httpsUrl = uploadUrl
        if (uploadUrl.includes('http://')) {
          httpsUrl = uploadUrl.replace('http://', 'https://')
        }
        uploadFile(httpsUrl, file, {
          onUploadProgress: this.onUploadProgress
        }).then(() => {
          this.$message.success('上传成功')
          this.isComplete = true
          this.progress = 100
          this.isUploading = false
          this.saveRangeLine({ configId, fileName: name })
        }).catch(() => {
          this.removeFile()
          this.$message.error('上传失败')
        })
      })
    },
    // 计算上传进度
    onUploadProgress(progressEvent) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      this.progress = percentCompleted
    },
    // 映射数据
    mappingData(data) {
      const result = []
      data.forEach(item => {
        const { gisBoundary, gisCenter, regionId, regionTypeId, regionName } = item
        const obj = {
          name: regionName,
          id: regionId,
          type: regionTypeId,
          gisCenter: gisCenter,
          points: gisBoundary
        }
        result.push(obj)
      })
      return result
    },
    // 保存范围线
    saveRangeLine(body) {
      saveRangeLine(this.projectId, this.info?.regionId, body).then(res => {
        this.$message.success('保存成功')
        this.$emit('saveSuccess', this.uploadedFileName)
        // this.getRangeLine().then(res => {
        // 删除所有上传的dxf文件
        // window.bimInstance?.removeExtByNames(this.dxfName)
        // 画线不需要去重
        // res.forEach(boundary => {
        //   boundary.gisBoundary = boundary.gisBoundary.filter((point, index, self) =>
        //     index === self.findIndex(p => p[0] === point[0] && p[1] === point[1] && p[2] === point[2])
        //   )
        // })
        //   const data = this.mappingData(res || [])
        //   window.bimInstance?.drawBoundaryPlanes(data)
        //   // 找到当前上传的文件
        //   const currentFile = res.find(boundary => boundary.fileName === this.uploadedFileName)
        //   if (!currentFile?.gisCenter) return

        //   const position = {
        //     lon: currentFile.gisCenter[0],
        //     lat: currentFile.gisCenter[1],
        //     alt: currentFile.gisCenter[2] + 200
        //   }
        //   const cameraStatus = {
        //     position: position,
        //     orientation: {
        //       pitch: -Math.PI / 2,
        //       yaw: 0,
        //       roll: 0
        //     }
        //   }
        //   window.bimInstance?.setCameraStatus(cameraStatus)
        // }).catch(error => {
        //   console.error('获取范围线失败', error)
        // })
      }).catch(() => {
        this.$message.error('保存失败')
      })
    },
    // 查询范围线
    getRangeLine() {
      return getRangeLine(this.projectId).then(res => {
        // 删除所有上传的dxf文件
        this.dxfName = []
        res.forEach(boundary => {
          const name = `boundary_mesh_${boundary.regionId}`
          if (!this.dxfName.includes(name)) {
            this.dxfName.push(name)
          }
        })
        return res
      }).catch(error => {
        this.$message.error('查询失败')
        throw error
      })
    },
    // 删除范围线
    deleteRangeLine() {
      deleteRangeLine(this.projectId, this.info?.regionId).then(res => {
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.error('删除失败')
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
    findLastDxfFile() {
      // 获取所有范围线，查找当前regionId对应的范围线
      // this.getRangeLine().then(res => {
      this.uploadedFileName = ''
      const currentRangeLine = this.rangeLineData.find(item => item.regionId === this.info.regionId)
      if (!currentRangeLine) return
      this.uploadedFileName = currentRangeLine.fileName
      // console.log('currentRangeLine', currentRangeLine)
      // }).catch(error => {
      //   console.error('获取范围线失败', error)
      // })
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
          font-size: 14px;
          color: $buttonDefaultColor;
          font-weight: bold;
          width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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

      .el-upload__tip__error {
        font-size: 14px;
        color: red;
      }

      .el-upload__tip {
        font-size: 14px;
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
          display: inline-block;
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

  ::v-deep {
    .el-upload-dragger {
      width: 266px;
      background: rgba(255, 255, 255, 0.04);
    }

    .el-date-editor.el-input {
      width: 126px;
    }

    div.el-date-editor.el-input--prefix .el-input__inner {
      color: white;
      border: none;
      background: none;
    }

    .el-input__inner {
      background: #1e2227;
    }

    .el-upload.el-upload--text .el-upload-dragger {
      height: 92px;
    }

    .el-upload:focus {
      color: none;
    }

    .el-date-editor.el-input--prefix .el-input__inner {
      text-align: right;
    }
  }

  .is-dragging ::v-deep .el-upload.el-upload--text .el-upload-dragger {
    height: 92px;
    border-color: red;
    background: rgba(255, 77, 79, 0.08);
  }
  .upload-error ::v-deep .el-upload:focus .el-upload-dragger {
    border-color: red;
    background: rgba(255, 77, 79, 0.08);
  }
</style>
