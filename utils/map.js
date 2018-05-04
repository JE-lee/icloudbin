let Guide = require('../lib/guide/amap-wx')
import config from './config'
/**
 * 
 * @param {String} origin | "longitude,latitude"
 * @param {String} destination | "longitude,latitude"
 */
export function getGuidePath(origin, destination) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '正在规划路径中......',
      mask: true
    })
    var myAmapFun = new Guide.AMapWX({ key: config.GUIDE_KEY });
    myAmapFun.getWalkingRoute({
      origin,
      destination,
      success: function (data) {
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        resolve({
          points,
          distance: (data.paths[0] && data.paths[0].distance) ? data.paths[0].distance : -1,
          cost: (data.paths[0] && data.paths[0].duration) ? parseInt(data.paths[0].duration / 60) : -1
        })
        wx.hideLoading()

      },
      fail: function (info) {
        reject(`get guide path fail: ${info}`)
        wx.hideLoading()
      },
     
    })
  })

}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02', // 返回可直接使用腾讯坐标体系的经纬度
      success: function ({ longitude, latitude }) {
        resolve({ longitude, latitude })
      },
      fail: function (err) {
        reject(err)
      }
    })
  })

}