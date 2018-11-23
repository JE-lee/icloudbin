// pages/member/member.js
import wxex from '../../utils/wxex'
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wxex.get('user.userInfo')
    let key = options.wxex
    let trashList = wxex.get(key).trashList,
      user_info = wxex.get(key).user_info

    this.setData({ userInfo,trashList,user_info })

    this.$addListener('index:info',({trashList,user_info }) => {
      this.setData({trashList,user_info })
    })
    
    
  },
  trashItemTap(e){
    let index = e.currentTarget.dataset.index ,
      sn = this.data.trashList[index].sn
    this.$route(`/pages/trash-detail/trash-detail?sn=${sn}`)
  },
  

  
})