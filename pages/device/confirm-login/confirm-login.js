
import api from '../../../utils/api'
import config from '../../../utils/config'
import retry from '../../../utils/retry-promise'
import util from '../../../utils/util'
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
          this.$route(`/pages/device/list/list`, 'redirect')
          return 
        }else if(+res.code === 0){
          // 轮询i's'Login
          this.pollIsLogin(40).then(res => {
            this.$route(`/pages/device/list/list`,'redirect')
          }).catch(err => {
            util.qAlert('登录设备失败')
          })
        }else{
          util.qAlert('登录设备失败')
        }
      })
  },
  pollIsLogin(count){
    this.$$login = true 
    return retry(this.checkIsLogin, 1000, count, (c,t) => {
      this.$$login && wx.showLoading({ title: `正在登录${t-c}...`, mask: true})
      return this.$$login 
    }).then(res => {
      wx.hideLoading()
      return res
    }).catch((err) => {
      wx.hideLoading()
      return Promise.reject(err)
    })
  },
  checkIsLogin(){
    return api.isLogin().then(res => {
      if(+res.code === 0) return Promise.reject()
      return res 
    })
  },
  onUnload(){
    this.$$login = false
  }
})
