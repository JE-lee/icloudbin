
import api from '../../../utils/api'
import config from '../../../utils/config'
import util from '../../../utils/util'
Page({
  loadList(){
    return api.cardList().then(res => {
      if(+res.code === config.ERR_OK){
        this.setData({ list: res.result })
      }
    })
  },
  exit(){
    api.outLogin().then(() => {
      this.setData({ list: [] })
      this.$route('back1')
    }).catch(() => {
      util.qAlert('退出失败,稍后重试')
    })
  },
  addICCard(){
    this.$route(`/pages/device/card/card`)
  },
  onPullDownRefresh(){
    this.loadList().then(() => {
      wx.stopPullDownRefresh()
    })
  },
  onShow(){
    this.loadList()
  }
})