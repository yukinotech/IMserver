const md5 = require('blueimp-md5')

module.exports = (client)=>{
  return async(req,res)=>{
    if(req.sessionID && 
      req.session && 
      req.session.username &&
      req.body && 
      req.body.messagesInfo &&
      req.body.start!==undefined &&
      req.body.end!==undefined
      ){
        let messagesInfo = req.body.messagesInfo
        let start = req.body.start
        let end = req.body.end
        if(messagesInfo.type==='p2pChat' && messagesInfo.toWho){
          let db = client.db('IMdb');
          let messagesCollection = db.collection('messages')
          let p2pChatId = md5(
            [req.session.username,messagesInfo.toWho].sort((a,b)=>{
              return a>b?true:false
            }).join()
          )
          let findOneResult = await messagesCollection.findOne({p2pChatId})
          if(findOneResult!==null){
            let userCollection = db.collection('users')
            console.log('start:',start)
            console.log('end:',end)
            let messagePromiseList = findOneResult.messageList.reverse().slice(start,end).map(async(messageItem)=>{
              let userResult = await userCollection.findOne({username:messageItem.username})
              return {
                userNickName:userResult.userNickName,
                username:userResult.username,
                avatarBgc:userResult.avatarBgc,
                uid:userResult.uid,
                message:messageItem.message
              }
            })
  
            let messageList = await Promise.all(messagePromiseList)

            res.json({
              status:200,
              message:'success',
              dialogueList:messageList.reverse()
            })
          } else{
            res.json({
              status:200,
              message:'success',
              dialogueList:[]
            })
          }
        } else{
          res.json({
            status:400,
            message:'无权限或字段不全'
          })
        }
      }
    else{
      console.log('400 error')
      res.json({
        status:400,
        message:'无权限或字段不全'
      })
    }
  }
}