
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
        title: 'authority',
        content: 'i-cloud needs your profile information',
        showCancel: false,
        confirmText: 'ok'
      })
    }
    
  }
  
})