module.exports = (client)=>{
  return async(req,res)=>{
    // req.session.userInfo='张三'
    console.log(req.sessionID)
    console.log(req.body)
    console.log(req.session.username)
    if(req.body && req.body.username && req.body.password){
        let username = req.body.username
        let password = req.body.password
        let uPattern = /^[a-zA-Z0-9_-]{4,16}$/
        if(uPattern.test(username) && uPattern.test(password)){
            let db = client.db('IMdb');
            let collection = db.collection('users');
            let findOneResult = await collection.findOne({username,password})
            // console.log('findOneResult:',findOneResult)
            if(findOneResult===null){
              console.log('username or password wrong')
              res.json({ status: 201 })
            } else{
              console.log('user login success')
              console.log(findOneResult.userNickName)
              req.session.username=username
              req.session.uid=findOneResult.uid

              res.json({ 
                status: 200,
                userNickName:findOneResult.userNickName,
                uid:findOneResult.uid,
                avatarBgc:findOneResult.avatarBgc,
              })
            }
        } else{
          console.log('201 error')
          res.json({ status: 201 })
        }
    } else{
      console.log('202 error')
      res.json({ status: 202 })
    }
  }
}
