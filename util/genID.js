module.exports =  function genID(){
  return Math.floor(Math.random()*9+1).toString()+Math.random().toString().substr(3,2)+Date.now().toString().substr(9,4);
}