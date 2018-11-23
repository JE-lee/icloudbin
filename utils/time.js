export function fmtDate(obj){
  let date = new Date(+obj)
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`
}

export function fmtDateV2(obj){
  let date = new Date(+obj)
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}