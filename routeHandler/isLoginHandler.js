module.exports = (client)=>{
  return async(req,res)=>{
    console.log('isLogin')
    console.log(req.sessionID)
    console.log(req.session)
    console.log(req.session.username)
    if(req.sessionID && req.session && req.session.username){
      let db = client.db('IMdb');
      let collection = db.collection('users');
      let username = req.session.username
      let findOneResult = await collection.findOne({username})
      console.log('true')

      res.json({ 
        status: true,
        username:findOneResult.username,
        userNickName:findOneResult.userNickName,
        uid:findOneResult.uid,
        avatarBgc:findOneResult.avatarBgc
      })
    } else{
      console.log('false')
      res.json({ status: false })
    }
  }
}
