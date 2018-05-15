import config from "./config";
import user from "./user";
import wxex from "./wxex";
import {encryptToken} from './encrpt-token'

let privateKey  = null // {token,uid}对象

function post(url, data) {
  // 先获取token\
  let retryCount = 0
  let _post = function(reset){
    return getToken(reset).then(token => {
      return new Promise((resolve, reject) => {
        let d = Object.assign({}, data, token);
        wx.request({
          url,
          data: d,
          method: "POST",
          success: function(res) {
            if (res.statusCode != 200) {
              reject();
            }
            if (+res.data.code == config.ERR_OK) {
              resolve(res.data);
            } else if(res.data.code == config.INVALID_TOKEN){
              //重新获取token
              reject(1) 
            } else if(res.data.code == config.NO_INVITE_CODE){
              //需要邀请
              reject()
              wx.redirectTo({ url: `/pages/login/login` });
              return 
            }else {
              reject(res.data.msg);
            }
          },
          fail: function(err) {
            reject(err);
          }
        });
      });
    }).catch(err => {
      if(err === 1 && retryCount < 1 ){
        retryCount ++ 
        return _post(true)
      }else{
        return Promise.reject(`${err}`)
      }
    })
  }
  return _post()
}

function upload(url, path, name, formData) {
  // 获取token
  let retryCount = 0
  let _upload = function(reset){
    return getToken(reset).then(token => {
      wx.showLoading({
        title: "正在上传...",
        mask: true
      });
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url,
          filePath: path,
          name,
          formData: Object.assign({},formData,token),
          success: function(res) {
            if (res.statusCode !== 200) {
              reject();
              wx.hideLoading();
              return;
            }
            let r = JSON.parse(res.data);
            if (+r.code == config.ERR_OK) {
              resolve(r);
            } else if(+r.code == config.INVALID_TOKEN){
              reject(1)
            }else if(+r.code == config.NO_INVITE_CODE){
               //需要邀请
               reject()
               wx.redirectTo({ url: `/pages/login/login` });
               return
            }else {
              reject(r.msg);
            }
            wx.hideLoading();
          },
          fail: function(err) {
            reject();
            wx.hideLoading();
          }
        });
      });
    }).catch(err => {
      if(err === 1 && retryCount < 1){
        retryCount ++ 
        return _upload(true)
      }else{
        return Promise.reject(`upload getToken 失败 ${err}`)
      }
    })
  }
  return  _upload()
  
}
function getTrashDataFromQurcode(code) {
  let url = `${config.host}/api/recycle/recycleTrash`,
    data = { recycle_uid: code };
  return post(url, data);
}

function uploadDeductImage(path) {
  let url = `${config.host}/api/recycle/upload`;
  return upload(url, path, "image", { token: "" });
}

function postTrashInfo(data) {
  let url = `${config.host}/api/recycle/recycleInfo`;
  return post(url, data);
}

/*获得token信息 */
/*获取的token是加密的 */
/**
 * 
 * @param {boolean} reset | 是否重新调用接口 获取token
 */
function getToken(reset =  false) {
  if (privateKey && !reset) {
    return Promise.resolve(encryptToken(privateKey));
  } else {
    let p =  new Promise((resolve, reject) => {
      Promise.all([user.wxlogin(), user.getUserInfo()]).then(res => {
        let url = `${config.host}/api/recycle/getToken`,
          data = {
            code: res[0],
            nickname: res[1].nickName,
            sex: res[1].gender,
            headimgurl: res[1].avatarUrl,
            language: res[1].language
          };
        wx.request({
          url,
          data,
          method: "POST",
          success: res => {
            if (res.data.code == config.ERR_OK) {
              privateKey = res.data
              // 加密token
              resolve(encryptToken(privateKey))
            } else {
              let msg = res.data.msg
             
              if (res.data.code == config.NO_INVITE_CODE) {
                // 没有注册邀请码
                reject('ASK_FOR_ATTEMTION')
                wx.redirectTo({ url: `/pages/login/login` });
                return 
                
              } else if (res.data.code == config.ASK_FOR_ATTEMTION) {
                //要求关注公众号
                wx.showModal({
                  title: "关注",
                  content: "请先关注云筒科技公众号",
                  showCancel: false
                });
              }
              reject(msg);
            }
          },
          fail: err => {
            reject(err);
          }
        });
      });
    })
    return p
  }
}

/*邀请登录 */
function inviteLogin(inviteCode) {
  let url = `${config.host}/api/recycle/invite`;
  return new Promise((resolve, reject) => {
    //重新获取code
    user.wxlogin()
      .then(code => {
        wx.request({
          url,
          method: "POST",
          data: {
            code,
            invite_code: inviteCode
          },
          success: res => {
            if (res.data.code == config.ERR_OK) {
              resolve();
            } else {
              reject(res.data.msg);
            }
          },
          fail: err => {
            reject(err);
          }
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

/*验证token */

function vefiryToken(data){
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://www.icb-admin.com/api/recycle/common',
      data,
      method: 'POST',
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
  
    })
  })
}

/*首页数据接口 */
function getIndexInfo(){
  let url = `${config.host}/api/recycle/index`
  return post(url)
}

/*垃圾桶详细信息 */
/**
 * 
 * @param {string} sn | 垃圾桶编号 
 */
function getTrashDetail(sn){
  let url = `${config.host}/api/recycle/detail`
  return post(url, {sn})
}

/*垃圾桶历史消息 */
function getTrashHistoryMsg(sn){
  let url = `${config.host}/api/recycle/message`
  return post(url,{ sn })
}

export default {
  getTrashDataFromQurcode,
  uploadDeductImage,
  postTrashInfo,
  getToken,
  inviteLogin,
  vefiryToken,
  getIndexInfo,
  getTrashDetail,
  getTrashHistoryMsg
};
