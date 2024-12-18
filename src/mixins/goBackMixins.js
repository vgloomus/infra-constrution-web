const goBackMixins = {
  methods: {
    // 页面路由离开拦截
    pageBeforeLeave(to, from, next) {
      this.onBeforeLeaveHandle(next)
    },
    onBeforeLeaveHandle(callback) {
      if (this.$route.query?.type === 'edit') {
        // eslint-disable-next-line node/no-callback-literal
        callback(true)
        return
      }
      this.$confirm('放弃操作后，当前所编辑的内容将会丢失。', '确定放弃当前操作吗？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'warning'
      })
        .then(() => {
          // eslint-disable-next-line node/no-callback-literal
          callback(true)
        })
        .catch(() => {
          // eslint-disable-next-line node/no-callback-literal
          callback(false)
        })
    },
    // 返回
    goBack() {
      this.onBeforeLeaveHandle((val) => {
        if (val) {
          history.go(-1)
        }
      })
    }
  }
}
export default goBackMixins
