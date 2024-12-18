/*
 * @Description  : 工具函数
 * @Author       : 吕宗军
 * @Date         : 2023-03-21 18:35:23
 * @LastEditTime: 2024-12-13 15:56:01
 * @LastEditors: lvzj lvzj@glodon.com
 * @FilePath     : \infra-construction-web\src\utils\index.js
 */

// import axios from 'axios'
import html2canvas from 'html2canvas'
export const bytesToSize = (bytes) => {
  if (bytes < 1) return '0'
  const k = 1024
  const sizes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}
/**
 * 根据传入属性获取URL中的参数
 * @author: 吕宗军
 * @param {string} url URL地址
 * @param {string} val 要获取的属性
 * @returns 属性内容
 */
export function getQueryString(url, val) {
  const reg = new RegExp('(^|&)' + val + '=([^&]*)(&|$)')
  const r = url.split('?')[1].match(reg)
  if (r != null) return unescape(r[2])
  return null
}

/**
 * @description: 创建随机字符串
 * @author: 吕宗军
 * @param {number|string} length 长度
 * @return {string} 结果
 */
export function createHash(length = 24) {
  // 默认长度 24
  return Array.from(Array(Number(length) || 24), () => Math.floor(Math.random() * 36).toString(36)).join('')
}

/**
 * @description: 导出文件
 * @author: 吕宗军
 * @param {Blob} blob 文件对象
 * @param {string} filename 文件名称
 */
export function exportFile(blob, filename) {
  // 兼容IE
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename)
  } else {
    // 创建a标签触发下载
    const href = window.URL.createObjectURL(blob)
    simulateDownloadByA(href, filename)
  }
}
/**
 * @description: 创建a标签触发下载
 * @author: 吕宗军
 * @param {string} href 文件地址
 * @param {string} filename 文件名称
 */
export function simulateDownloadByA(href, filename) {
  const a = document.createElement('a')
  a.download = filename
  a.style.display = 'none'
  a.href = href
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(href)
}
/**
 * @description: 树形结构增加随机key
 * @author: 吕宗军
 * @param {string} nodes 节点数组
 * @param {string} parentKey 父级key
 * @param {string} disableKey 通过这个key去判断是否需要增加key
 */
export function addRandomKeys(nodes, parentKey, disableKey = false, level = 0) {
  nodes.forEach((node) => {
    if (!node.key) {
      node.key = Math.random().toString(36).substr(2, 9)
      if (disableKey) {
        node.disabled = node?.resource?.[disableKey]
        if (node.disabled) {
          node.checked = true
        }
      }
    }
    if (node.children && node.children.length) {
      addRandomKeys(node.children, node.key, disableKey, level + 1)
    } else {
      // 计算level
      node.level = level
    }
  })
  return nodes
}
/**
 * @description: 收方成果根据状态添加字段
 * @author: 吕宗军
 * @param {string} nodes 节点数组
 * @param {string} parentKey 父级key
 * @param {string} type
 * @param {string} val
 */
export function addRandomKeysAndProps(nodes, parentKey, type, val, level = 0) {
  nodes.forEach((node) => {
    if (!parentKey) {
      node.disabled = val
    }
    if (!node.key) {
      node.key = Math.random().toString(36).substr(2, 9)
      node.disabled = val
      if (node.type === type) {
        // node.children = []
      }
    }
    if (node.children && node.children.length) {
      addRandomKeysAndProps(node.children, node.key, type, val, level + 1)
    } else {
      // 计算level
      node.level = level
    }
  })
  return nodes
}

/**
 * @description: 树形结构增加树形
 * @author: 吕宗军
 * @param {string} nodes 节点数组
 * @param {Array} types  节点类型
 * @param {Array} key  键值
 * @param {string | Boolean} value  值
 */
export function addKeyForTree(nodes, types, key, value = false) {
  nodes.forEach((node) => {
    if (node.type && types.includes(node.type)) {
      node[key] = value
    }
    if (node.children && node.children.length) {
      addKeyForTree(node.children, types, key, value)
    }
  })
  return nodes
}

/**
 * @description: 树形结构查找删除
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} deleteKey  键值
 */
export function deleteNodeByKey(tree, deleteKey) {
  // 遍历当前节点的所有子节点
  tree.forEach((node, index, arr) => {
    // 如果找到了匹配的key，则删除该节点
    if (node.key === deleteKey) {
      arr.splice(index, 1)
    } else if (node.children && node.children.length > 0) {
      // 如果当前节点有子节点，则递归调用deleteNodeByKey
      deleteNodeByKey(node.children, deleteKey)
    }
  })
  return tree
}

/**
 * @description: 树形结构查找, 根据type查找键值
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} type 类型
 * @param {string} key 键值
 * @param {Array} lists 集合
 */
export function findListsWithType(tree, type, key, lists = []) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    if (node.type === type) {
      lists.push(node[key])
    }
    // 如果当前节点有子节点，则递归调用findNamesWithType
    if (node.children && node.children.length > 0) {
      findListsWithType(node.children, type, key, lists)
    }
  })
  // 返回包含所有匹配数组
  return lists
}

/**
 * @description: 树形结构查找, 根据checked查找键值
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} type 类型
 * @param {string} key 键值
 * @param {Array} lists 集合
 */
export function findKeysByVal(tree, key, val, lists = []) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    if (node[key] === val) {
      lists.push(node.key)
    }
    if (node.children && node.children.length > 0) {
      findKeysByVal(node.children, key, val, lists)
    }
  })
  // 返回包含所有匹配数组
  return lists
}

/**
 * @description: 设置值
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} key 键值
 */
export function setKeysByVal(tree, key, val) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    node[key] = val
    if (node.children && node.children.length > 0) {
      setKeysByVal(node.children, key, val)
    }
  })
}

/**
 * @description: 树形结构查找, 根据type查找节点集合
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} type 类型
 * @param {Array} lists 集合
 */
export function findNodeListsWithType(tree, type, lists = []) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    if (node.type === type) {
      lists.push(node)
    }
    // 如果当前节点有子节点，则递归调用
    if (node.children && node.children.length > 0) {
      findNodeListsWithType(node.children, type, lists)
    }
  })
  // 返回包含所有匹配数组
  return lists
}
// 过略删除无用children的节点， 通过type过滤
export function findAreaListsWithType(tree, type) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    if (node.type === type) {
      if (node.children && (node.children[0]?.type !== type || node.children.length === 0)) {
        node.children = null
      }
    }
    // 如果当前节点有子节点，则递归调用
    if (node.children && node.children.length > 0) {
      findAreaListsWithType(node.children, type)
    }
  })
  // 返回包含所有匹配数组
  return tree
}
/**
 * @description: 树形结构查找, 根据type，名称 查找节点集合
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} type 类型
 * @param {string} key 名称
 * @param {Array} lists 集合
 */
export function findNodeListsWithTypeKey(tree, type, key, lists = []) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    if (node.type === type && node.key === key) {
      lists.push(node)
    }
    // 如果当前节点有子节点，则递归调用
    if (node.children && node.children.length > 0) {
      findNodeListsWithTypeKey(node.children, type, key, lists)
    }
  })
  // 返回包含所有匹配数组
  return lists
}

/**
 * @description: 数据间隔渲染
 * @param {*} data 元数据
 * @param {*} count 间隔
 * @param {*} callback 回调函数
 * @return {*}
 */
export function renderEveryItem(data, callback, count = 20) {
  const list = []
  data.forEach((item, index) => {
    // 检查索引
    if (index % count === 0) {
      callback(item)
      list.push(item)
    }
  })
  if (data?.length % count !== 0) {
    callback(data[data.length - 1])
    list.push(data[data.length - 1])
  }
  return list
}
// 渲染逻辑
export function renderWithInterval(data, callback, interval = 20) {
  // 渲染首部的数据
  if (data.length > 0) {
    callback(data.slice(0, 1)) // 假设首部只渲染第一个元素
  }

  // 计算需要渲染的中间段数量
  const middleSections = Math.floor((data.length - 1) / interval) // 减去首部已渲染的一个元素

  // 遍历并渲染中间的数据段
  for (let i = 0; i < middleSections; i++) {
    const startIndex = 1 + i * interval // 跳过首部已渲染的元素
    const endIndex = startIndex + interval - 1
    callback(data.slice(startIndex, endIndex + 1))
  }

  // 渲染尾部的数据（这里假设尾部渲染最后一个元素）
  if (data.length > 0) {
    callback(data.slice(-1)) // 尾部只渲染最后一个元素
  }
}
/**
 * @description: 递归获取所有节点的 key
 * @param {*} nodes 节点数组
 * @param {*} key   键值
 * @param {*} keys   集合
 * @return {*}
 */
export function getAllKeys(nodes, key, keys = []) {
  nodes.forEach((node) => {
    keys.push(node[key])
    if (node.children && node.children.length) {
      getAllKeys(node.children, key, keys)
    }
  })
  return keys
}

export function sortTreeByTypeAndName(tree, targetType) {
  // 首先，对根节点数组进行过滤和排序（如果需要的话）
  if (Array.isArray(tree)) {
    tree.forEach((node) => {
      sortNodeByTypeAndName(node, targetType)
    })
  } else {
    // 如果不是数组，则假设tree是单个节点，直接进行排序
    sortNodeByTypeAndName(tree, targetType)
  }

  function sortNodeByTypeAndName(node, targetType) {
    // 检查当前节点是否需要排序
    if (node.type === targetType && node.children && node.children.length > 0) {
      // 仅当节点有children且类型为targetType时才进行排序
      node.children.sort((a, b) => {
        return sortPileNumber(a.name, b.name)
      })
    }

    // 递归处理子节点
    if (node.children) {
      node.children.forEach((child) => {
        sortNodeByTypeAndName(child, targetType)
      })
    }
  }
}

// 二维数组取最大值
export function findMaxSubarray(arrays, index) {
  const maxInfo = arrays.reduce(
    (acc, current) => {
      if (current[index] > acc.max) {
        return { max: current[index], subarray: current }
      }
      return acc
    },
    { max: -Infinity, subarray: null }
  )
  return maxInfo.subarray
}

export function findMinSubarray(arrays, index) {
  const minInfo = arrays.reduce(
    (acc, current) => {
      if (current[index] < acc.min) {
        return { min: current[index], subarray: current }
      }
      return acc
    },
    { min: Infinity, subarray: null }
  )
  return minInfo.subarray
}

// 通过 checked过滤属形结构

export function filterCheckedNodes(nodes) {
  let list = nodes
  if (typeof nodes !== 'object' || !Array.isArray(nodes)) {
    list = [nodes]
  }
  return list.reduce((acc, node) => {
    if (node.checked) {
      // 如果当前节点被选中，则添加它（包括其所有子节点，无论子节点的checked状态如何）
      const newNode = { ...node } // 浅拷贝当前节点
      if (newNode.children && newNode.children.length > 0) {
        // 递归过滤子节点
        newNode.children = filterCheckedNodes(newNode.children)
      }
      acc.push(newNode)
    } else if (node.children && node.children.length > 0) {
      // 如果当前节点未被选中，但可能有子节点被选中，则递归过滤子节点
      const filteredChildren = filterCheckedNodes(node.children)
      if (filteredChildren.length > 0) {
        // 如果子节点中有被选中的，则只添加这些被选中的子节点（不添加当前节点）
        acc.push(...filteredChildren)
      }
    }
    // 如果没有添加任何内容到acc，则不执行任何操作（即不添加当前节点）
    return acc
  }, [])
}

export function collectNonLeafKeys(nodes, result = []) {
  nodes.forEach((node) => {
    // 如果当前节点有子节点，说明它是非叶子节点，将其key添加到结果数组中
    if (node.children && node.children.length > 0) {
      result.push(node.key)
      // 递归检查子节点
      collectNonLeafKeys(node.children, result)
    }
  })
  // 注意：这里不需要对叶子节点做特别处理，因为它们会被自动忽略

  return result
}

/**
 * @description: 设置checked值
 * @author: 吕宗军
 * @param {string} tree 节点数组
 * @param {string} keys 键值集合
 */
export function setCheckedByKeys(tree, keys) {
  // 遍历当前节点的所有子节点
  tree.forEach((node) => {
    if (keys.includes(node.key)) {
      node.checked = true
    } else {
      node.checked = false
    }
    if (node.children && node.children.length > 0) {
      setCheckedByKeys(node.children, keys)
    }
  })
  return tree
}

// 实现复制功能
export function copyToClipboard(text) {
  // 创建一个隐藏的输入框
  const input = document.createElement('input')
  input.value = text
  document.body.appendChild(input)
  input.select()
  input.setSelectionRange(0, 99999) // 对于移动设备
  document.execCommand('copy')
  document.body.removeChild(input)
}
// 替换树id
export function replaceIdsByNames(tree, parentId, newTree) {
  tree.forEach((node) => {
    const newNode = newTree.find((n) => {
      // 土石分界不能用resourceKey判断
      if (n.resource && n.resource.tag) {
        return n.name === node.name && n.resource.tag === node.resource.tag
      } else if (n.resource && n.name !== '土石分界') {
        return n.resource?.resourceKey === node?.resource?.resourceKey
      } else {
        return n.name === node.name
      }
    })
    if (newNode) {
      node.id = newNode.id
      node.fullId = newNode.fullId
      node.parentId = parentId
      node.resource = newNode.resource
      if (node.children && node.children.length > 0) {
        replaceIdsByNames(node.children, newNode.id, newNode?.children || [])
      }
    }
  })
}
export function calculateAngleBetweenPoints(p1, p2) {
  // 提取坐标
  const x1 = +p1[0]
  const y1 = +p1[1]
  const x2 = +p2[0]
  const y2 = +p2[1]

  const angleRadians = Math.atan(Math.abs(y2 - y1) / Math.abs(x2 - x1))
  return angleRadians // 返回弧度值
}

function rotateAroundZAxis(point, angle, isRight) {
  // 旋转矩阵绕Z轴
  const cosTheta = Math.cos(angle)
  const sinTheta = Math.sin(angle)
  // 点坐标
  const x = point[0]
  const y = point[1]
  const z = point[2]

  // 应用旋转矩阵
  const newX = isRight ? cosTheta * x + sinTheta * y : cosTheta * x - sinTheta * y
  // const newY = rotationMatrix[1][0] * x + rotationMatrix[1][1] * y + rotationMatrix[1][2] * z
  // const newZ = rotationMatrix[2][0] * x + rotationMatrix[2][1] * y + rotationMatrix[2][2] * z

  // 返回新坐标
  return [Math.abs(newX), z]
}
export function calculateAngleRight(p1, p2) {
  // 提取坐标
  const x1 = +p1[0]
  const y1 = +p1[1]
  const x2 = +p2[0]
  const y2 = +p2[1]
  return (y2 - y1) * (x2 - x1) > 0
}
// 平移坐标系，得到新坐标
export function translateCoordinates(pointsArr, angle, isRight) {
  // 步骤3: 平移点集
  const newPoints = pointsArr.map((point) => {
    return rotateAroundZAxis(point, angle, isRight)
  })
  return newPoints
}

// 根据key查找父级
export function findParentByKey(tree, value, parent = null) {
  // 检查当前节点是否匹配
  if (tree.key === value) {
    return parent // 找到匹配的节点，返回其父级
  }

  // 如果当前节点有子节点，递归检查每个子节点
  if (tree.children) {
    for (const child of tree.children) {
      const foundParent = findParentByKey(child, value, tree) // 传递当前节点作为父级
      if (foundParent) {
        return foundParent // 如果在子节点中找到匹配的节点，返回其父级
      }
    }
  }

  // 如果当前节点和子节点都不匹配，返回null
  return null
}
// 解析obj文件
function parseOBJ(data) {
  const vertices = []
  const faces = []

  const lines = data.split('\n')
  lines.forEach(function (line) {
    const parts = line.trim().split(' ')
    switch (parts[0]) {
      case 'v':
        vertices.push(
          parts.slice(1).map(function (x) {
            return parseFloat(x)
          })
        )
        break
      case 'f':
        faces.push(
          parts.slice(1).map(function (face) {
            const f = face.split('/')
            return parseInt(f[0]) - 1
          })
        )
        break
      default:
        // Ignore other lines
        break
    }
  })
  // 映射数据
  const newData = []
  faces.forEach((it) => {
    const temp = []
    it.forEach((itx) => {
      temp.push(vertices[itx])
    })
    const tempMap = temp.map((mp) => {
      return {
        lon: mp[0],
        lat: mp[1],
        alt: mp[2]
      }
    })
    newData.push(tempMap)
  })
  return newData
}
export function readOBJFile(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result
      const obj = parseOBJ(text)
      resolve(obj)
    }
    reader.onerror = reject
    reader.readAsText(blob)
  })
}
export async function loadOBJFile(url) {
  const blob = await fetch(url).then((response) => {
    return response.blob()
  })
  return readOBJFile(blob)
}

export function findNodeByKey(tree, key) {
  for (const node of tree) {
    if (node?.resource?.resourceKey === key) {
      return node
    }
    if (node.children) {
      const no = findNodeByKey(node.children, key)
      if (no) return no
    }
  }
  return null
}

// 读取土石分界文件数目
export function readTxtFileCount(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result || ''
      const lines = text.split('\n')
      const count = lines?.length || 0
      resolve(count)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// 判断点在不在区域内
export function isPointInPolygonHandle(point, vs) {
  let j = vs.length - 1
  let oddNodes = false

  for (let i = 0; i < vs.length; i++) {
    if (
      ((vs[i].y < point.y && vs[j].y >= point.y) || (vs[j].y < point.y && vs[i].y >= point.y)) &&
      point.x <= ((vs[j].x - vs[i].x) * (point.y - vs[i].y)) / (vs[j].y - vs[i].y) + vs[i].x
    ) {
      oddNodes = !oddNodes
    }
    j = i
  }
  // console.log('oddNodes', oddNodes)
  return oddNodes
}

// 桩号排序计算算法函数
export function sortPileNumber(str1, str2) {
  const match1 = str1.match(/(\d+)([-+]?)((\d+(\.\d+)?)?)/)
  const match2 = str2.match(/(\d+)([-+]?)((\d+(\.\d+)?)?)/)
  // 如果找到了匹配的数字和操作符
  if (match1 && match2) {
    // 将两个数字字符串转换为整数
    const num11 = Number(match1[1])
    const num21 = Number(match2[1])
    const op1 = match1[2] || '+'
    const op2 = match2[2] || '+'
    const num12 = op1 === '+' ? Number(match1[3]) : -Number(match1[3])
    const num22 = op2 === '+' ? Number(match2[3]) : -Number(match2[3])
    // 根据操作符计算结果
    let result
    if (num11 === num21) {
      result = num12 - num22
    } else {
      result = num11 - num21
    }
    return result
  } else {
    return 0
  }
}

// 区域多层拍平
export function flatMultiLayerArea(arr, types = [], list = []) {
  arr.forEach((item) => {
    if (types.includes(item.type)) {
      if (item.children && item.children.length > 0 && types.includes(item.children[0].type)) {
        flatMultiLayerArea(item.children, types, list)
      } else {
        list.push(item)
      }
    }
  })
  return list
}
// 截图 返回file
export function createSnapshot(id) {
  return new Promise((resolve, reject) => {
    html2canvas(document.getElementById(id)).then((canvas) => {
      const dataURL = canvas.toDataURL('image/png')
      const blob = dataURLtoBlob(dataURL)
      const file = new File([blob], 'snapshot.png', { type: 'image/png' })
      resolve(file)
    })
  })
}
// 转blob
function dataURLtoBlob(url) {
  const arr = url.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
