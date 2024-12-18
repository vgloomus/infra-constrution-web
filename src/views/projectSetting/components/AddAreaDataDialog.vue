<!--
 * @author: lvzj
 * @Date: 2024-06-24 16:08:35
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-27 19:19:56
 * @description: 新增区域数据
-->
<template>
  <el-dialog
    :title="$t('addAreaDialog.title')"
    :visible.sync="dialogVisible"
    width="700px"
    top="10vh"
    @close="close"
    @open="open"
  >
    <div class="content">
      <el-form
        :model="dataForm"
        :rules="rules"
        ref="dataForm"
        label-width="100px"
      >
        <el-form-item
          :label="$t('addAreaDialog.dataType')"
          prop="dataType"
        >
          <el-select
            v-model="dataForm.dataType"
            @change="changeDataType"
            :placeholder="$t('addAreaDialog.selectDataType')"
          >
            <el-option
              :label="$t('addAreaDialog.stoneBoundary')"
              value="StoneBoundary"
            ></el-option>
            <!-- <el-option
              :label="$t('addAreaDialog.baseBoundary')"
              value="BaseBoundary"
            ></el-option> -->
            <el-option
              :label="$t('addAreaDialog.terrainSection')"
              value="TerrainSection"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('addAreaDialog.name')"
          prop="name"
        >
          <el-input
            :placeholder="$t('addAreaDialog.enterName')"
            :maxlength="50"
            v-model.trim="dataForm.name"
          ></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('addAreaDialog.area')"
          prop="area"
        >
          <!-- <el-select
            v-model="dataForm.area"
            :placeholder="$t('addAreaDialog.selectArea')"
          >
            <el-option
              v-for="item in areaList"
              :key="item.key"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </el-select> -->
          <el-cascader
            v-model="dataForm.area"
            :options="areaList"
            :placeholder="$t('addAreaDialog.selectArea')"
            :props="cascaderProps"
            ref="cascader"
          ></el-cascader>
        </el-form-item>
        <el-form-item
          :label="$t('addAreaDialog.measurementTime')"
          v-if="dataForm.dataType !== 'TerrainSection'"
          prop="date"
        >
          <el-date-picker
            v-model="dataForm.date"
            type="daterange"
            align="right"
            :start-placeholder="$t('addAreaDialog.startDate')"
            :end-placeholder="$t('addAreaDialog.endDate')"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item
          :label="$t('addAreaDialog.file')"
          prop="file"
        >
          <el-upload
            action="''"
            :accept="accept"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadFileHandle"
          >
            <el-button
              size="small"
              class="default-btn"
              type="default"
            >{{ dataForm.file ? $t('addAreaDialog.reupload') : $t('addAreaDialog.uploadFile') }}</el-button>
            <div
              slot="tip"
              class="el-upload__tip"
            >{{ $t('addAreaDialog.supportedFormats', { format: accept }) }}</div>
          </el-upload>
          <UploadProgress
            v-if="dataForm.file"
            class="upload-progress"
            :fileName="dataForm.fileName"
            :progress="progress"
            :isComplete="isComplete"
            @delete="deleteFile"
          ></UploadProgress>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer">
      <div class="footer-btn">
        <el-button
          type="default"
          class="default-btn"
          @click="close"
        >{{ $t('cancel') }}</el-button>
        <el-button
          type="primary"
          :loading="saveAreaDataLoading"
          @click="save"
        >{{ $t('confirm') }}</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { uploadFile, getUploadUrl, getZipMd5 } from '@/api/common'
import { readTxtFileCount } from '@/utils/index'
import UploadProgress from '@/views/projectSetting/components/UploadProgress.vue'
export default {
  name: 'AddAreaDataDialog',
  components: { UploadProgress },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    areaList: {
      type: Array,
      default: () => []
    },
    saveAreaDataLoading: Boolean
  },
  data() {
    return {
      loading: false,
      dataForm: {
        dataType: 'TerrainSection',
        name: '',
        area: '',
        date: '',
        file: '',
        drawingMd: '',
        configId: '',
        fileName: ''
      },
      cascaderProps: {
        value: 'name',
        label: 'name',
        children: 'children'
      },
      progress: 10,
      isComplete: false,
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        dataType: [
          { required: true, message: '请选择数据类型', trigger: 'change' }
        ],
        area: [
          { required: true, message: '请选择所属区域', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择测量时间', trigger: 'change' }
        ],
        file: [
          { required: true, message: '请上传文件', trigger: 'change' }
        ]
      },
      pickerOptions: {
        disabledDate: this.disabledDate
      }
    }
  },
  computed: {
    ...mapState(['projectId']),
    dialogVisible: {
      get() {
        return this.visible
      },
      set() {
        this.$emit('update:visible', false)
      }
    },
    accept() {
      if (this.dataForm.dataType !== 'TerrainSection') {
        return '.DAT'
      } else {
        return '.ZIP'
      }
    }
  },
  methods: {
    open() {
      this.$refs.dataForm?.resetFields()
      this.dataForm.fileName = ''
      this.progress = 0
      this.isComplete = false
    },
    close() {
      if (this.saveAreaDataLoading) return this.$message.warning('正在保存数据，请稍后')
      this.$emit('update:visible', false)
    },
    save() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          if (!this.isComplete) {
            return this.$message.warning('文件上传未完成')
          }
          const area = this.$refs.cascader.getCheckedNodes()[0]?.data || {}
          const obj = {
            ...this.dataForm,
            area: area.name
          }
          this.$emit('save', obj, area)
        }
      })
    },
    disabledDate(time) {
      // 禁用今天之后的所有日期
      return time.getTime() > Date.now()
    },
    async uploadFileHandle(data) {
      // 使用JSZip解析ZIP文件
      const file = data.file
      const fileName = file.name
      const index = fileName.lastIndexOf('.')
      this.dataForm.name = this.dataForm.name || fileName.substring(0, index)
      this.dataForm.fileName = fileName
      this.dataForm.file = file

      this.$refs.dataForm.validateField('name')
      this.$refs.dataForm.validateField('file')
      // 断面数据时，需要计算图纸的MD5值
      if (this.dataForm.dataType === 'TerrainSection') {
        // 计算md5
        const formData = new FormData()
        formData.append('file', file)
        const md5 = await getZipMd5(this.projectId, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.dataForm.drawingMd = md5.data
        this.getUploadUrlAndUploadFile(fileName, file)
        return
      }
      // 土石分界
      if (this.dataForm.dataType === 'StoneBoundary') {
        const count = await readTxtFileCount(file)
        if (count > 3) {
          this.getUploadUrlAndUploadFile(fileName, file)
        } else {
          this.$message.error('数据错误: 文件内散点数量需不少于3个！')
          this.deleteFile()
        }
      }
    },
    // 获取地址并上传文件
    getUploadUrlAndUploadFile(name, file) {
      // 获取上传地址上传文件
      const params = {
        fileName: encodeURIComponent(name),
        dataType: this.dataForm.dataType
      }
      getUploadUrl(this.projectId, params).then(res => {
        const uploadUrl = res?.uploadUrl
        this.dataForm.configId = res?.configId
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
        }).catch(() => {
          this.deleteFile()
          this.$message.error('上传失败')
        })
      })
    },
    // 计算上传进度
    onUploadProgress(progressEvent) {
      console.log('上传进度', progressEvent)
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      this.progress = percentCompleted
    },
    beforeUpload(file) {
      const name = file.name
      const index = name.lastIndexOf('.')
      const type = name.substring(index).toUpperCase()
      // const size = file.size
      const accept = this.accept.split(',').map(item => item.toUpperCase())
      if (!accept.includes(type)) {
        this.$message.error(`格式错误，仅支持${this.accept}格式!`)
        return false
      }
      // if (size > this.maxSize * 1024 * 1024) {
      //   this.$message.error(`不能超过${this.maxSize}Mb!`)
      //   return false
      // }
      return true
    },
    deleteFile() {
      this.dataForm.file = null
      this.dataForm.fileName = ''
      this.progress = 0
      this.isComplete = false
    },
    changeDataType(val) {
      this.dataForm.name = ''
      this.dataForm.date = ''
      this.deleteFile()
    }
  }
}
</script>

<style lang="scss" scoped>
  .upload-progress {
    width: auto;
    height: auto;
  }
  ::v-deep .el-cascader {
    width: 100%;
  }
  // ::v-deep .el-form-item__content {
  //   line-height: auto;
  // }
</style>
