module.exports = (client)=>{
  return async(req,res)=>{
    if(req.sessionID && 
      req.session && 
      req.session.username &&
      req.body && 
      req.body.uid
      ){
      let db = client.db('IMdb');
      let collection = db.collection('users');
      let uid = req.body.uid
      let findOneResult = await collection.findOne({uid})
      if(findOneResult===null){
        res.json({
          status:201
        })
      } else{
        res.json({
          status:200,
          userNickName:findOneResult.userNickName,
          uid:findOneResult.uid,
          avatarBgc:findOneResult.avatarBgc,
        })
      }
    } else{
      res.json({
        status:202
      })
    }
  }
}