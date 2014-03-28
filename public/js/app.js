var app = {};

$( document ).ready(function() {
  app.connect();
});

app.events = {};
app.timers = {};

app.on = function(event, callback){
  var self = this;
  if(self.events[event] == null){
    self.events[event] = {};
  }
  var key = self.randomString();
  self.events[event][key] = callback;
  return key;
}

app.emit = function(event, data){
  var self = this;
  if(self.events[event] != null){
    for(var i in self.events[event]){
      self.events[event][i](data);
    }
  }
}

app.randomString = function(){
  var seed = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 32; i++ ){
    seed += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  seed += '-' + new Date().getTime();
  return seed
}

app.QueryString = function(){
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
};

app.connect = function(){
  app.client = new actionheroClient;

  app.client.on('connected',    function(){ console.log('connected!') })
  app.client.on('disconnected', function(){ console.log('disconnected :(') })
  app.client.on('alert',        function(message){ alert(message) })
  app.client.on('api',          function(message){ alert(message) })
  app.client.on('welcome',      function(message){ app.appendMessage(message); })
  app.client.on('say',          function(message){ app.appendMessage(message); })

  app.client.connect(function(err, details){
    if(err != null){
      console.log(err);
    }else{
      app.id = app.client.id;

      if(window.location.hash != null && window.location.hash != ''){
        var stage = window.location.hash.replace("#",'');
        app.chageStage(stage);
      }else{
        app.chageStage(1);
      }

      app.loadAvatar(app.id, function(url){
        app.avatar = url;
        $('.myAvatar').attr('src', app.avatar);
      });
    }
  });
}

app.chageStage = function(stage){
  stage = parseInt(stage);
  $('.stageContainer').hide();
  $('#stage' + stage).fadeIn();
  window.location.hash = "#" + stage;
  app.emit('stage', stage);
}

app.avatars = {};
app.loadAvatar = function(id, callback){
  if(app.avatars[id] != null){
    callback(app.avatars[id]);
  }else{
    app.client.action('avatar', {id: id}, function(data){
      app.avatars[id] = data.avatar;
      callback(data.avatar)
    })
  }
}

app.getLocation = function(callback){
  navigator.geolocation.getCurrentPosition(GetLocation);
  function GetLocation(location) {
    callback(location.coords.latitude, location.coords.longitude)
  }
}

app.startChat = function(locationId){
  app.locationId = locationId;
  app.chageStage(3);
  app.client.action('roomAdd', {locationId: app.locationId}, function(data){
    app.joinChat();
  });
}

app.joinChat = function(locationId){
  if(app.QueryString()['locationId'] == null){
    var parts = window.location.href;
    window.location.href = parts.split("#")[0] + "?locationId=" + app.locationId + "#3";
  }else{
    app.client.roomChange(app.locationId);
    app.roomDetails();
  }
}

app.sendMessage = function(){
  var div = document.getElementById("message");
  var message = div.value;
  div.value = "";
  if(message.length > 0){
    app.client.say(message);
    app.appendMessage({
      me: true,
      message: message,
      from: app.client.id,
      sentAt: new Date().getTime()
    })
  }
}

app.roomDetails = function(){
  clearTimeout(app.timers.roomDetails);
  app.client.roomView(function(details){
    if(details.data != null){
      var others = parseInt(details.data.membersCount) - 1;
      $('#membersCount').html(others);
    }
    app.timers.roomDetails = setTimeout(function(){
      app.roomDetails();
    }, 3000);
  });
}

app.formatTime = function(timestamp){
  return new Date(timestamp).toLocaleTimeString()
}

app.appendMessage = function(message){
  var s = "";
  s += "<pre>"
  if (message.welcome != null){
    s += "<div align=\"center\">*** " + message.welcome + " ***</div>";
  }else{
    // s += "<img height=\"40\" class=\"avatar-"+message.from+"\">";
    // s += " @ "
    // s += " " + app.formatTime(message.sentAt);
    // s += '<span style="display: block; ">' + message.message + '</span>';
    s += "<table>"
    s += "<tr>"
    s += "<td rowspan=\"2\">" + "<img height=\"50\" class=\"avatar-"+message.from+"\">"; + "</td>"
    s += "<td>@ <em>" + app.formatTime(message.sentAt) + "</em></td>"
    s += "</tr>"
    s += "<tr>"
    s += "<td>" + message.message + "</td>"
    s += "</tr>"
    s += "</table>"
  }
  s += "</pre>"
  var div = document.getElementById("chatBox");
  div.innerHTML = s + div.innerHTML;

  app.loadAvatar(message.from, function(url){
    $('.avatar-' + message.from).attr('src', url);
  })
}

app.showLocations = function(){
  app.getLocation(function(lat, lon){
    app.client.action('venues', {lat: lat, lon: lon}, function(data){
      $('#locationsList').html('')
      data.venues.forEach(function(l){
        html = ""
        html += "<div class=\"locationListElement\">";
        html += "<a onClick=\"app.startChat('"+l.id+"')\">" + l.name + "</a>"
        html += "</div>";
        $('#locationsList').append(html)
      })
    });
  });
}

app.on('stage', function(stage){
  if(stage === 2){
    if(app.QueryString()['locationId'] != null){
      app.startChat(app.QueryString()['locationId']);
    }else{
      app.showLocations();
    }
  }
  if(stage === 3){
    if(app.locationId == null){
      app.chageStage(2);
    }else{
      app.joinChat();
    }
  }
});
    