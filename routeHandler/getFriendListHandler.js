module.exports = (client)=>{
  return async(req,res)=>{
    if(req.sessionID && 
      req.session && 
      req.session.username
      ){
        let db = client.db('IMdb');
        let collection = db.collection('users');
        let findOneResult = await collection.findOne({username:req.session.username})

        let friendPromiseList = findOneResult.friends.map(async(friend)=>{
            let userResult = await collection.findOne({username:friend})
            return {
              userNickName:userResult.userNickName,
              username:userResult.username,
              avatarBgc:userResult.avatarBgc,
              uid:userResult.uid
            }
          } 
        )

        let friendList = await Promise.all(friendPromiseList)
        console.log(friendList)
        res.json({
          status:200,
          friendList:friendList,
          message:'成功'
        })
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