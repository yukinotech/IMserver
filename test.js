let a = [1,2]
console.log(a[2])
// console.log(a.slice(5,10))
const md5 = require('blueimp-md5')

let p2pChatId = ['asobi','zzzz'].sort((a,b)=>{
  return a>b?true:false
}).join()
let p2pChatId2 = ['zzzz','asobi'].sort((a,b)=>{
  return a>b?true:false
}).join()
console.log(p2pChatId)
console.log(p2pChatId2)