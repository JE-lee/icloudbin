import api from '../../../utils/api'
import config from '../../../utils/config'
Page({
  onLoad({ user_uid, name, phone }){
    this.setData({ name, phone })
    this.loadDetail(user_uid)
  },
  loadDetail(user_uid){
    api.cardDetail(user_uid).then(res => {
      if(+res.code === config.ERR_OK){
        this.setData({ score: res.result.total_score })
      }
    })
  }
})