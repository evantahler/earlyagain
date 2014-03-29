exports.user = function(api, next){

  api.user = {};

  api.user.avatar = function(id){
    return "http://robohash.org/" + id;  
  }
  
  next();
}