const express = require('express')
const session = require("express-session")
const MongoStore = require('connect-mongo')(session)
const MongoClient = require('mongodb').MongoClient;

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
  
  app.post("/login",loginHandler(client));
  
  app.post("/register",registerHandler(client));

  app.post("/isLogin",isLoginHandler(client))
  
  app.post("/searchFriend",searchFriendHandler(client))

  app.post("/addFriend",addFriendHandler(client))

  app.post("/getMessageList",getMessageListHandler(client))

  app.post("/processFriendReq",processFriendReqHandler(client))

  app.post("/getFriendList",getFriendListHandler(client))

  app.listen(3000,()=>{
    console.log('server run on port 3000')
  })
})
