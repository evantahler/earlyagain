exports.action = {
  name:                   'venueDetails',
  description:            'venueDetails',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {
    required: ['venueId'],
    optional: [],
  },

  run: function(api, connection, next){
    api.venue.details(connection.params.venueId, function(err, venue){
      connection.error = err;
      connection.response.venue = venue;
      next(connection, true);
    })
  }
};