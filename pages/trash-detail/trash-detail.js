// pages/trash-detail/trash-detail.js
import api from '../../utils/api'
import { fmtDateV2 } from '../../utils/time';
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
              value: this.getStatusValue(key, item[key]),
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
          content: `获取${name}的详细信息失败`,
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
            i.time = fmtDateV2(i.createtime * 1000)
            // 消息
            i.message = i.message.split(',')
            i.message[2] = '原因：' + i.message[2]
            return i
          })
          return item
         
        })
        this.setData({ historyMsg: list })
      }).catch(err => {
        wx.showModal({
          title: '获取数据',
          content: '获取垃圾桶的历史消息失败',
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
      return '前门传感器'
    case 'door_hall2':
      return '前门2传感器'
    case 'up_door_hall':
      return '顶盖传感器'
    case 'code_hall':
      return '码盘传感器状态'
      case 'atd_hall':
      return '投放口传感器'
      case 'atd_motor':
      return '投放口电机状态'
      case 'comp_motor_reset_hall':
      return '压缩锤复位状态'
      case 'ir_high':
      return '高度红外对射状态'
      case 'uvlamp':
      return '紫外灯状态'
      case 'adb_ox':
      return '广告灯箱状态'

      case 'shake':
      return '连续震动标志'
      case 'smoke':
      return '烟雾报警状态'
      case 'atd_ir':
      return '投放口红外接收状态'
      case 'battery_voltage':
      return '电池电压'
      case 'temperature':
      return '箱体温度（主板箱体)'
      case 'printer_states':
      return '打印机状态'
      case 'printer_count':
      return '打印机次数'
      case 'comp_times':
      return '压缩锤压缩的次数(当天)'
      case 'atd_open_times':
      return '投放口打开次数(当天)'
      case 'trash_weight':
      return '重量'
      default:
      return '无'
    }
    
  },
  getStatusValue(str, v){
    let s = (v == 0) ? '异常' : ((v == 1) ? '正常' : '隐藏')
    if( str == 'temperature'){
      return v + '℃'
    }else if(str == 'battery_voltage'){
      return v + 'V'
    }else if(str == 'trash_weight'){
      return v + 'kg'
    }else {
      return s 
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
});
