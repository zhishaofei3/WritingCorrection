import {isNumber, filter, map, isFinite, isNaN} from 'lodash'

export function getPathStr(pathShape) {
  var pathData = pathShape.path || []
  var len = pathData.length
  var p1 = null
  var p2 = null
  var pathArr = filter(pathData, function (item, index) {
    if (index === 0 || index === len - 1) {
      return true
    } else if (index === 1) {
      p1 = item
      return true
    } else if (index === 2) {
      p2 = item
      return true
    }

    var saved = checkCurVature(p1, p2, item)

    if (saved) {
      p1 = p2
      p2 = item
    }
    return saved
  })

  pathArr = map(pathArr, function (item, index) {
    return item.map(function (subItem) {
      if (isNumber(subItem)) {
        return Math.round(subItem)
      }
      return subItem
    })
  })

  len = pathArr.length
  pathArr = filter(pathArr, function (item, index) {
    if (index === 0 || index === len - 1) {
      return true
    }
    return index % 2 === 0
  })

  return pathArr.join(' ').replace(/,/g, ' ')
}

function checkCurVature(qPoint1, qPoint2, qPoint3) {
  // 贝塞尔曲线起点与终点的曲率
  var c1 = (qPoint2[2] - qPoint1[4]) / (qPoint2[1] - qPoint1[3])
  var c2 = (qPoint3[2] - qPoint2[4]) / (qPoint3[1] - qPoint2[3])
  var ac1 = Math.abs(c1)
  var ac2 = Math.abs(c2)
  var min = Math.max(ac2, ac1)

  if (!isFinite(c1)) {
    return true
  }

  if (!isFinite(c2)) {
    if ((Math.abs(qPoint3[2] - qPoint2[2]) <= 2)) {
      return false
    }

    return true
  }

  var result = Math.abs(c2 - c1) / min

  if (isNaN(result)) {
    return false
  }

  return result > 0.12
}


export function get259Angle(angle) {
  if (angle < 0) {
    return angle % 360 + 360
  } else {
    return angle % 360
  }
}

export function isPC() {
  return !((/(iphone|ipod|ipad|android|ios|symbianos)/i).test(window.navigator.userAgent))
}
