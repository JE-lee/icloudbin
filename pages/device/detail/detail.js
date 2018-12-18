import api from '../../../utils/api'
import config from '../../../utils/config'
import util from '../../../utils/util'
Page({
  data: {
    dialogVisible: false,
    type: -1, // 1: 加分, 2:减分
    score: ''
  },
  onLoad({ user_uid, name, phone }){
    this.setData({ name, phone })
    this.loadDetail(user_uid)
  },
  loadDetail(user_uid){
    api.cardDetail(user_uid).then(res => {
      if(+res.code === config.ERR_OK){
        this.setData({ total: res.result.total_score })
      }
    })
  },
  hideDialog(){
    this.setData({ dialogVisible: false })
  },
  inputScore(e){
    this.setData({ 
      score: Math.abs(e.detail.value.score),
      dialogVisible: false
    })
  },
  updateVisible(e){
    this.setData({ dialogVisible: e.detail.visible })
  },
  op(e){
    this.setData({ 
      type: +e.currentTarget.dataset.type,
      dialogVisible: true
    })
  },
  save(){
    let { type, score = 0, total } = this.data
    if(score <= 0){
      util.qAlert('请输入要操作的分值')
      return 
    }
    api.opScore({
      user_uid: this.__query.user_uid,
      type,
      score
    }).then(() => {
      this.setData({ 
        total: type == 1 ? total + score : total-score,
        score: 0
      })
      wx.showToast({ title: '操作成功', icon: 'success'})
    }).catch(err => {
      util.qAlert('操作失败，稍后重试。' + err)
    })
  }
})