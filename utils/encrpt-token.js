import md5 from './md5.js';
let sha1 = require('./sha1.js');
import user from './user.js'
import wxex from './wxex' 
export function encryptToken(privateKey){
  let d = [],
    userInfo = wxex.get('user.userInfo')
  d[0] = userInfo.gender
  d[1] = userInfo.avatarUrl
  d[2] = userInfo.language
  let time = Math.floor(Date.now() / 1000)
  d[3] = time
  //md5加密
  //let s = md5.hex_md5(d.join(','))
  //let s = d.join(',')
  //s += privateKey.token
  
  //sha1 加密
  //s = sha1(s)
  let s = privateKey.token
  return {
    token: s,
    time,
    uid: privateKey.uid
  }
  
}

