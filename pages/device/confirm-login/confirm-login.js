
import api from '../../../utils/api'
import config from '../../../utils/config'
Page({
  onLoad({ sn }){
    this.$$sn = sn
  },
  cancel(){
    this.$route('back1')
  },
  sure(){
    api.loginDevice(this.$$sn)
      .then(res => {
        if(+res.code === config.ERR_OK){
          this.$route(`/pages/device/detail/detail`)
          return 
        }else if(+res.code === 0){
          // 轮询i's'Login
          this.pollIsLogin(30).then(res => {
            this.$route(`/pages/device/detail/detail`)
          }).catch(err => {
            wx.showModal({
              title: '提示',
              content: '登录设备失败,稍后重试',
              showCancel: false
            })
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '登录设备失败,' + res.msg,
            showCancel: false
          })
        }
      })
  },
  pollIsLogin(count){
    wx.showLoading({ title: '正在登录...', mask: true})
    let index = 0
    return new Promise((resolve, reject) => {
      let fn = () => {
        index ++
        api.isLogin().then(res => {
          if(+res.code === config.ERR_OK){
            wx.hideLoading()
            resolve()
          }else{
            if(index < count){
              setTimeout(() => {
                fn()
              },1000)
            }else{
              wx.hideLoading()
              reject()
            }
          }
        })
      }
      fn()
    })
  }
})
