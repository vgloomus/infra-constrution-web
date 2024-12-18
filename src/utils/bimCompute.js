/*
 * @Author: lvzj lvzj@glodon.com
 * @Date: 2024-09-04 08:51:17
 * @LastEditors: lvzj lvzj@glodon.com
 * @LastEditTime: 2024-10-11 15:51:39
 * @FilePath: \plan-modeling-webe:\glodon\infra-construction-web\src\utils\bimCompute.js
 * @Description: bim计算函数
 *
 */

function normalizeVector(vector) {
  // vector 是一个包含 x 和 y 属性的对象，例如 {x: number, y: number}

  // 计算向量的模（长度）
  const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y)

  // 如果向量的模为0，则不能进行归一化（除以0是未定义的）
  if (magnitude === 0) {
    return { x: 0, y: 0 }
  }

  // 归一化向量
  const normalizedVector = {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  }

  return normalizedVector
}
function getPerpendicularVector(p1, p2) {
  // p1 和 p2 是线段的两个点，它们都是 {x: number, y: number} 形式的对象
  const deltaX = p2.x - p1.x
  const deltaY = p2.y - p1.y

  // 计算垂直向量
  const perpendicularVector = {
    x: -deltaY,
    y: deltaX
  }

  return normalizeVector(perpendicularVector)
}

function calculateClockwiseAngleBetweenVectors(v1, v2) {
  // 计算两个向量的点积
  const dotProduct = v1.x * v2.x + v1.y * v2.y

  // 计算两个向量的模
  const magnitudeV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
  const magnitudeV2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)

  // 计算余弦值
  const cosineAngle = dotProduct / (magnitudeV1 * magnitudeV2)

  // 使用 Math.acos() 计算逆时针夹角的弧度值
  const angleInRadians = Math.acos(cosineAngle)

  // 转换为顺时针夹角（从2π减去逆时针夹角）
  const clockwiseAngleInRadians = 2 * Math.PI - angleInRadians

  // 将弧度转换为度
  // const clockwiseAngleInDegrees = clockwiseAngleInRadians * (180 / Math.PI);

  return v2.x > 0 ? 2 * Math.PI - clockwiseAngleInRadians : clockwiseAngleInRadians
}

/**
 * @description: 计算两个点之间的垂直向量
 * @author: 吕宗军
 * @param {Array} tempPoints 节点数组
 */
export function verticalForce(tempPoints) {
  const distanceToDegreeRate = 1 / (111 * 1000)
  const cameraDistance = 200
  const cameraAltDistance = 100
  const pitchAngle = Math.atan(cameraAltDistance / cameraDistance)
  // tempPoints.sort((a, b) => {
  //   return b.lat - a.lat
  // })
  const vec = getPerpendicularVector({ y: tempPoints[0].lat, x: tempPoints[0].lon }, { y: tempPoints[1].lat, x: tempPoints[1].lon })

  const center = { lon: (tempPoints[0].lon + tempPoints[1].lon) / 2, lat: (tempPoints[0].lat + tempPoints[1].lat) / 2 }

  const ps = [
    { lon: cameraDistance * distanceToDegreeRate * vec.x + center.lon, lat: cameraDistance * distanceToDegreeRate * vec.y + center.lat },
    { lon: cameraDistance * distanceToDegreeRate * -vec.x + center.lon, lat: cameraDistance * distanceToDegreeRate * -vec.y + center.lat }
  ]
  // let ps = orthogonalPoints(, tempPoints[1].lat, tempPoints[1].lon)
  const len = ps.length
  for (let i = 0; i < len; i++) {
    const p = ps[i]
    p.alt = tempPoints[0].alt
  }

  ps[0].alt += cameraAltDistance
  const targetToCameraVec = normalizeVector({ x: center.lon - ps[0].lon, y: center.lat - ps[0].lat })

  // console.log('camera vector')
  // console.log(targetToCameraVec)
  // 计算偏航角
  const cameraStatus = {
    orientation: {
      pitch: -pitchAngle,
      yaw: calculateClockwiseAngleBetweenVectors({ x: 0, y: 1 }, targetToCameraVec),
      // "yaw": Math.PI * ++m / 2,

      roll: 0
    },
    position: ps[0]
  }

  return cameraStatus
}

// 计算平均经度
function getLongitude(line) {
  let sum = 0
  for (let i = 0; i < line.length; i++) {
    sum += line[i][1] // 索引1代表经度
  }
  return sum / line.length
}

// 计算GIS坐标之间的距离
function calLatitudeLongitudeDist(point1, point2, longitude) {
  return Math.sqrt(((point1[0] - point2[0]) * Math.cos(longitude)) ** 2 + (point1[1] - point2[1]) ** 2)
}

// 返回离给定点最近的两个点
function getNearestPoint(point, line, longitude) {
  const distances = []
  for (let i = 0; i < line.length; i++) {
    const dist = calLatitudeLongitudeDist(point, line[i].slice(0, 3), longitude)
    distances.push({ index: i, value: dist })
  }
  distances.sort((a, b) => a.value - b.value)
  const minThreeDistances = distances.slice(0, 3) // 获取最小的三个距离
  minThreeDistances.sort((a, b) => a.value - b.value)
  return [line[minThreeDistances[0].index].slice(0, 3), line[minThreeDistances[2].index].slice(0, 3)]
}

// 使用双线性插值法计算中心点的高度
function bilinearInterpolate(pointA, pointB, pointC, longitude) {
  const distanceAB = calLatitudeLongitudeDist(pointA, pointB, longitude)
  const distanceAC = calLatitudeLongitudeDist(pointA, pointC, longitude)
  const zA = pointA[2]
  const zB = pointB[2]
  const zC = zA + (zB - zA) * (distanceAC / distanceAB)
  return zC
}

// 主函数，执行插值计算
export function elevationInterpolation(line, point) {
  const longitude = getLongitude(line)
  const [point1, point2] = getNearestPoint(point, line, longitude)
  const zC = bilinearInterpolate(point1, point2, point, longitude)
  return [point[0], point[1], zC]
}
