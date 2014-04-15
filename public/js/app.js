var app = {};

$( document ).ready(function() {
  app.connect();
});

app.timers = {};

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

      app.loadMyAvatar();
    }
  });
}

app.loadMyAvatar = function(){
  app.loadAvatar(app.id, function(url){
    app.avatar = url;
    setTimeout(function(){
      $('.myAvatar').attr('src', app.avatar);
    }, 100)
  });
}

app.chageStage = function(stage){
  stage = parseInt(stage);
  $('.stageContainer').hide();
  $('#stage' + stage).fadeIn();
  window.location.hash = "#" + stage;
  app.stageChanged(stage);
  setTimeout(function(){
    app.loadMyAvatar();
  }, 1001)
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

app.startChat = function(venueId){
  app.venueId = venueId;
  app.chageStage(3);
  app.client.action('roomAdd', {venueId: app.venueId}, function(data){
    app.joinChat();
  });
}

app.joinChat = function(venueId){
  if(app.QueryString()['venueId'] == null){
    var parts = window.location.href;
    var url = parts.split("#")[0] + "?venueId=" + app.venueId + "#3";
    window.history.pushState("", "", url);
  }
  app.client.roomChange(app.venueId);
  app.roomDetails();
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
      if( $("#venueName").html() == "X" ){
        app.venueDetails(app.venueId, function(details){
          $("#venueName").html(details.name);
        });
      }
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
  });

  if(message.from != app.id && message.welcome == null){
    var audio = new Audio('/audio/button-11.mp3');
    audio.play();
  }else if(message.welcome == null){
    var audio = new Audio('/audio/button-19.mp3');
    audio.play();
  }
  
}

app.showVenues = function(){
  app.getLocation(function(lat, lon){
    app.client.action('venues', {lat: lat, lon: lon}, function(data){
      $('#venuesList').html('')
      data.venues.forEach(function(l){
        html = ""
        html += "<button class=\"btn btn-warning locationButton\" onClick=\"app.startChat('"+l.id+"')\">" + l.name + "</button>"
        $('#venuesList').append(html)
      })
    });
  });
}

app.venueDetails = function(venueId, callback){
  app.client.action('venueDetails', {venueId: venueId}, function(data){
    callback(data.venue)
  })
}

app.stageChanged = function(stage){
  if(stage === 2){
    if(app.QueryString()['venueId'] != null){
      app.startChat(app.QueryString()['venueId']);
    }else{
      app.showVenues();
    }
  }
  if(stage === 3){
    if(app.venueId == null){
      app.chageStage(2);
    }else{
      app.joinChat();
    }
  }
}
    