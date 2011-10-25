var sys = require('sys');
var http = require('http');
var auth = require('./jsoauth/auth');
var TwitterNode = require('twitter-node').TwitterNode;

var config, streamer;
var streamer_timeout = 0;
var error_count = 0;

exports.stream = function(o) {
  config = o;
  
  var track = build_hashtags();
  
  streamer = new TwitterNode({
    user: config.user, 
    password: config.password,
    track: track
  });
  
  streamer.addListener('tweet', function(tweet) {
    console.log(tweet.text);
    handleIncomingTweet(tweet);
  });
  
  streamer.addListener('error', function() {
    console.log('Stream error, will reconnect...');
    setTimeout(handleDisconnect, config.backoff);
  });
  
  streamer.addListener('end', function(rsp) {
    console.log('Stream ended; will reconnect...', rsp.statusCode);
    
    if(rsp.statusCode >= 400) {
      setTimeout(handleDisconnect, config.backoff);
    } else {
      setTimeout(handleDisconnect, config.disconnect);
    }
  });
  
  streamer.stream();
  
  console.log('Streaming >', sys.inspect(track));
  
  return this;
};

var handleDisconnect = function() {
  console.log('Reconnecting NOW');
  streamer.stream();
}

var handleIncomingTweet = function(tweet) {
  var kb_url = "";
  
  if(tweet.text.search(/#thegame_sxsw/i) != -1) {
    kb_url = "http://sxsw.rightnowdemo.com/app/answers/detail/a_id/123";
  } else {
    kb_url = build_knowledgebase_url(tweet);
  }
  
  if(kb_url) {
    bitly_shorten(kb_url, function(rsp) {
      var short_url = (rsp && rsp.status_txt == 'OK') ? rsp.data.url : kb_url;
      
      var status = random_response(tweet.user.screen_name, short_url)
      while(status.length > 140) {
        status = random_response(tweet.user.screen_name, short_url);
      }
      
      twitter_updateStatus( {status:status, in_reply_to_status_id:tweet.id_str}, function(obj) {
        sys.puts(sys.inspect(obj))
      });
    });
  }
}

var twitter_updateStatus = function(args, callback) {
  var twttr = {};
  twttr.host = 'api.twitter.com';
  twttr.resource = '/1/statuses/update.json';
  twttr.action = 'http://' + twttr.host + twttr.resource;
  
  var parameters = [];
  parameters.push(['status', args.status]);
  
  if(args.in_reply_to_status_id) {
    parameters.push(["in_reply_to_status_id", args.in_reply_to_status_id]);
  }
  
  var accessor = {};
  accessor.consumerKey = config.consumer_key;
  accessor.consumerSecret = config.consumer_secret;
  accessor.token = config.access_token_key;
  accessor.tokenSecret = config.access_token_secret;
  
  var rsp = auth.makeRequest({
    host: twttr.host,
    resource: twttr.resource,
    action: twttr.action,
    method: 'POST',
    accessor: accessor,
    parameters: parameters,
    callback: callback
  });
};

var bitly_shorten = function(longUrl, callback) {
  if(!config.bitly_login || !config.bitly_apiKey) {
    callback(null);
    return;
  }
  
  var query_string = http_build_query({
    format: 'json',
    domain: 'j.mp',
    longUrl: longUrl,
    login: config.bitly_login,
    apiKey: config.bitly_apiKey
  });
  
  var host = 'api.bit.ly';
  var resource = '/v3/shorten' + '?' + query_string
  
  var bitly = http.createClient(80, host);
  var request = bitly.request('GET', resource, {'host': host});
  request.end();
  request.on('response', function (response) {
    response.setEncoding('utf8');
    response.on('error', function() {
      if(callback && typeof callback == 'function') {
        callback(null);
      }
    });
    response.on('data', function (chunk) {
      var data = JSON.parse(chunk); 
      if(callback && typeof callback == 'function') {
        callback(data);
      }
    });
  });
};

var build_hashtags = function() {
  var tags = [];
  
  for(var n in config.track) {
    tags.push(config.track[n]['hash'])
  }
  
  return tags;
}

var build_knowledgebase_url = function(tweet) {
  var kb = inferTweetText(tweet.text);
  return (kb)
    ? kb.url +'?'+ http_build_query(kb.params)
    : null;
}

var inferTweetText = function(text) {
  var text_no_hashtag = text.replace(/[#]+[A-Za-z0-9-_]+/i, '').replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/['"]/g,'');
  
  // ignore tweets with a URL. (#thegame_sxsw http://twitpic.com/abc123)
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/; 
  if(text.search(regexp) != -1) {
    return null;
  }
  
  for(var n in config.track) {
    var cat = config.track[n];
    if(text.search(cat.search_hash) != -1) {
      var params = {q: text_no_hashtag};
      
      if(cat.id) {
        params.cat = cat.id;
      }
      
      return {url: cat.kb, params: params}
    }
  }
  
  return null;
}

var http_build_query = function(params) {
  var query = [];
  for(var n in params) {
    query.push(n +'='+ encodeURIComponent(params[n]))
  }
  return query.join('&');
}

var random_response = function(username, url) {
  var ret = "{header} {message} {url} {footer}";
      ret = ret.replace('{header}', get_header());
      ret = ret.replace('{username}', username);
      
      // help_raven
      ret = ret.replace('{message}', get_message());
      // thegame_raven
      // ret = ret.replace('{message}', get_game_message());
      
      ret = ret.replace('{url}', url);
      ret = ret.replace('{footer}', get_footer());
  
  return ret;
}

var get_header = function() {
  var options = [
    "How's it going @{username}?",
    "Well hello @{username}!",
    "Hey there @{username}!",
    "Good day @{username}!",
    "Yo @{username}!",
    "What's up @{username}?",
    "Oi @{username}!",
    "Namaste @{username} -",
    "Ahoy @{username}!",
    "Hey @{username}!",
    "Hi there @{username} -"
  ];
  
  return options[Math.floor(Math.random()*options.length)];
}

var get_message = function() {
  var options = [
    "That’s a good question, and I have the answer",
    "The million dollar question, here’s your answer",
    "Ask and you shall receive this answer",
    "Really want to know? Here you go",
    "I really shouldn’t tell you but, here goes",
    "Lucky for you, I have ALL the answers",
    "You've definitely come to the right place",
    "I'm glad you asked. Here's the answer",
    "I happen to have the answer right here",
    "Here's an answer to your question",
    "I found this for you",
    "Here's what you're looking for"
  ];
  
  return options[Math.floor(Math.random()*options.length)];
}

var get_game_message = function() {
  return ""
}

var get_footer = function() {
/*
  var options = [
    "#RightNow signing off",
    "Special thanks to #RightNow",
    "A #RightNow Service",
    "This has been an #RightNow Experience",
    "#RightNow says come back anytime",
    "Answers Sponsored by #RightNow",
    "Powered by #RightNow"
  ];
  
  return options[Math.floor(Math.random()*options.length)];
*/
  // return "Powered by #RightNow";
  return "#rightnow"
}
