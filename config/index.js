module.exports = function(argv){
  if(argv[2]==='-pro'){
    return {
      mongoUrl:'mongodb://admin:zyf456@localhost:27017'
    }
  } else{
    return {
      mongoUrl:'mongodb://localhost:27017'
    }
  }
}