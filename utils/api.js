import config from "./config";
import user from "./user";
import wxex from "./wxex";
import {encryptToken} from './encrpt-token'

let privateKey  = null // {token,uid}对象

function post(url, data, loading = true ) {
  // 先获取token
  let retryCount = 0
  let _post = function(reset){
    return getToken(reset).then(token => {
      return new Promise((resolve, reject) => {
        let d = Object.assign({}, data, token);
        loading && wx.showLoading({ title: '加载中', mask: true })
        wx.request({
          url,
          data: d,
          method: "POST",
          success: function(res) {
            loading && wx.hideLoading()
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
            loading && wx.hideLoading()
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


function post2(url, data, loading = true ) {
  // 先获取token
  let retryCount = 0
  let _post = function(reset){
    return getToken(reset).then(token => {
      return new Promise((resolve, reject) => {
        let d = Object.assign({}, data, token);
        loading && wx.showLoading({ title: '加载中', mask: true })
        wx.request({
          url,
          data: d,
          method: "POST",
          success: function(res) {
            loading && wx.hideLoading()
            if (res.statusCode != 200) {
              reject();
            }
            resolve(res.data)
          },
          fail: function(err) {
            loading && wx.hideLoading()
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
            let r = {};
            try {
              r = JSON.parse(res.data)
            } catch (error) {
              
            }

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
        return Promise.reject(`upload getToken 失败`)
      }
    })
  }
  return  _upload()
  
}
function getTrashDataFromQurcode(code) {
  let url = `${config.host}/api/Fenglin/recycleTrash`,
    data = { recycle_uid: code };
  return post(url, data);
}

function uploadDeductImage(path) {
  let url = `${config.host}/api/Fenglin/upload`;
  return upload(url, path, "image", { token: "" });
}

function postTrashInfo(data) {
  let url = `${config.host}/api/Fenglin/recycleInfo`;
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
        let url = `${config.host}/api/Fenglin/getToken`,
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
                reject(JSON.stringify({ type: 'ASK_FOR_LOGIN'}))
                wx.redirectTo({ url: `/pages/login/login` });
                return 
                
              } else if (res.data.code == config.ASK_FOR_ATTEMTION) {
                //要求关注公众号
                reject(JSON.stringify({type: 'ASK_FOR_ATTEMTION',msg: res.data.msg}))
                return  
              }
              reject(msg);
            }
          },
          fail: err => {
            reject(JSON.stringify({ type: 'error'}));
          }
        });
      });
    })
    return p
  }
}

/*邀请登录 */
function inviteLogin(inviteCode) {
  let url = `${config.host}/api/Fenglin/invite`;
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
      url: 'https://www.icb-admin.com/api/Fenglin/common',
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
  let url = `${config.host}/api/Fenglin/index`
  return post(url)
}

/*垃圾桶详细信息 */
/**
 * 
 * @param {string} sn | 垃圾桶编号 
 */
function getTrashDetail(sn){
  let url = `${config.host}/api/Fenglin/detail`
  return post(url, {sn})
}

/*垃圾桶历史消息 */
function getTrashHistoryMsg(sn){
  let url = `${config.host}/api/Fenglin/message`
  return post(url,{ sn })
}
/**垃圾桶投放记录 */
function getTrashRecord({sn, sort}){
  let url = `${config.host}/api/Fenglin/unusual`
  return post(url, {sn, sort})
}

/* 登录设备 */
function loginDevice(sn){
  let url = `${config.host}/api/Fenglin/loginDevice`
  return post2(url, { sn })
}

/*是否登录 */
function isLogin(){
  let url = `${config.host}/api/Fenglin/isLogin`
  return post2(url, {}, false)
}

/* 设备刷卡列表 */
function cardList(){
  let url = `${config.host}/api/Fenglin/cardList`
  return post(url) 
}

/* 刷卡用户详情数据 */
function cardDetail(user_uid){
  let url = `${config.host}/api/Fenglin/cardListDetail`
  return post(url, { user_uid }) 
}

/* 加减分 */
function opScore({ user_uid, type, score }){
  let url = `${config.host}/api/Fenglin/score`
  return post(url, { user_uid, type, score}) 
}

/* 退出登录 */
function outLogin(){
  let url = `${config.host}/api/Fenglin/outLogin`
  return post(url)
}

/*制卡 */
function makeCard({ name, phone, sn }){
  let url = `${config.host}/api/Fenglin/makeCard`
  return post2(url, { name, phone, sn })
}

/*查询纸卡成功 */
function isMake(){
  let url = `${config.host}/api/Fenglin/isMake`
  return post2(url, {}, false )
}

/* 重新纸卡 */
function repeatMakeCard(){
  let url = `${config.host}/api/Fenglin/repeatMakeCard`
  return post2(url, {}, false )
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
  getTrashHistoryMsg,
  getTrashRecord,
  loginDevice,
  isLogin,
  cardList,
  cardDetail,
  opScore,
  outLogin,
  makeCard,
  isMake,
  repeatMakeCard
};
