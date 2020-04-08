module.exports = (client)=>{
  return async(req,res)=>{
    if(req.sessionID && 
      req.session && 
      req.session.username &&
      req.body && 
      req.body.toBeFriendUid
      ){
        let db = client.db('IMdb');
        let collection = db.collection('users');
        let uid = req.body.toBeFriendUid
        let findOneResult = await collection.findOne({uid})
        if(findOneResult===null){
          res.json({
            status:201,
            message:'没有该uid用户'
          })
        } else if(findOneResult.username===req.session.username){
          res.json({
            status:205,
            message:'不能添加自己为好友'
          })
        } else if(findOneResult.friends.indexOf(req.session.username)!==-1){
          res.json({
            status:206,
            message:'已经互为好友'
          })
        }
        else{
          let filterResult = findOneResult.messageList.filter((item)=>{
            console.log(item)
            console.log(item.type==='addFriendReq')
            console.log(item.hasProcessed===false)
            console.log(item.fromUserInfo.username === req.session.username)
            if(item.type==='addFriendReq' &&
             item.hasProcessed===false && 
             item.fromUserInfo.username === req.session.username){
               // return true 代表 filter要留下来的
               return true
             } else{
               return false
             }
          })

          let isAddMessage = filterResult.length===0?true:false

          if(isAddMessage){
            let updateOneResult = await collection.findOneAndUpdate(
              {uid},
              {
                $set:{
                  messageList:[{
                    type:'addFriendReq',
                    hasProcessed:false,
                    fromUserInfo:{
                      username:req.session.username,
                      uid:req.session.uid
                    }
                  },...(findOneResult.messageList)]
                }
              }
            )

            res.json({
              status:200,
              message:'消息发送成功'
            })
          } else{
            res.json({
              status:202,
              message:'消息已在队列中,请勿重复添加'
            })
          }
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