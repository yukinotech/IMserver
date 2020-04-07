const genID = require('../util/genID')
const genAvatarBgColor = require('../util/genAvatarBgColor')

module.exports = (client)=>{
  return async (req,res)=>{
    // console.log(req)
    // console.log(req.cookies)
    console.log(req.sessionID)
    console.log(req.body)
    console.log(req.session.username)
    if(req.body){
      if(req.body.username && req.body.password && req.body.userNickName){
        let username = req.body.username
        let password = req.body.password
        let userNickName = req.body.userNickName
        let uPattern = /^[a-zA-Z0-9_-]{4,16}$/
        if(uPattern.test(username) && uPattern.test(password)){
            let db = client.db('IMdb');
            let usersCollection = db.collection('users');
            let messagesCollection = db.collection('messages');
            let findOneResult = await usersCollection.findOne({username})
            // console.log('findOneResult:',findOneResult)
            if(findOneResult===null){
              let newUid = genID()
              let insertOneResult = await usersCollection.insertOne({
                username,
                password,
                uid:newUid,
                userNickName,
                avatarBgc:genAvatarBgColor(),
                friends:[],
                messageList:[]
              })
  
              // console.log('insertOneResult:',insertOneResult)
              console.log('user register success ')
              res.json({ status: 200 })
            } else{
              console.log('user already in ')
              res.json({ status: 201 })
            }
        } else{
          res.json({ status: 202 })
        }
      } else{
        res.json({ status: 202 })
      }
    } else{
      res.json({ status: 202 })
    }
    console.log(req.session)
    console.log(req.sessionID)
    // res.send('登录成功')
  }
}
