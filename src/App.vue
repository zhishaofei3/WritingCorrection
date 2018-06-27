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
          <a href="#none" target="_self" @click="onClickZoomBtn">缩放</a>
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
        zoomArr: [1, 1.15, 1.3, 1.45, 1.6, 1.75, 1.9, 2.05, 2.2],
        zoomNum: 0,
        isKuanTu: true, // 是否是宽图
        isMouseDown: false,
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
        this.fabricImg = new fabric.Image(img, {width: img.width, height: img.height, crossOrigin: 'anonymous'})
        this.fabricImg.crossOrigin = 'anonymous'
        let {suoFangBiLi, isKuanTu} = this.coumputeWH(img.width, img.height)
        this.isKuanTu = isKuanTu
        this.fabricImg.scaleX = suoFangBiLi
        this.fabricImg.scaleY = suoFangBiLi
        this.fabricImg.hoverCursor = 'default'
        this.fabricImg.selectable = false
        this.fabricImg.hasBorders = false
        this.fabricImg.hasControls = false
        this.myCanvas.add(this.fabricImg)
        this.myCanvas.renderAll()
        this.onClickMoveBtn()
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

        fabric.util.addListener(fabric.document, 'mousedown', e => {
          this.isMouseDown = true
        })

        fabric.util.addListener(fabric.document, 'mouseup', e => {
          this.isMouseDown = false
        })

        this.myCanvas.on('mouse:move', opt => {
          if (this.isMouseDown && opt.target && opt.target.path && this.mode == mode.ERASER) { // 橡皮擦线
            this.myCanvas.remove(opt.target)
          }
        })

        this.myCanvas.on('mouse:wheel', opt => {
          this.setZoom(false)
          let e = opt.e
          var delta = e.deltaY  // >0放大 <0缩小
          let yuanXY = {
            x: e.offsetX + Math.abs(this.group.aCoords.tl.x),
            y: e.offsetY + Math.abs(this.group.aCoords.tl.y)
          }
          if (delta < 0) {
            this.zoomNum++
            if (this.zoomNum > this.zoomArr.length - 1) {
              this.zoomNum = this.zoomArr.length - 1
            }
          } else {
            this.zoomNum--
            if (this.zoomNum < 0) {
              this.zoomNum = 0
            }
          }
          let nowScale = this.getGroupScale()
          this.setZoom(false)
          let xianXY = {x: yuanXY.x * nowScale, y: yuanXY.y * nowScale}
          let chaXY = {x: xianXY.x - yuanXY.x, y: xianXY.y - yuanXY.y}
          this.group.set('left', this.group.left - chaXY.x)
          this.group.set('top', this.group.top - chaXY.y)
          this.setZoom(false)
          this.checkAndSetTargetInView(this.group) // 控制图片不超出边界
          this.setZoom(false)
        })
      },
      coumputeWH(sw, sh) {
        let sourceBili = sh / sw
        let w = 0, h = 0
        let isKuanTu = true
        if (sourceBili > 3 / 4) { // 大于4:3 按宽算
          w = 1000
          h = w * sourceBili
          isKuanTu = false
        } else { // 小于4:3 按高算
          h = 750
          w = h / sourceBili
          isKuanTu = true
        }
        return {suoFangBiLi: w / sw, isKuanTu}
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
        this.group.hasControls = true
        this.group.hasBorders = true
        this.group.selectable = true
        this.group.on('moving', opt => { // moving是否会重复侦听?
          this.checkAndSetTargetInView(opt.target) // 控制图片不超出边界
        })
        this.myCanvas.setActiveObject(this.group)
        this.myCanvas.renderAll()
      },
      onClickPenBtn() {
        this.destroyGroup()
        this.mode = mode.PEN
      },
      onClickEraserBtn() {
        this.destroyGroup()
        this.mode = mode.ERASER
      },
      onClickRotationBtn() {//旋转的时候也得计算缩放
        this.destroyGroup()
        this.rotate(90)
        this.setZoom()
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
        this.setMode()
      },
      onClickZoomBtn() {
        this.destroyGroup()
        this.mode = mode.ZOOM
        this.setZoom(false)
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
      setZoom(needCenter = true) {
        this.destroyGroup()
        this.group = new fabric.Group(this.myCanvas.getObjects())
        this.group.hasControls = true
        this.group.hasBorders = true
        this.group.selectable = false
        let targetScale = this.getGroupScale()
        this.group.scale(targetScale)
        if (needCenter) {
          this.myCanvas.centerObject(this.group)
        }
        this.myCanvas.renderAll()
      },
      getGroupScale() {
        this.group.setCoords()
        return this.getTargetScaleByGroupWH(this.group.width, this.group.height)
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
        } else if (this.mode == mode.ZOOM) {
          this.onClickZoomBtn()
        }
      },
      getTargetScaleByGroupWH(groupW, groupH) { // 宽 也可能是高 看旋转方向而定
        let isCrosswise = this.rotation == 90 || this.rotation == 270 // 横向
        if (this.isKuanTu) {
          isCrosswise = !isCrosswise
        }
        let defaultWH = isCrosswise ? 750 : 1000
        let nowWH = isCrosswise ? groupH : groupW
        let targetZoom = this.zoomArr[this.zoomNum]
        let targetWH = defaultWH * targetZoom
        let targetScale = targetWH / nowWH
        return targetScale
      },
      checkAndSetTargetInView(target) {
        target.setCoords()
        if (target.aCoords.tl.x > 0) {
          target.set('left', 0).setCoords()
        }
        if (target.aCoords.br.x < 1000) {
          target.set('left', 1000 - target.width).setCoords()
        }
        if (target.aCoords.tl.y > 0) {
          target.set('top', 0).setCoords()
        }
        if (target.aCoords.br.y < 750) {
          target.set('top', 750 - target.height).setCoords()
        }
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
