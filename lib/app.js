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
    {hash: '#ravendev', search_hash: /#ravendev/i, id: '35', kb: 'http://mavensports.com/orcl/dev/leaderboard.php'},
  ];
  
  // commander.stream({
  //   track: track,
  //   user: process.env.TWITTER_USERNAME,
  //   password: process.env.TWITTER_PASSWORD,
  //   consumer_key: process.env.TWITTER_CONSUMER_KEY,
  //   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  //   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  //   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  //   bitly_login: process.env.BITLY_LOGIN,
  //   bitly_apiKey: process.env.BITLY_KEY,
  //   backoff: 10000,
  //   disconnect: 1000
  // });
  
  commander.stream({
    track: track,
    user: 'rightnowpgx',
    password: 'rightnow4you',
    consumer_key: '3UPq2PyQCIusQinrrS1jA',
    consumer_secret: '7mZsCeVtLttxW4sBpq1LCE5p1O7McaFlODxW2L7ex0',
    access_token_key: '263529474-bFzFaaPbenmLAq2XVHf8u7HmHEBLsulzaqOF6wGq',
    access_token_secret: 'aUv5AU728jqaKk86FowvP9ZL9XhJ5KGVDaEVeYVA4c',
    bitly_login: 'rightnowbitly',
    bitly_apiKey: 'R_a22d4e5648ecc61a2f7a9ebe37078d2e',
    backoff: 10000,
    disconnect: 1000
  });
}
