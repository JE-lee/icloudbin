// index.js
// 获取应用实例
const SIDEBAR_WIDTH  = 554
Page({
  data: {
    sidebarAnimationData: {},
    isSidebarShow: false,
    isSidebarTabActive: [false,false]
  },
  onReady(e){
    this._showSidebar(false)
  },
  sidebarTap(e){
    let index = e.currentTarget.dataset.index,
      isActive = this.data.isSidebarTabActive[index]
    this.setData({ [`isSidebarTabActive[${index}]`]: !isActive })
  },
  memberTap(e){
    this._showSidebar(true)
  },
  saomaTap(e){
  },
  hideSidebar(e){
    this.data.isSidebarShow && this._showSidebar(false)
  },
  _showSidebar(show){
    let animationSidebar = wx.createAnimation({
      duration: 200,
      timingFuction: 'ease'
    })
    if(show){
      animationSidebar.translate(0).step()
    }else{
      animationSidebar.translate(-414).step()
    }
    this.setData({ 
      sidebarAnimationData: animationSidebar.export(),
      isSidebarShow: show
    })
  }
})
