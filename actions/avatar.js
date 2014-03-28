exports.action = {
  name:                   'avatar',
  description:            'avatar',
  blockedConnectionTypes: [],
  outputExample:          {},
  matchExtensionMimeType: false,
  version:                1.0,
  toDocument:             true,

  inputs: {
    required: ['id'],
    optional: [],
  },

  run: function(api, connection, next){
    connection.response.avatar = api.user.avatar(connection.params.id);
    next(connection, true);
  }
};