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
    api.venue.loadRemoteList(connection.params.lat, connection.params.lon, function(err, data){
      connection.response.venues = data;
      connection.response.error = err;
      next(connection, true);
    });  
  }
};