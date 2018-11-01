// pages/trash-detail/components/progress/progress.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    persent: {
      type: Number,
      value: 0,
      observer: function(n, o){
        this.setData({ width: this.getProgressWidth(n)}) 
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    width: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getProgressWidth: function (persent) {
      return Math.floor(420 * persent)
    }
  }
})
