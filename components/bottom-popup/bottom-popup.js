Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
      observer: function(n) {
        this.setData({ _visible: n })
      }
    },
    position: {
      type: String,
      value: 'bottom' // center: 内容区在屏幕中间
    }
  },

  data: {
    _visible: false
  },

  methods: {
    hide() {
      this.setData({ _visible: false })
      this.triggerEvent('update:visible', { visible: false })
    }
  }
})