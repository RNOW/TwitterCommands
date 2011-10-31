var sys = require('sys');
var express = require('express');
var app = express.createServer();
var commander = require('./commander');

var default_kb = "http://www.rightnow.com/pgx/tweet/";

app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.logger())
  app.use(express.errorHandler({ showStack: true, dumpExceptions: true }))
});

exports.run = function() {
  var port = parseInt(process.env.PORT) || 9393;
  app.listen(port);
  
  console.log('Express server running at: http://localhost:'+port+'/'); 
}

exports.stream = function() {
  var track = [
    {hash: '#help_rightnow', search_hash: /#help_rightnow/i, id: '34', kb: default_kb},
  ];
  
  commander.stream({
    track: track,
    user: process.env.TWITTER_USERNAME,
    password: process.env.TWITTER_PASSWORD,
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    bitly_login: process.env.BITLY_LOGIN,
    bitly_apiKey: process.env.BITLY_KEY,
    backoff: 10000,
    disconnect: 1000
  });
}
