// index.js
// 获取应用实例
const SIDEBAR_WIDTH  = 554
Page({
  data: {
    trashcanList: [
      {
        name: '垃圾桶A',
        status: 0, //0 正常，1，故障，2 缺纸
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
  popupMaskTap(e){
    this.setData({ isPopShow: false })
  },
  memberTap(e){
    this.$route('/pages/member/member')
  },
  saomaTap(e){
    
  }
})
