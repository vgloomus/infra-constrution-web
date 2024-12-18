/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-10-16 17:33:58
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-18 15:29:36
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\mixins\meshMixins.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { findNodeByKey } from '@/utils/index'
import { cloneDeep } from 'lodash'
import { EnumTypes } from '@/common/enum'
const meshMixins = {
  methods: {
    // 根据树形结构选中状态更新mesh
    updateMeshByTree(nodes) {
      // const nodes = findNodeListsWithType(this.layerTree, EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
      const groups = this.meshData.filter((item) => item.type === EnumTypes.ROCK_SOIL_BOUNDARY_GROUP)
      const singles = this.meshData.filter((item) => item.type === EnumTypes.ROCK_SOIL_BOUNDARY)
      // 先处理组
      groups.forEach((item) => {
        const childKeys = item.resourceConfigIds || []
        const allChecked = childKeys.every((key) => findNodeByKey(nodes, key)?.checked)
        item.checked = allChecked
      })
      // 处理面
      singles.forEach((item) => {
        const findGroup = groups.find((group) => group.resourceConfigIds.includes(item.resourceKey))
        if (findGroup) {
          if (findGroup.checked) {
            item.checked = false
          } else {
            item.checked = findNodeByKey(nodes, item.resourceKey)?.checked || false
          }
        } else {
          item.checked = findNodeByKey(nodes, item.resourceKey)?.checked || false
        }
      })
      this.meshData = [...groups, ...singles]
    },
    handleMeshShow(meshData) {
      // 查找显示，隐藏 names
      const showNames = []
      const hideNames = []
      meshData.forEach((item) => {
        if (item.checked) {
          item.resourceData.forEach((mesh, index) => {
            showNames.push(`mesh_${index}_${item.resourceKey}_${item.type}`)
          })
        } else {
          item.resourceData.forEach((mesh, index) => {
            hideNames.push(`mesh_${index}_${item.resourceKey}_${item.type}`)
          })
        }
      })
      window.bimInstance.showExtByName(showNames)
      window.bimInstance.hideExtByName(hideNames)
    },
    // 绘制mesh面
    drawMesh(list, isFlag = false) {
      list.forEach((item) => {
        window.bimInstance?.drawMeshPlane(item)
      })
      if (isFlag) return
      this.$nextTick(() => {
        this.handleMeshShow(this.meshData)
      })
    },
    // 聚焦到mesh
    focusRockSoilBoundary(node) {
      const meshNode = this.meshData.find((item) => item.resourceKey === node?.resource?.resourceKey)
      if (meshNode) {
        const mesh = meshNode.resourceData
        const midIndex = Math.floor(mesh.length / 2)
        const position = cloneDeep(mesh[midIndex][0])
        position.alt = this.$route.name === 'TemplateEdit' ? 100 : +position.alt + 100
        const cameraStatus = {
          orientation: {
            pitch: -Math.PI / 2,
            yaw: 0,
            roll: 0
          },
          position: position
        }
        window.bimInstance?.setCameraStatus(cameraStatus)
      }
    },
    // 删除mesh
    clearMeshData() {
      const allNames = []
      this.meshData.forEach((item) => {
        item.resourceData.forEach((mesh, index) => {
          const name = `mesh_${index}_${item.resourceKey}_${item.type}`
          allNames.push(name)
        })
      })
      window.bimInstance.removeExtByNames(allNames)
    }
  }
}

export default meshMixins
