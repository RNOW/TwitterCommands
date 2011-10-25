var OAuth = require('./oauth').OAuth;

exports.makeRequest = function(args) {
  switch(args.method) {
    case 'POST': 
      return postRequest(args);
    case 'PUT':
      return putRequest(args);
    case 'DELETE':
      return deleteRequest(args);
    case 'GET':
    default:
      return getRequest(args);
  }
  
  return null;
};

var postRequest = function(args) {
  var params = oAuthBuildContent(args.parameters.slice(0));
  var auth = (args.accessor) ? oAuthSignRequest(args) : null;
  var data = oAuthBuildContent(auth.message.parameters);
  
  var http = require('http');
  var twitter = http.createClient(80, args.host); 

  var request = twitter.request('POST', args.resource, {
    'accept': '*/*',
    'user-agent': 'OAuth tc-node',
    'host': args.host,
    'content-length': params.length,
    'content-type': 'application/x-www-form-urlencoded',
    'authorization': auth.header
  }); 
  
  request.write(params); 
  request.end();
  
  var chunks = '';
  request.on('response', function(response) {
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      chunks += chunk;
      try {
        var data = JSON.parse(chunks);
        if(data && args.callback && typeof args.callback == 'function') {
          args.callback(data);
        }
      } catch (Err) {
        return; // continue
      }
    });
  });
}

var oAuthBuildContent = function(content) {
  var components = [];
  for(var i=0, count=content.length; i<count; i++) {
    var item = content[i];
    var key = item[0];
    var value = encodeURIComponent(item[1]);
    
    components.push(key+'='+value);
  }
  return components.join('&');
}

var oAuthSignRequest = function(args) {
  var accessor = args.accessor;
  
  var message = {};
  message.action = args.action || request.url;
  message.method = args.method || 'GET';
  message.parameters = args.parameters || null;
  
  OAuth.setTimestampAndNonce(message);
  OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey);
  OAuth.setParameter(message, "oauth_version", '1.0');
  
  if(accessor.token) {
    OAuth.setParameter(message, "oauth_token", accessor.token);
  }
    
  OAuth.SignatureMethod.sign(message, accessor);
  
  var realm = accessor.realm || '';
  var header = OAuth.getAuthorizationHeader(realm, message.parameters);
  var auth = {message:message, accessor:accessor, header:header};
  
  if(args.debug==true) {
    console.log(auth);
  }
  
  return auth;
}