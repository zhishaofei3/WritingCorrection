<template>
  <div id="app">
    <div class="container">
      <div class="writing-wrap">
        <img src="./assets/kuan.jpg" alt="" style="display: none;">
        <img src="./assets/shu.jpg" alt="" style="display: none;">
        <img src="./assets/QQ20180619-122931.png" alt="" style="display: none;">
        <div class="img-wrap">
          <canvas id="myCanvas" width="1000" height="750"></canvas>
        </div>
        <div class="control-wrap">
          <a href="#none" target="_self" @click="onClickMoveBtn">拖动</a>
          <a href="#none" target="_self" @click="onClickPenBtn">画笔</a>
          <a href="#none" target="_self" @click="onClickEraserBtn">橡皮</a>
          <a href="#none" target="_self" @click="onClickRotationBtn">旋转</a>
          <a href="#none" target="_self" @click="onClickResetBtn">重置</a>
          <a href="#none" target="_self" @click="onClickZoomInBtn">放大</a>
          <a href="#none" target="_self" @click="onClickZoomOutBtn">缩小</a>
          <a href="#none" target="_self" @click="onClickPrevBtn">上一页</a>
          <span>1/3</span>
          <a href="#" target="#none" @click="onClickNextBtn">下一页</a>
          <a href="#" target="#none" @click="onClickHideBtn">收起</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {fabric} from 'fabric'
import mode from './mode'
import {getPathStr} from './tools'
export default {
  name: 'app',
  data() {
    return {
      imgW: 0,
      imgH: 0,
      mode: mode.MOVE,
      rotation: 0, // 0 90 180 270 360,
      group: null,
      fabricImg: null, // fabric.Image
      zoomArr: [1, 1.15, 1.3 , 1.45, 1.6, 1.75, 1.9, 2.05, 2.2],
      zoomNum: 0,
    }
  },
  mounted() {
    this.myCanvas = new fabric.Canvas('myCanvas')
    this.myCanvas.selection = false
    var img = new Image()
    // img.src = 'http://test-ic-static.vipkid.com.cn/course/material/DEMO1-U1-LC1-L2/5827cbca05bdb0dcdf20b8d6b261ec34.jpg'
    // img.src = './dist/kuan.jpg'
    img.src = './dist/shu.jpg'
    // img.src = './dist/QQ20180619-122931.png'
    img.crossOrigin = 'anonymous'
    img.addEventListener('load', () => {
      console.log('img wh', img.width, img.height)
      this.fabricImg = new fabric.Image(img, {width: img.width, height: img.height, crossOrigin: 'anonymous'})
      this.fabricImg.crossOrigin = 'anonymous'
      let suoFangBiLi = this.coumputeWH(img.width, img.height)
      console.log('zsf suoFangBiLi', suoFangBiLi)
      this.fabricImg.scaleX = suoFangBiLi
      this.fabricImg.scaleY = suoFangBiLi
      this.fabricImg.hoverCursor = 'default'
      this.fabricImg.selectable = false
      this.fabricImg.hasBorders = false
      this.fabricImg.hasControls = false
      this.myCanvas.add(this.fabricImg)
      this.myCanvas.renderAll()
    })
    this.addEvents()
  },
  methods: {
    addEvents() {
      this.myCanvas.on('path:created', opt => {
        var shape = opt.path
        this.myCanvas.remove(shape)
        var path = new fabric.Path(getPathStr(shape), {
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          fill: null,
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth,
          hasControls: false,
          hasBorders: false,
          selectable: false,
        })
        this.myCanvas.add(path)
      })

      this.myCanvas.on('selection:cleared', opt => { // 移动模式不能取消全部选区激活状态 加上边界判断后可以删除
        if (this.mode == mode.MOVE) {
          this.onClickMoveBtn()
        }
      })

      this.myCanvas.on('mouse:wheel', opt => { // 放大后有边框大小没更新问题 待修复
        let curZoom = this.myCanvas.getZoom()
        curZoom += opt.e.deltaY < 0 ? 0.15 : -0.15
        if (curZoom > 2.2) {
          curZoom = 2.2
        } else if (curZoom < 1) {
          curZoom = 1
        }
        this.myCanvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), curZoom)
        opt.e.preventDefault()
        opt.e.stopPropagation()
      })
    },
    coumputeWH(sw, sh) {
      let sourceBili = sh / sw
      let w = 0, h = 0
      if (sourceBili > 3 / 4) { // 大于4:3 按宽算
        w = 1000
        h = w * sourceBili
      } else { // 小于4:3 按高算
        h = 750
        w = h / sourceBili
      }
      return w / sw
    },
    rotate(angle) {
      this.rotation += angle
      if (this.rotation == 360) {
        this.rotation = 0
      }
      this.group = new fabric.Group(this.myCanvas.getObjects())
      this.group.rotate(angle)
      this.myCanvas.centerObject(this.group)
      this.group.setCoords()
      this.group.destroy()
      this.group = null
      this.myCanvas.renderAll()
    },
    onClickMoveBtn() {
      this.destroyGroup()
      this.mode = mode.MOVE
      this.group = new fabric.Group(this.myCanvas.getObjects())
      this.group.setCoords()
      this.group.hasControls = true
      this.group.hasBorders = true
      this.group.selectable = true
      this.myCanvas.setActiveObject(this.group)
      this.myCanvas.renderAll()
      console.log('zsf 走了!')
    },
    onClickPenBtn() {
      this.destroyGroup()
      this.mode = mode.PEN
    },
    onClickEraserBtn() {
      this.destroyGroup()
      this.mode = mode.ERASER
    },
    onClickRotationBtn() {
      this.destroyGroup()
      this.rotate(90)
      this.setMode()
    },
    onClickResetBtn() {
      this.destroyGroup()
      this.rotate(360 - this.rotation)
      this.zoomNum = 0
      this.setZoom()
      let lines = this.getLines()
      lines.forEach(item => {
        this.myCanvas.remove(item)
      })
      console.log(this.fabricImg, this.fabricImg.scaleX, this.fabricImg.scaleY, this.fabricImg.x, this.fabricImg.y)
      this.setMode()
    },
    onClickZoomInBtn() { // 放大 todo 增加mouse wheel放大 http://fabricjs.com/fabric-intro-part-5
      this.zoomNum++
      if (this.zoomNum > this.zoomArr.length - 1) {
        this.zoomNum = this.zoomArr.length - 1
      }
      this.setZoom()
    },
    onClickZoomOutBtn() { // 缩小
      this.zoomNum--
      if (this.zoomNum < 0) {
        this.zoomNum = 0
      }
      this.setZoom()
    },
    onClickPrevBtn() {
      this.destroyGroup()
    },
    onClickNextBtn() {
      this.destroyGroup()
    },
    onClickHideBtn() {
      this.destroyGroup()
    },
    setZoom() {
      this.destroyGroup()
      this.group = new fabric.Group(this.myCanvas.getObjects())
      this.group.setCoords()
      let targetScale = this.getTargetScaleByGroupWH(this.group.width, this.group.height)
      this.group.scale(targetScale)
      this.myCanvas.centerObject(this.group)
      this.myCanvas.renderAll()
      this.setMode()
    },
    destroyGroup() {
      if (this.group) {
        this.myCanvas.discardActiveObject()
        this.group.selectable = false
        this.group.destroy()
        this.group = null
        this.myCanvas.renderAll()
      }
    },
    getLines() {
      let lines = []
      let objs = this.myCanvas.getObjects()
      objs.forEach(item => {
        if (item.type == 'path') {
          lines.push(item)
        }
      })
      return lines
    },
    setMode() {
      if (this.mode == mode.MOVE) {
        this.onClickMoveBtn()
      } else if (this.mode == mode.ERASER) {
        this.onClickEraserBtn()
      } else if (this.mode == mode.PEN) {
        this.onClickPenBtn()
      }
    },
    getTargetScaleByGroupWH(groupW, groupH) { // 宽 也可能是高 看旋转方向而定
      let isCrosswise = this.rotation == 90 || this.rotation == 270 // 横向
      let defaultWH = isCrosswise ? 750 : 1000
      let nowWH = isCrosswise ? groupH : groupW
      let targetZoom = this.zoomArr[this.zoomNum]
      let targetWH = defaultWH * targetZoom
      let targetScale = targetWH / nowWH
      return targetScale
    },
    hi() {
      console.log('app hi')
    },
  },
  watch: {
    mode(val) {
      if (val == mode.PEN) {
        this.myCanvas.isDrawingMode = true
      } else {
        console.log('zsf 模式变换')
        this.myCanvas.isDrawingMode = false
      }
    }
  }
}
</script>

<style scoped>
ul {
  list-style-type: none;
}

.container {
  width: 1000px;
  height: 750px;
  background-color: #F00;
}

.img-wrap {

}

.img-wrap img {

}
</style>
