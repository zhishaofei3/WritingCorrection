import Vue from 'vue'
import App from './App.vue'

var app = null // app vue组件 用于调用方法

export default class Main {
  constructor(el) {
    const vm = new Vue({
      el,
      mounted() {
        app = this.$refs.app
      },
      render() {
        return <App ref="app"/>
      }
    })
  }

  hi() {
    console.log('zsf hi')
    app.hi()
  }
}
