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
          title: "invite",
          content: JSON.stringify(err) || 'invite error',
          showCancel: false
        });
      });
  }
});
