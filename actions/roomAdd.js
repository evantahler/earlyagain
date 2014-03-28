exports.action = {
  name:                   'roomAdd',
  description:            'roomAdd',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {
    required: ['locationId'],
    optional: [],
  },

  run: function(api, connection, next){
    api.chatRoom.add(connection.params.locationId, function(){
      next(connection, true);
    });
  }
};