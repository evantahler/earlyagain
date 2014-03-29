var request = require('request');

exports.venue = function(api, next){

  api.venue = {};

  api.venue.cacheDuration = (60 * 60 * 24 * 1000);

  api.venue.details = function(venueId, callback){
    var cacheKey = 'venue-' + venueId;
    api.cache.load(cacheKey, function(err, venue){
      callback(err, venue)
    });
  }

  api.venue.loadRemoteList = function(lat, lon, callback){
    // https://api.foursquare.com/v2/venues/search?ll=40.7,-74&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=YYYYMMDD
    var url = "https://api.foursquare.com/v2/venues/search?";
    url += "&ll=" + lat + "," + lon;
    url += "&client_id=" + api.config.foursquare.id;
    url += "&client_secret=" + api.config.foursquare.secret;
    url += "&v=" + ( new Date().getTime() );
    request(url, function(err, response, body){
      var response = [];
      try{
        var started = 0;
        body = JSON.parse(body);
        body.response.venues.forEach(function(v){
          started++;
          var venueDetails = {
            id: v.id,
            name: v.name,
          };
          response.push(venueDetails);
          api.cache.save('venue-' + v.id, venueDetails, api.venue.cacheDuration, function(){
            started--
            if(started === 0){
              callback(null, response);
            }
          });
        })
        callback(null, response);
      }catch(e){
        callback(e)
      }
    });
  }

  next();
}