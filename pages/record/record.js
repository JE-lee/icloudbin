// pages/record/record.js
import api from '../../utils/api'
import { fmtDate } from '../../utils/time'
import wxex from '../../utils/wxex'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabList: [],
    recordList: [],
    tabShow: false,
    activeIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sn = options.sn
    this.$$sn = sn
    this.loadInfo({sn})

    
  },
  showTab(e){
    this.setData({ tabShow: !this.data.tabShow })
  },
  tabItemTab(e){
    let index = e.currentTarget.dataset.index
    this.setData({ 
      activeIndex: index,
      tabShow: false,
      recordList: []
    })
    let sort = this.data.tabList[index].sort,
      data = { sn: this.$$sn, sort}
    this.loadInfo(data)
  },
  loadInfo({sn, sort }){
    api.getTrashRecord({
      sn,
      sort
    }).then(res => {
      //处理时间
      let list = res.list.map(item => {
        item.time = fmtDate(+item.createtime * 1000)
        let uid = item.uid,
          pattern = /(.*?-.*?-.*?)-.*?/,
          uidstr = uid.match(pattern)
        if(uidstr){
          item.uidstr = uidstr[1]
        }
        return item
      })

      let tabList = res.sort_name
      tabList.unshift({name: 'All'})
      this.setData({
        tabList: res.sort_name,
        recordList: list
      })
    }).catch(err => {
      wx.showModal({
        content: 'Fetch data failed',
        showCancel: false
      })
    })
  },
  _getTrashDataFromQurcode(code){
    api.getTrashDataFromQurcode(code)
      .then(res => {
        //console.log("trash data", res);
        let key = "qurcode";
        wxex.set(key, res);
        this.$route(`/pages/trash-scan/trash-scan?wxex=${key}`);
      })
      .catch(err => {
        wx.showModal({
          content: err || 'Error in qr code data',
          showCancel: false
        });
      });
  },
  gotoDeduct(e){
    let qrcode = e.currentTarget.dataset.qurcode
    this._getTrashDataFromQurcode(qrcode)
  }
})