export function fmtDate(obj){
  let date = new Date(+obj)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

export function fmtDateV2(obj){
  let date = new Date(+obj)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}