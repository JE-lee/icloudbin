
Page({

  data: {
  
  },


  onLoad: function (options) {
  
  },
  getAuthorize(e){
    if(e.detail.userInfo){
      this.$route(`/pages/index/index`,'redirect')
    }else{
      wx.showModal({
        title: '授权',
        content: '云筒需要您的昵称头像信息才能正常使用',
        showCancel: false
      })
    }
    
  }
  
})