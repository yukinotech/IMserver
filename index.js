const express = require('express')
const session = require("express-session")
const MongoStore = require('connect-mongo')(session)
const MongoClient = require('mongodb').MongoClient;
const genID = require('./util/genID')
const genAvatarBgColor = require('./util/genAvatarBgColor')
// Connection URL
const url = 'mongodb://localhost:27017';

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });

let app = express()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(session({
  secret: 'this is string key', // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
  name: 'session_id',
  /*保存在本地cookie的一个名字 默认connect.sid  可以不设置*/
  resave: false,
  /*强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。*/
  saveUninitialized: true, //强制将未初始化的 session 存储。  默认值是true  建议设置成true
  cookie: {
    maxAge: 1000 * 60 * 30 /*过期时间*/
  },
  /*secure https这样的情况才可以访问cookie*/

  //设置过期时间比如是30分钟，只要游览页面，30分钟没有操作的话在过期

  rolling: true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
  store: new MongoStore({
    url:'mongodb://localhost:27017',
    dbName: 'IMdb',
    collection:'sessions'
  })
}))

client.connect((err)=>{
  app.post("/login",async(req,res)=>{
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
  });
  
  app.post("/register",async (req,res)=>{
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
            let collection = db.collection('users');
            let findOneResult = await collection.findOne({username})
            // console.log('findOneResult:',findOneResult)
            if(findOneResult===null){
              let insertOneResult = await collection.insertOne({
                username,
                password,
                uid:genID(),
                userNickName,
                avatarBgc:genAvatarBgColor(),
                friends:[]
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
  });

  app.post("/isLogin",async(req,res)=>{
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
  })
  
  app.post("/searchFriend",async(req,res)=>{
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
  })

  app.post("/addFriend",async(req,res)=>{
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
      }
    else{
      res.json({
        status:202
      })
    }
  })
  app.listen(3000,()=>{
    console.log('server run on port 3000')
  })
})
