// components/fold/fold.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    isFirstFold: {
      type: Boolean,
      value: true
    }
  },
  data: {
    isFold: false
  },

  attached() {
    this.setData({ isFold: this.properties.isFirstFold })
  },
  methods: {
    pointTap(e) {
      this.setData({ isFold: !this.data.isFold })
    }
  }
})
