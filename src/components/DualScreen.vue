<!--
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-12-09 14:42:34
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-12-10 19:45:30
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\components\DualScreen.vue
 * @Description: 双屏组件
-->
<template>
  <div
    class="splitter"
    id="splitter-wrap"
  >
    <div
      class="left-pane"
      :style="{ width: leftWidth + 'px' }"
    >
      <slot name="left"></slot>
    </div>
    <div
      :style="{ left: leftWidth + 'px' }"
      class="splitter-line"
    >
      <div
        class="splitter-handle"
        @mousedown="startDrag"
      ></div>
      <span class="tag-left">1</span>
      <span class="tag-right">2</span>
    </div>
    <div class="right-pane">
      <slot name="right"></slot>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      leftWidth: 0, // 初始左侧宽度，将在mounted钩子中设置
      isDragging: false,
      startX: 0,
      initialX: 0,
      allWidth: 0,
      minWidth: 30
    }
  },
  props: {
    left: {
      type: Number,
      default: 300
    },
    right: {
      type: Number,
      default: 300
    }
  },
  mounted() {
    const box = document.getElementById('splitter-wrap')
    this.allWidth = box.clientWidth
    this.leftWidth = this.allWidth / 2
  },
  methods: {
    startDrag(e) {
      this.isDragging = true
      this.initialX = e.clientX
      document.body.style.cursor = 'col-resize'
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
      const div = document.createElement('div')
      const wrap = document.getElementById('splitter-wrap')
      div.id = 'splitter-wrap-transparent'
      div.style.width = '100%'
      div.style.height = '100%'
      div.style.background = 'transparent'
      div.style.position = 'absolute'
      div.style.top = '0'
      div.style.left = '0'
      div.style.right = '0'
      div.style.bottom = '0'
      div.style.zIndex = 2
      wrap.append(div)
    },
    onDrag(e) {
      if (this.isDragging) {
        const deltaX = e.clientX - this.initialX // 计算移动距离
        this.leftWidth += deltaX // 更新左侧宽度
        this.initialX = e.clientX
        if (this.leftWidth <= this.left + this.minWidth - 5) {
          this.leftWidth = this.left + this.minWidth - 5
          this.initialX = this.leftWidth + this.minWidth - 5
        }
        if (this.leftWidth >= this.allWidth - this.right - this.minWidth) {
          this.leftWidth = this.allWidth - this.right - this.minWidth
          this.initialX = this.allWidth - this.right - this.minWidth
        }
        // if (this.leftWidth <= 0) {
        //   this.leftWidth = 0
        //   this.initialX = 0
        // }
        // if (this.leftWidth >= this.allWidth) {
        //   this.leftWidth = this.allWidth
        //   this.initialX = this.allWidth
        // }
        this.$emit('splitterDragIng')
      }
    },
    stopDrag() {
      this.$emit('splitterDragEnd')
      this.isDragging = false
      const wrap = document.getElementById('splitter-wrap-transparent')
      if (wrap) {
        wrap.remove()
      }
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
    },
    onMouseUp() {
      if (this.isDragging) {
        this.isDragging = false
        document.body.style.cursor = 'default'
        document.removeEventListener('mousemove', this.drag)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .splitter {
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .left-pane,
  .right-pane {
    overflow: hidden;
    height: 100%;
  }

  .right-pane {
    flex: 1;
  }

  .splitter-line {
    width: 5px;
    height: 100%;
    background: rgba(0, 0, 0, 1);
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 2;
    .tag-left {
      position: absolute;
      top: 16px;
      right: 5px;
      width: 24px;
      height: 24px;
      border-radius: 6px 0px 0px 6px;
      opacity: 1;
      /* 自动布局 */
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
      padding: 5px 8px;
      /* 地形 */
      background: #f9de4b;
      z-index: 39;
    }
    .tag-right {
      position: absolute;
      top: 16px;
      left: 5px;
      width: 24px;
      height: 24px;
      border-radius: 0px 6px 6px 0px;
      opacity: 1;
      /* 自动布局 */
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 5px 8px;

      /* 地形 */
      background: #f9de4b;
      z-index: 40;
    }
  }

  .splitter-handle {
    width: 5px;
    height: 24px;
    background-color: rgba(255, 255, 255, 0.45);
    position: absolute;
    top: calc(50% - 12px);
    z-index: 1;
    cursor: col-resize;
  }
</style>
