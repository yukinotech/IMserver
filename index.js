const express = require('express')
const session = require("express-session")
const MongoStore = require('connect-mongo')(session)
const MongoClient = require('mongodb').MongoClient;
const path = require('path')

const md5 = require('blueimp-md5')

// Connection URL
const url = 'mongodb://localhost:27017';

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });





const loginHandler = require('./routeHandler/loginHandler')
const registerHandler = require('./routeHandler/registerHandler')
const isLoginHandler = require('./routeHandler/isLoginHandler')
const addFriendHandler = require('./routeHandler/addFriendHandler')
const getMessageListHandler = require('./routeHandler/getMessageListHandler')
const processFriendReqHandler = require('./routeHandler/processFriendReqHandler')
const searchFriendHandler = require('./routeHandler/searchFriendHandler')
const getFriendListHandler = require('./routeHandler/getFriendListHandler')
const getDialogueListHandler = require('./routeHandler/getDialogueListHandler')

let app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server);

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


//双向hash表，存socket-io-id和username
let hashName ={}

client.connect((err)=>{
  
  let db = client.db('IMdb')
  db.createCollection('users')
  db.createCollection('sessions')
  db.createCollection('messages')

  let sessionMiddleware = session({
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
  })
  
  app.use(sessionMiddleware)
  // app.use((res,req,next)=>{
  //   console.log('express每次都')
  //   next()
  // })
  io.use(function(socket, next) {
    // console.log('每次都跑？')
    sessionMiddleware(socket.request, socket.request.res, next);
  })
  
  
  app.post("/login",loginHandler(client));
  
  app.post("/register",registerHandler(client));

  app.post("/isLogin",isLoginHandler(client))
  
  app.post("/searchFriend",searchFriendHandler(client))

  app.post("/addFriend",addFriendHandler(client))

  app.post("/getMessageList",getMessageListHandler(client))

  app.post("/processFriendReq",processFriendReqHandler(client))

  app.post("/getFriendList",getFriendListHandler(client))

  app.post("/getDialogueList",getDialogueListHandler(client))

  // app webSocketTest 
  app.get('/loginPage',(req,res)=>{
    res.sendFile(path.join(__dirname,'./webSocketPageTest/webSocketPage.html'))
  })


  io.on('connection', (socket) => {
    // console.log(socket.request)
    console.log('加入了一个新人',socket.request.session.username)
    if(socket.request.session.username && socket.id){
      hashName[socket.id]=socket.request.session.username
      hashName[socket.request.session.username]=socket.id
    }

    socket.on('p2pChat message',async(msg)=> { 
      console.log('socketIOSessionName',socket.request.session.username)

      if(socket.request.session.username && socket.id){
        // 每次连接socketio的时候，都要刷新双向hash表
        
        hashName[socket.id]=socket.request.session.username
        hashName[socket.request.session.username]=socket.id
        console.log('socket-io-session',socket.request.sessionID)
        console.log('发信人',socket.request.session.username)
        console.log('收信人',msg.toWho)

        let db = client.db('IMdb');
        let collection = db.collection('users');
        let username = socket.request.session.username

        if(msg.type==='p2pChat' && msg.toWho){
          let fromUser = await collection.findOne({username})
          let toUser = await collection.findOne({username:msg.toWho})

          console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
          if(fromUser && toUser){

            let messagesCollection = db.collection('messages')
            let p2pChatId = md5(
              [fromUser.username,toUser.username].sort((a,b)=>{
                return a>b?true:false
              }).join()
            )
            let messageFoundResult = await messagesCollection.findOne({p2pChatId})
            let date = new Date()
            if(messageFoundResult){
              //添加入已知数组
              await messagesCollection.findOneAndUpdate({p2pChatId},{
                $push:{
                  messageList:{
                    $each:[{
                      username:fromUser.username,
                      message:msg.message,
                      time:date
                    }],
                    $sort:{
                      time:1
                    }
                  }
                }
              })
            } else{
              await messagesCollection.insertOne({
                p2pChatId,
                members:[fromUser.username,toUser.username],
                messageList:[{
                  username:fromUser.username,
                  message:msg.message,
                  time:date
                }]
              })
            }
            console.log(hashName[msg.toWho])
            console.log(hashName[hashName[msg.toWho]])
            io.to(hashName[msg.toWho]).emit('p2pChat message',{
              username:fromUser.username,
              userNickName:fromUser.userNickName,
              avatarBgc:fromUser.avatarBgc,
              message:msg.message,
              time:date
            })
          }
        }

      }
    })
  })

  server.listen(3000,()=>{
    console.log('server run on port 3000')
  });


})
