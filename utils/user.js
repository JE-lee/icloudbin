
import wxex from './wxex'
function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      lang: 'zh_CN',
      success: ({ userInfo }) => {
        userInfo.nickName = userInfo.nicknickName || 'null'
        if(userInfo.gender !=0 || userInfo.gender != 1) userInfo.gender = 'null'
        userInfo.avatarUrl = userInfo.avatarUrl || 'null'
        wxex.set('user.userInfo',userInfo)
        resolve(userInfo);
      },
      fail: err => {
        if (/unauthorized/.test(err.errMsg) || /deny/.test(err.errMsg)) {
          //用户没有授权,跳转到授权用户信息页面
          wx.redirectTo({ url: `/pages/user-authorize/user-authorize` });
          reject('用户没有授权或者拒绝')
        } else {
          reject("获取用户信息失败");
        }
      }
    });
  });
}

function wxlogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: ({ code }) => {
        wxex.set('user.code',code)
        resolve(code)
      },
      fail: err => {
        reject(err);
      }
    });
  });
}

export default {
  getUserInfo,
  wxlogin
};
