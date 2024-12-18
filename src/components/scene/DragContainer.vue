<!--
 * @author: lvzj
 * @Date: 2024-08-07 14:05:43
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-11-06 09:20:22
 * @description: file content
-->
<template>
  <div
    class="drag-container"
    :class="{ isCollapse }"
  >
    <!-- 拖拽线 -->
    <div
      v-if="draggable && !isCollapse"
      class="drag-line"
      :style="`${dragPosition}: -2px`"
      @mousedown="onMouseDown"
    ></div>
    <!-- 展开按钮 -->
    <div
      v-if="collapsible"
      class="collapse-btn"
      :style="`${dragPosition}: -25px;`"
      @click="collapseChange"
    >
      <i
        width="25"
        height="50"
        :class="['icon-font', computedName]"
      ></i>
      <i
        class="arrow"
        :style="`${dragPosition === 'left' ? '' : 'transform: scaleX(-1);'}`"
        :class="isCollapse ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"
      ></i>
    </div>
    <!-- 默认插槽 -->
    <slot
      :isCollapse="isCollapse"
      :open="open"
    ></slot>
  </div>
</template>

<script>
export default {
  name: 'DragContainer',
  props: {
    // 默认宽度
    defaultWidth: {
      type: String || Number,
      default: '240'
    },
    defaultCollapse: {
      type: Boolean,
      default: false
    },
    min: {
      type: String || Number,
      default: '240'
    },
    max: {
      type: String || Number,
      default: '1000'
    },
    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: false
    },
    // 是否可折叠
    collapsible: {
      type: Boolean,
      default: true
    },
    // 拖拽/折叠位置
    dragPosition: {
      type: String,
      default: 'left'
    }
  },
  data() {
    return {
      width: parseFloat(this.defaultWidth),
      startX: 0,
      initialX: 0,
      afterDragWidth: 0,
      isDragging: false,
      isCollapse: false
    }
  },
  computed: {
    computedWidth() {
      return this.width + 'px'
    },
    computedName() {
      const position = this.dragPosition === 'left' ? 'icon-right-side' : 'icon-left-side'
      return position
    }
  },
  watch: {
    width(newVal) {
      this.$emit('widthChange', newVal)
    }
  },
  methods: {
    onMouseDown(e) {
      this.isDragging = true
      document.body.style.cursor = 'col-resize'
      this.startX = e.clientX
      this.initialX = this.width
      document.addEventListener('mousemove', this.drag)
      document.addEventListener('mouseup', this.endDrag)
    },
    drag(e) {
      if (this.isDragging) {
        const moveX = e.clientX - this.startX
        this.width = Math.min(Math.max(Number(this.min), this.diffValue(this.initialX, moveX)), Number(this.max))
      }
    },
    endDrag() {
      this.isDragging = false
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', this.drag)
      document.removeEventListener('mouseup', this.endDrag)
    },
    diffValue(a, b) {
      if (this.dragPosition === 'left') {
        return parseFloat(a) - parseFloat(b)
      }
      return parseFloat(a) + parseFloat(b)
    },
    onMouseUp() {
      if (this.isDragging) {
        this.isDragging = false
        document.body.style.cursor = 'default'
        document.removeEventListener('mousemove', this.drag)
      }
    },
    collapseChange() {
      this.isCollapse = !this.isCollapse
      if (this.isCollapse) {
        this.width = 0
      } else {
        this.width = parseFloat(this.defaultWidth)
      }
      this.$emit('collapseChange')
    },
    open() {
      this.isCollapse = false
      this.width = parseFloat(this.defaultWidth)
    },
    close() {
      this.isCollapse = true
      this.width = 0
    }
  }
}
</script>
<style lang="scss" scoped>
  .drag-container {
    width: 240px;
    width: v-bind(computedWidth);
    height: 100%;
    flex-shrink: 0;
    position: relative;
    user-select: none;
    .slot-container {
      width: 100%;
      height: 100%;
    }
    .drag-line {
      width: 5px;
      height: 100%;
      background-color: transparent;
      position: absolute;
      top: 0;
      z-index: 1;
      cursor: col-resize;
    }
    .icon-font {
      margin-left: 0;
    }
    .collapse-btn {
      position: absolute;
      top: calc(50% - 16px);
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      opacity: 1;
      z-index: 10;
      .arrow {
        position: absolute;
        top: calc(50% - 7px);
        left: calc(50% - 7px);
      }
    }
    &:hover {
      .collapse-btn {
        opacity: 1;
      }
    }
    &.isCollapse {
      .collapse-btn {
        opacity: 1;
      }
    }
  }
</style>
