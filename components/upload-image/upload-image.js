// components/upload-image/upload-image.js
import api from '../../utils/api'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    reset: {
      type: Boolean,
      value: false,
      observer: function(n,o){
        if(this.isInit){
          this.setData({ imageList: []})
        }
      }
      
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageList: []
  },
  ready(e){
    this.isInit = true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    plusImage(e){
      let src = e.currentTarget.dataset.src
      wx.previewImage({ urls: [src] })
    },
    chooseImage(e){
      wx.chooseImage({
        count: 1,
        success: ({tempFilePaths}) => {
          api.uploadDeductImage(tempFilePaths[0])
            .then((res) => {
              let list = this.data.imageList
              list.unshift({
                imagePath: tempFilePaths[0],
                url: res.url
              })
              this.setData({ imageList: list})
              this.triggerEvent('upload',{url:res.url})
            }).catch(err => {
              wx.showModal({
                title: '上传图片',
                content: '上传失败，请重试'
              })
            })
        }
      })
    },
    delete(e){
      let index = e.currentTarget.dataset.index
      let list = this.data.imageList
      let deleteItem = list.splice(index, 1)
      this.setData({ imageList: list})
      this.triggerEvent('delete',{url:deleteItem[0].url})
    }
  }
})
