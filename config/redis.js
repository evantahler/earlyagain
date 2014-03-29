exports.default = { 
  redis: function(api){
    return {
      fake: true,
      host: '127.0.0.1',
      port: 6379,
      password: null,
      options: null,
      database: 0
    }
  }
}

exports.test = { 
  redis: function(api){
    var toFakeRedis = false;
    if(process.env.fakeredis == 'true'){
      toFakeRedis = true;
    }

    return {
      'fake': toFakeRedis,
      'host': '127.0.0.1',
      'port': 6379,
      'password': null,
      'options': null,
      'DB': 2
    }
  }
}

exports.production = { 
  redis: function(api){
    return {
      fake: false,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      options: null,
      database: 0
    }
  }
}