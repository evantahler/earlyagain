exports.default = { 
  foursquare: function(api){
    return {
      id: process.env.FOURSQUARE_ID,
      secret: process.env.FOURSQUARE_SECRET
    }
  }
}