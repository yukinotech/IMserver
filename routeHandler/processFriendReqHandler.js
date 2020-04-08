module.exports = (client)=>{
  return async(req,res)=>{
    console.log(req.body)
    if(req.sessionID && 
      req.session && 
      req.session.username &&
      req.body && 
      req.body.toBeFriendUsername &&
      req.body.isPass!==undefined
      ){
        let db = client.db('IMdb');
        let collection = db.collection('users');
        let username = req.session.username
        let findOneResult = await collection.findOne({username})
        let toBeFriendUsername = req.body.toBeFriendUsername
        let addFriendMsgIndex = null
        console.log('findOneResult.messageList')
        console.log(findOneResult.messageList)
        console.log('findOneResult.messageList')
        let addFriendMsgArr = findOneResult.messageList.filter((item,index)=>{
          if(item.type==='addFriendReq' && 
          item.hasProcessed===false && 
          item.fromUserInfo.username===toBeFriendUsername){
            addFriendMsgIndex=index
            return true
          } else{
            return false
          }
        })
        // console.log('addFriendMsgIndex')
        // console.log(addFriendMsgIndex)
        // console.log('addFriendMsgIndex')
        // console.log('addFriendMsgArr')
        // console.log(addFriendMsgArr)
        // console.log('addFriendMsgArr')
        if(addFriendMsgArr.length===0){
          res.json({
            status:201,
            message:'该消息已处理或不存在'
          })
        } else{
          if(req.body.isPass===true){
            findOneResult.messageList.splice(addFriendMsgIndex,1)

            await collection.findOneAndUpdate({username},{
              $set:{
                messageList:[{
                  type:'addFriendReq',
                  hasProcessed:true,
                  isPass:true,
                  fromUserInfo:addFriendMsgArr[0].fromUserInfo
                },...(findOneResult.messageList)],
                friends:[
                  ...(findOneResult.friends),
                  req.body.toBeFriendUsername
                ]
              }
            })
            await collection.findOneAndUpdate({username:toBeFriendUsername},{
              $push:{
                friends:req.session.username
              }
            })
            res.json({
              status:2000,
              message:'已同意'
            })
          } else if(req.body.isPass===false){
            findOneResult.messageList.splice(addFriendMsgIndex,1)

            await collection.findOneAndUpdate({username},{
              $set:{
                messageList:[{
                  type:'addFriendReq',
                  hasProcessed:true,
                  isPass:false,
                  fromUserInfo:addFriendMsgArr[0].fromUserInfo
                },...(findOneResult.messageList)],
              }
            })
            res.json({
              status:2001,
              message:'已拒绝'
            })
          } else{
            console.log('无权限或字段不全2')
            res.json({
              status:400,
              message:'参数错误'
            })
          }
        }
    } else {
      console.log('无权限或字段不全')
      res.json({
        status:400,
        message:'无权限或字段不全'
      })
    }

  }
}