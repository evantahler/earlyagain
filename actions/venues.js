var request = require('request');

exports.action = {
  name:                   'venues',
  description:            'venues',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {
    required: ['lat', 'lon'],
    optional: [],
  },

  run: function(api, connection, next){
    var cacheKey = ["location", connection.params.lat, connection.params.lon].join('-');

    api.cache.load(cacheKey, function(err, cache){
      if(cache != null){
        connection.response.venues = cache;
        next(connection, true);
      }else{
        // https://api.foursquare.com/v2/venues/search?ll=40.7,-74&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=YYYYMMDD
        var url = "https://api.foursquare.com/v2/venues/search?";
        url += "&ll=" + connection.params.lat + "," + connection.params.lon;
        url += "&client_id=" + api.config.foursquare.id;
        url += "&client_secret=" + api.config.foursquare.secret;
        url += "&v=" + ( new Date().getTime() );
        request(url, function(err, response, body){
          var response = [];
          try{
            body = JSON.parse(body);
            body.response.venues.forEach(function(v){
              response.push({
                id: v.id,
                name: v.name,
              }) 
            })
            connection.response.venues = response
            api.cache.save(cacheKey, response, (60 * 60 * 1000), function(err, cache){
              next(connection, true);
            })
          }catch(e){
            connection.error = e;
            next(connection, true);
          }
        });
      }
    })    
  }
};