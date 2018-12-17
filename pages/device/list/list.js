
import api from '../../../utils/api'
import config from '../../../utils/config'
Page({
  onLoad(){
    this.loadList()
  },
  loadList(){
    api.cardList().then(res => {
      if(+res.code === config.ERR_OK){
        this.setData({ list: res.result })
      }
    })
  }
})