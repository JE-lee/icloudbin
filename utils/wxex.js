const app = getApp()

function set(key, value){
  app.globalData[key] = value
}

function get(key){
  return app.globalData[key]
}

export default {
  set,
  get
}