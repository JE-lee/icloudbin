import config from "./config";

function post(url, data) {
  return new Promise((resolve, reject) => {
    let d = Object.assign({}, data, { token: "" });
    wx.request({
      url,
      data: d,
      method: "POST",
      success: function(res) {
        if(res.statusCode !== 200) {
          reject()
        }
        if (+res.data.code === config.ERR_OK) {
          resolve(res.data);
        } else {
          reject(res.data.msg);
        }
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
}

function upload(url, path, name, formData) {
  wx.showLoading({
    title: '正在上传...',
    mask: true
  })
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath: path,
      name,
      formData,
      success: function(res) {
        if(res.statusCode !== 200){
          reject()
          wx.hideLoading()
          return 
        }
        let r = JSON.parse(res.data)
        if (+r.code === config.ERR_OK) {
          resolve(r);
        } else {
          reject(r.msg);
        }
        wx.hideLoading()
      },
      fail: function(err) {
        debugger
        reject();
        wx.hideLoading()
      }
    });
  });
}
function getTrashDataFromQurcode(code) {
  let url = `${config.host}/api/recycle/recycleTrash`,
    data = { recycle_uid: code };
  return post(url, data);
}

function uploadDeductImage(path){
  let url = `${config.host}/api/recycle/upload`
  return upload(url,path,'image',{token: ''})
}

function postTrashInfo(data){
  let url = `${config.host}/api/recycle/recycleInfo`
  return post(url,data)
}

export default {
  getTrashDataFromQurcode,
  uploadDeductImage,
  postTrashInfo
};
