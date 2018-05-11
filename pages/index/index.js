// index.js
// 获取应用实例
import { getCurrentPosition, getGuidePath } from '../../utils/map'
import api from '../../utils/api'
import wxex from '../../utils/wxex'
const SIDEBAR_WIDTH  = 554
Page({
  data: {
    trashcanList: [
      {
        name: '垃圾桶A',
        status: 0, //0 正常，1，故障，2 缺纸
        residue: 0 ,//剩余容量 0 空，1，2 ，3
        longitude: 113.377650,
        latitude: 23.132730, // 乐天大厦
        trashList: [
          {
            type: 0,
            persent: 0.3
          },
          {
            type: 1,
            persent: 0.4
          },
          {
            type: 2,
            persent: 0.5
          }
        ],
        message: 'A筒故障A筒故障A筒故障A筒故障A筒故障A筒故障A筒故障A筒故障A筒故障'
      },
      {
        name: '垃圾桶BB',
        status: 1, //0 正常，1，故障，2 缺纸
        residue: 2,//剩余容量 0 空，1，2 ，3
        longitude: 113.338500,
        latitude: 23.135070,
        trashList: [
          {
            type: 1,
            persent: 0.3
          },
          {
            type: 2,
            persent: 0.9
          }
        ],
        message: 'B筒缺纸B筒缺纸B筒缺纸B筒缺纸B筒缺纸B筒缺纸B筒缺纸B筒缺纸B筒缺纸B筒缺纸'
      }

    ],
    trashIndex: 0,
    isPopShow: false
  },

  onLoad(e) {
    
    getCurrentPosition().then(({ longitude, latitude }) => {
      this.setData({ currentPosition: { longitude, latitude } })
      this._markCurrentPosition({ longitude, latitude })
      //垃圾桶的位置
      this._mark(this.data.trashcanList)
    }).catch(err => {
      let pattern = /getLocation:fail auth deny/
      this._requestPermission()
      if(pattern.test(err.errMsg)){
        //用户拒绝
        
      }else{
        //获取失败
      }
    })
  },
  _requestPermission(){
    wx.showModal({
      title: '获取用户位置',
      content: '云筒需要获取你的位置才能都正常使用',
      success: ({confirm, cancel}) => {
        if(confirm){
          wx.openSetting()
        }
      }
    })
  },
  onReady(e){
    this.map = wx.createMapContext('map')
  },

  popupMaskTap(e){
    this.setData({ isPopShow: false })
  },
  memberTap(e){
    this.$route('/pages/member/member')
  },
  saomaTap(e){
    wx.scanCode({
      success: (res) => {
        
        console.log('saoma res',res)
        if(/ok/.test(res.errMsg)){
          //扫码成功
          api.getTrashDataFromQurcode(res.result)
            .then((res) => {
              console.log('trash data',res)
              let key = 'scanTrashQurcode'
              wxex.set(key, res)
              this.$route(`/pages/trash-scan/trash-scan?wxex=${key}`)
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
  gotoTrashDetail(e){
    this.$route('/pages/trash-detail/trash-detail')
  },
  pathTap(e){
    let { currentPosition , trashcanList, trashIndex} = this.data
    let trash = trashcanList[trashIndex]
    //路径规划
    this._markPath(currentPosition, {longitude: trash.longitude,latitude: trash.latitude} )
    this.setData({ isPopShow: false })
  },
  mapMarkerTap(e){
    let markerId = e.markerId,
      index = markerId - 1
    if(index < 0) return 
    this.setData({
      trashIndex: index,
      isPopShow: true
    })
      
  },
  _markCurrentPosition({longitude, latitude}){
    this.setData({
      positionMarkes: [{longitude,latitude}]
    })
  },
  includePoints(point1,point2){
    this.map.includePoints({
      points:[point1,point2],
      padding: [10]
    })
  },
  _markPath(origin, destination){
    let o = `${origin.longitude},${origin.latitude}`,
    d = `${destination.longitude},${destination.latitude}`
    getGuidePath(o, d)
      .then((points, distance, cost) => {
        this.setData({ 
          polyline: [{
            points: points.points,
            color: "#3883fa",
            width: 4,
            arrowLine: true
          }]
        })

        //缩放视野
        this.includePoints(origin, destination)
      })
  },
  /*在地图上标出坐标点 */
  /**
   * 
   * @param {Array} markes 
   * @param {Boolean} reset //是否重设
   */
  _mark(markes, reset = false){
    let _markes = this.data.positionMarkes || []
    let m = markes.map(item => {
      return {
        longitude: item.longitude,
        latitude: item.latitude,
        iconPath: this._getTrashIconPath(item.residue),
        width: 50,
        height: 50
      }
    })

    if (reset) _markes = _markes.slice(0,1).concat(m) // 第一个点是当前位置
    else _markes = _markes.concat(m)

    _markes = _markes.map((item, index) => {
      item.id = index
      return item
    })

    /*将垃圾桶绘制到地图上 */
    this.setData({
      positionMarkes: _markes
    })
  },
  /*得到垃圾桶的图标路径 */
  _getTrashIconPath(residue){
    switch(residue){
      case 0: 
        return './images/btu_ljt0@3x.png' // 空垃圾桶
      case 1:
        return './images/btu_ljt-1@3x.png'
      case 2:
        return './images/btu_ljt-2@3x.png'
      case 3:
        return './images/btu_ljt3@2x.png'
      default: 
        return ''
    }
  }
})
