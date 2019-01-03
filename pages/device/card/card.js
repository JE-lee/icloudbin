import api from '../../../utils/api'
import config from '../../../utils/config'
import util from '../../../utils/util'
import retry from '../../../utils/retry-promise'
Page({
  data: {
    name: '',
    phone: '',
    sn: '',
    countDown: 0,
    state: 1, // 2 为发起制卡失败
    disable: false
  },
  submit(e){
    let { name, phone, sn } = e.detail.value,
     result = ''
    if(!name) result = '请输入姓名'
    if(!util.isMobile(phone)) result = '请输入正确的手机号码'
    if(!sn) result = '请输入卡号'
    if(result){
      util.qAlert(result, '验证')
      return 
    }
    if(this.data.state == 2){
      this.reMakeCard()
    }else{
      this.makeCard({ name, phone, sn })
    }
    
  },
  makeCard(data){
    // 提交
    api.makeCard(data).then(res => {
      if(+res.code === 1 ){
        this.roll()
      }else if(+res.code === -1){
        // 重新下发纸卡
        this.reMakeCard()
      }else{
        util.qAlert(res.msg)
      }
    }).catch(() => {
      util.qAlert('制卡失败，网络问题。')
    })
  },
  reMakeCard(){
    api.repeatMakeCard().then(res => {
      if(+res.code === 1){
        // 轮询
        this.roll()
      }else if(+res.code === -1 ){
        // 重新下发失败
        this.handleFail(res.msg)
      }else {
        utils.qAlert(res.msg)
      }
    }).catch(() => {
      util.qAlert('制卡失败，网络问题。')
    })
  },
  roll(){
    let timeout = 60
    this.countDown(timeout)
    // 开始倒计时
    this.setData({ disable: true })
    return retry(this.isMake, 5000, timeout / 5 ).then(res => {
      this.setData({ disable: false })
      if(+res.code === -2){
        this.handleFail(res.msg)
      }else{
        wx.showToast({ title: '制卡成功', icon: 'success'})
        // 清空
        this.reset()
      }
    }).catch(() => {
      this.setData({ disable: false })
      util.qAlert('制卡超时')
    })
  },
  isMake(){
    
    return api.isMake().then(res => {
      if(+res.code === 2){
        //成功
        return res
      }else if(+res.code === -2){
        // 需要重新下发
        return res
      }else{
        return Promise.reject()
      }
    })
  },
  handleFail(msg){
    this.setData({state: 2})
    util.qAlert(msg)
  },

  countDown(total){
    this.setData({ countDown: total })
    retry(() => Promise.reject(), 1000, total,() => {
      if(this.data.state === 2){
        this.setData({ countDown: 0 })
        return false 
      }else {
        this.setData({ countDown: --this.data.countDown })
        return true 
      }
      
    })
  },
  reset(){
    this.setData({
      name: '',
      phone: '',
      sn: '',
      state: 1
    })
  }

})