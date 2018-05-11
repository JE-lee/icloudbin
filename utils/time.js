export function fmtDate(obj){
  let date = new Date(+obj)
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`
}