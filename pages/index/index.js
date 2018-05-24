// index.js
// 获取应用实例
import { getCurrentPosition, getGuidePath } from "../../utils/map";
import api from "../../utils/api";
import wxex from "../../utils/wxex";
import user from "../../utils/user";
import {encryptToken} from "../../utils/encrpt-token";
import { fmtDate } from '../../utils/time'
const SIDEBAR_WIDTH = 554;
Page({
  data: {
    trashList: [],
    trashIndex: 0,
    isPopShow: false
  },

  onLoad(e) {
    this._initCurrentPosition().then(res => {
       //垃圾桶的位置
       //this._mark(this.data.trashList)
    }).catch(err => {
      console.log(err)
    })
    // 获取首页数据
    this._loadIndexInfo()
  },
  _loadIndexInfo(){
    api.getIndexInfo()
      .then(res => {
        let l = res.trash_list
        l = l.map(item => {
          // 计算垃圾桶的百分比
          
          let sort_list = item.sort_list
          let residue = sort_list[0].trash_high
          for(let i =1;i<sort_list.length;i++){
            //residue += (+sort_list[i].trash_high)
            if(sort_list[i].trash_high > residue)
              residue = sort_list[i].trash_high
          }
          item.persent = residue
          //icon图标
          item.trashIcon = this._getTrashIconPath(residue)
          //将最新消息里面的时间格式化
          let list = item.list_message
          list = list.map(item => {
            item.createtime = fmtDate(item.createtime)
            return item
          })
          item.list_message = list
          return item
        })
        res.trash_list = l
        
        this.setData({ 
          trashList: res.trash_list,
          user_info: res.user_info  || {}
        })
        //标记垃圾桶位置
        this._mark(res.trash_list)

      }).catch(err => {
        let content = ''
        let redirect = false
       
        err = JSON.parse(err)
        
        if(/ASK_FOR_LOGIN/.test(err.type)){
          content = '您还不是管理人员'
        }else if(/ASK_FOR_ATTEMTION/.test(err.type)){
          content = err.msg
          redirect = true
        }else{
          content = `加载首页数据失败`
        }
        wx.showModal({
          title: '提示',
          content,
          showCancel: false,
          success: function(){
            if(redirect){
              wx.redirectTo({ url: `/pages/login/login` });
            }
          }
        })
      })
  },
  _initCurrentPosition(){
    let that = this
    let getPos = function(){
      return getCurrentPosition().then(({ longitude, latitude }) => {
        //let test = {longitude: 113.144417,latitude: 22.382778}
        that.setData({ currentPosition: { longitude, latitude } })
        that._markCurrentPosition({ longitude, latitude })
        //this.setData({ currentPosition: test})
        //this._markCurrentPosition(test)
      })
    }
    return getPos().catch(err => {
      let pattern1 = /getLocation:fail auth deny/
      let pattern2 = /getLocation:fail:auth denied/
      if(pattern1.test(err.errMsg) || pattern2.test(err.errMsg)){
        //用户拒绝
        return this._requestPermission().then(() => {
          return getPos()
        })
      }else{
        //获取失败
        wx.showModal({
          title: '获取位置',
          content: '获取您的当前位置失败,请稍后重新再试。',
          showCancel: false
        })
        return Promise.reject('获取当前位置失败，可能是网络原因')
      }
    })
  },
  //获取用户信息
  _requestPermission() {
    return new Promise((resolve,reject) => {
      wx.showModal({
        title: "获取用户位置",
        content: "云筒需要获取你的位置才能正常使用",
        success: ({ confirm, cancel }) => {
          if (confirm) {
            wx.openSetting({
              success: ({authSetting}) => {
                if(authSetting['scope.userLocation']){
                  resolve('用户在权限设置界面授予了位置权限')
                }else{
                  reject('用户在权限设置界面没有授予位置权限')
                }
              },
              fail: () => {
                reject('用户在权限设置页面没有设置成功')
              }
            });
          }else{
            reject('用户拒绝获取位置信息2')
          }
        },
        fail: () => {
          reject()
        }
      })
    })
  },
  onReady(e) {
    this.map = wx.createMapContext("map");
  },

  popupMaskTap(e) {
    this.setData({ isPopShow: false });
  },
  memberTap(e) {
    wxex.set('trash',{
      trashList: this.data.trashList,
      user_info: this.data.user_info
    })
    this.$route( `/pages/member/member?wxex=trash`);
  },
  dingweiTap(e){
    wx.showLoading({ title: '正在定位... '})
    // 所有路线都消失
    this.setData({ polyline: []})
    this._initCurrentPosition().then(() => {
      setTimeout(() => {
        wx.hideLoading()
        this.includePoints(this.data.positionMarkes)
      },1000)
      
    }).catch(err => {
      wx.hideLoading()
    })
  },
  saomaTap(e) {
    wx.scanCode({
      success: res => {
        if (/ok/.test(res.errMsg)) {
          //扫码成功
          console.log('扫码结果',res.result)
          let code = res.result 
          let sn = this._isHasSN(res.result)
          if(sn){
            //跳转到详情页面
           // this.$route(`/pages/trash-detail/trash-detail?sn=${sn}`)
           this.$route(`/pages/record/record?sn=${sn}`)
          }else{
            this._getTrashDataFromQurcode(res.result)
          }
          
        }
      }
    });
  },
  //判断是否有sn
  _isHasSN(code){
    let pattern = /sn\/(.+)$/
    let result = code.match(pattern)
    if(result){
      return result[1]
    }else{
      return ''
    }
  },
  _getTrashDataFromQurcode(code){
    api.getTrashDataFromQurcode(code)
      .then(res => {
        console.log("trash data", res);
        let key = "scanTrashQurcode";
        wxex.set(key, res);
        this.$route(`/pages/trash-scan/trash-scan?wxex=${key}`);
      })
      .catch(err => {
        wx.showModal({
          title: "扫描二维码",
          content: err,
          showCancel: false
        });
      });
  },
  gotoTrashDetail(e) {
    let { trashList,trashIndex } = this.data,
      sn = trashList[trashIndex].sn,
      name =  trashList[trashIndex].name
    this.setData({ isPopShow: false })
    this.$route(`/pages/trash-detail/trash-detail?sn=${sn}&name=${name}`)
  },
  pathTap(e) {
    let { currentPosition, trashList, trashIndex } = this.data;
    let trash = trashList[trashIndex];
    //路径规划
    this._markPath(currentPosition, {
      longitude: trash.lng,
      latitude: trash.lat
    });
    this.setData({ isPopShow: false });
  },
  mapMarkerTap(e) {
    let markerId = e.markerId,
      index = markerId - 1;
    if (index < 0) return;
    this.setData({
      trashIndex: index,
      isPopShow: true
    });
  },
  _markCurrentPosition({ longitude, latitude }) {
    let marks = this.data.positionMarkes || []
    marks[0] = { longitude, latitude }
    this.setData({
      positionMarkes:marks
    });
  },
  includePoints(points) {
    this.map.includePoints({
      points,
      padding: [40]
    });
  },
  _markPath(origin, destination) {
    let o = `${origin.longitude},${origin.latitude}`,
      d = `${destination.longitude},${destination.latitude}`;
    getGuidePath(o, d).then((points, distance, cost) => {
      let pLine = {
        points: points.points,
        color: "#3883fa",
        width: 2
        //arrowLine: true
      }
      //let polyline = this.data.polyline || []
      //polyline = polyline.concat([pLine])
      this.setData({polyline: [pLine]})
      //缩放视野
      this.includePoints([origin, destination]);
    }).catch(err => {
      wx.showModal({
        title: '规划路径',
        content: '规划路径超时,你可以稍后再重试',
        showCancel: false
      })
    })
  },
  /*在地图上标出坐标点 */
  /**
   *
   * @param {Array} markes
   * @param {Boolean} reset //是否重设
   */
  _mark(markes, reset = false) {
    let _markes = this.data.positionMarkes || [];
    let m = markes.map(item => {
      // 计算垃圾桶的百分比
      let residue = 0 
      for(let i = 0;i<item.sort_list.length;i++){
        residue += (+item.sort_list[0].trash_high)
      }
      return {
        longitude: item.lng,
        latitude: item.lat,
        iconPath: this._getTrashIconPath(residue),
        width: 50,
        height: 50
      };
    });

    if(_markes.length <= 0){
      _markes[0] = {}
    }
    _markes = _markes.slice(0, 1).concat(m)
    _markes = _markes.map((item, index) => {
      item.id = index;
      return item;
    });

    /*将垃圾桶绘制到地图上 */
    this.setData({
      positionMarkes: _markes
    }, ()=> {
      this.includePoints(this.data.positionMarkes)
    });
  },
  /*得到垃圾桶的图标路径 */
  _getTrashIconPath(residue) {
    if(residue <= 0){
      return "./images/btu_ljt0@3x.png"; // 空垃圾桶 
    }else if(residue > 0 && residue <= 30){
      return "./images/btu_ljt-1@3x.png"; 
    }else if(residue > 30 && residue <= 90){
      return "./images/btu_ljt-2@3x.png";
    }else if(residue > 90){
      return "./images/btu_ljt3@2x.png";
    }else {
      return ''
    }
  },
  onShow(){
    //重新加载数据
    this._loadIndexInfo()
  }
});
