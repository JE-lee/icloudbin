import api from "../../utils/api";
Page({
  data: {},

  onLoad: function(options) {},
  login(e) {
    let code = e.detail.value.inviteCode;
    api.inviteLogin(code)
      .then(res => {
        // 跳转到首页
        wx.redirectTo({ url: `/pages/index/index` });
      })
      .catch(err => {
        wx.showModal({
          title: "邀请登录",
          content: JSON.stringify(err) || '邀请接口失败',
          showCancel: false
        });
      });
  }
});
