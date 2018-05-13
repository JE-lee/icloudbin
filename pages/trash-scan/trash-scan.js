// pages/trash-scan/trash-scan.js
import wxex from '../../utils/wxex'
import { fmtDate } from '../../utils/time'
import api from '../../utils/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trash: {},
    imageList: [],
    isReScan : false
  },

  deductTap(e){
    this.$route(`/pages/deduct/deduct?wxex=${this.__query.wxex}`)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let key = options.wxex,
      trash = wxex.get(key)
    trash.result.createtime = fmtDate(trash.result.createtime*1000)
    this.setData({ trash, deductItem: trash.recycleRule[0] })
    //deduct 时间监听
    this.$addListener('deduct',(item) => {
      this.setData({ 
        deductItem: item
       })
    })
  },
  uploadImage(e){
    let url = e.detail.url
    let list = this.data.imageList
    list.push(url)
    this.setData({ imageList: list})
  },
  deleteImage(e){
    let url = e.detail.url
    let list = this.data.imageList
    let index = list.findIndex(item => item == url)
    if(index != -1){
      list.splice(index, 1)
      this.setData({ imageList: list})
    }
  },
  //重新扫描
  reScan(e){
    wx.scanCode({
      success: (res) => {
        if(/ok/.test(res.errMsg)){
          //扫码成功
          api.getTrashDataFromQurcode(res.result)
            .then((res) => {
              let trash = res
              trash.result.createtime = fmtDate(trash.result.createtime*1000)
              this.setData({ 
                trash,
                imageList: [],
                isReScan: !this.data.isReScan
               })
            }).catch((err) =>{
              wx.showModal({
                title: '扫描二维码',
                content: err
              })
            })
        }
      }
    })
  },
  sure(e){
    let { trash, imageList, deductItem} = this.data ,
      data = {
        uid: trash.result.uid,
        recycle_rule_uid: deductItem.uid,
        trash_sn: trash.result.trash_sn,
        image: imageList.join(',')
      }
    api.postTrashInfo(data)
      .then((res) => {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        })
        wx.navigateBack()
      }).catch(err => {
        wx.showModal({
          title: '入站',
          content: err
        })
      })
  },

  formateDate(timestamp){
    return fmtDate(timestamp)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})