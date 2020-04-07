module.exports = (client)=>{
  return async(req,res)=>{
    if(req.sessionID && 
      req.session && 
      req.session.username){
        let db = client.db('IMdb');
        let collection = db.collection('users');
        let username = req.session.username
        let findOneResult = await collection.findOne({username})
        // console.log(findOneResult.messageList)

        let messageList = findOneResult.messageList.map(async(messageItem)=>{
          if(messageItem.type==='addFriendReq'){
            let userResult = await collection.findOne({username:messageItem.fromUserInfo.username})
            return {
              type:messageItem.type,
              hasProcessed: messageItem.hasProcessed,
              isPass: messageItem.isPass,
              userNickName:userResult.userNickName,
              username:userResult.username,
              avatarBgc:userResult.avatarBgc
            }
          } else{
            return messageItem
          }
        })
        let messageListResult = await Promise.all(messageList)
        console.log(messageListResult)
        res.json({
          status:200,
          message:'查询成功',
          messageList:messageListResult
        })
    } else{
      console.log('400 error')
      res.json({
        status:400,
        message:'无权限或字段不全'
      })
    }
  }
}