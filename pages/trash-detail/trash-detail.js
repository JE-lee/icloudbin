// pages/trash-detail/trash-detail.js
import api from '../../utils/api'
import { fmtDate } from '../../utils/time';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    trashDetail: null,
    historyMsg: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData(options)
    //加载垃圾桶详细数据
    this.loadTrashInfo(options.sn)
    
  },
  loadTrashInfo(sn){
    api.getTrashDetail(sn)
      .then(res => {
        let trashDetail = res.result
        //这里要处理以下status数组
        trashDetail.status = trashDetail.status.map(item => {
          let _list = []
          for(let key in item){
            _list.push({
              key,
              value: item[key],
              type : this.getStatusType(key),
              type_value: this.getStatusValue(key, item[key]),
              show: item[key] != '00'
            })
          }
          return _list
        })

        // 处理count_list数组
        trashDetail.count_list = trashDetail.count_list.map(item => {
          let _list = []
          for(let key in item){
            _list.push({
              key,
              value: item[key],
              type : this.getStatusType(key),
              show: item[key] != '00'
            })
          }
          return _list
        })
        this.setData({trashDetail})
      }).catch(err => {
        let name = this.data.name
        wx.showModal({
          title: name,
          content: `Failed to get details of ${name}`,
          showCancel: false
        })
      })

  },
  loadTrashHistoryMsg(sn){
    api.getTrashHistoryMsg(sn)
      .then(res => {
        let list = res.message_list
        list = list.map(item => {
          item = item.map(i => {
            i.time = fmtDate(i.createtime * 1000)
            return i
          })
          return item
         
        })
        this.setData({ historyMsg: list })
      }).catch(err => {
        wx.showModal({
          title: 'fetching data',
          content: 'Failed to get the history of the trash can',
          showCancel: false
        })
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  tabItemTap(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({ activeIndex: index });
    let {sn, trashDetail,historyMsg} = this.data
    if(index == 0){
      //信息
      if(!trashDetail){
        this.loadTrashInfo(sn)
      }
    }else if(index == 1){
      //历史消息
      if(!historyMsg){
        this.loadTrashHistoryMsg(sn)
      }
    }
  },
  getStatusType: function(str){
    switch(str){
      case 'door_hall':
      return 'fd'
    case 'door_hall2':
      return 'fd II'
    case 'up_door_hall':
      return 'top cap'
    case 'code_hall':
      return 'code disk'
      case 'atd_hall':
      return 'entrance'
      case 'atd_motor':
      return 'motor in entrance'
      case 'comp_motor_reset_hall':
      return 'hammer reset'
      case 'ir_high':
      return 'infrared'
      case 'uvlamp':
      return 'UV lamp'
      case 'adb_ox':
      return 'ad lamp box'

      case 'shake':
      return 'shake'
      case 'smoke':
      return 'smoke'
      case 'atd_ir':
      return 'infrared in entrance'
      case 'battery_voltage':
      return 'battery voltage'
      case 'temperature':
      return 'temperature'
      case 'printer_states':
      return 'printer states'
      case 'printer_count':
      return 'printer count'
      case 'comp_times':
      return 'comp times'
      case 'atd_open_times':
      return 'open times'
      default:
      return 'none'
    }
    
  },
  getStatusValue(str, v){
    let s = (v == 0) ? 'error' : ((v == 1) ? 'normal' : 'hide')
    if( str == 'temperature'){
      return v + '℃'
    }else if(str == 'battery_voltage'){
      return v + 'V'
    }else {
      return s 
    }
  }
});
