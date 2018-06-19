<template>
  <div id="app">
    <div class="container">
      <div class="writing-wrap">
        <img src="./assets/kuan.jpg" alt="" style="display: none;">
        <img src="./assets/shu.jpg" alt="" style="display: none;">
        <div class="img-wrap">
          <canvas id="myCanvas" width="1000" height="750"></canvas>
        </div>
        <div class="control-wrap">
          <a href="#none" target="_self" @click="onClickMoveBtn">拖动</a>
          <a href="#none" target="_self" @click="onClickPenBtn">画笔</a>
          <a href="#none" target="_self" @click="onClickEraserBtn">橡皮</a>
          <a href="#none" target="_self" @click="onClickRotationBtn">旋转</a>
          <a href="#none" target="_self" @click="onClickResetBtn">重置</a>
          <a href="#none" target="_self" @click="onClickBigBtn">放大</a>
          <a href="#none" target="_self" @click="onClickSmallBtn">缩小</a>
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
export default {
  name: 'app',
  data() {
    return {
      imgW: 0,
      imgH: 0,
      mode: mode.MOVE,
      rotation: 0, // 0 90 180 270 360
    }
  },
  mounted() {
    this.myCanvas = new fabric.Canvas('myCanvas')
    var fabricImg = null
    var img = new Image()
    // img.src = 'http://test-ic-static.vipkid.com.cn/course/material/DEMO1-U1-LC1-L2/5827cbca05bdb0dcdf20b8d6b261ec34.jpg'
    // img.src = './dist/kuan.jpg'
    img.src = './dist/shu.jpg'
    img.crossOrigin = 'anonymous'
    img.addEventListener('load', () => {
      console.log('img wh', img.width, img.height)
      fabricImg = new fabric.Image(img, {width: img.width, height: img.height, crossOrigin: 'anonymous'})
      fabricImg.crossOrigin = 'anonymous'
      this.myCanvas.add(fabricImg)
      let suoFangBiLi = this.coumputeWH(img.width, img.height)
      console.log('zsf suoFangBiLi', suoFangBiLi)
      fabricImg.scaleX = suoFangBiLi
      fabricImg.scaleY = suoFangBiLi
      this.myCanvas.renderAll()
    })
  },
  methods: {
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
    onClickMoveBtn() {
      this.mode = mode.MOVE
    },
    onClickPenBtn() {
      this.mode = mode.PEN
    },
    onClickEraserBtn() {
      this.mode = mode.ERASER
    },
    onClickRotationBtn() {
      this.rotation += 90
    },
    onClickResetBtn() {

    },
    onClickBigBtn() {

    },
    onClickSmallBtn() {

    },
    onClickPrevBtn() {

    },
    onClickNextBtn() {

    },
    onClickHideBtn() {

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
