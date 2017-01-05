'use strict';

var cfg = require('./config.json');
var express = require('express');
var path = require('path');
var app = express();
var hbs = require('hbs');
var Twitter = require('twitter');
var http = require('http').Server(app);
var socketIO = require('socket.io')(http);

var client = new Twitter(cfg);

// routes
var index = require('./routes/index');

// Serving static files in Express - https://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// register handlebars partials
hbs.registerPartials(path.join(__dirname, './views/partials'));

//setup route
app.use('/', index);

// start http server
http.listen(3333, function () {
    console.log('App listing on 3333');
});


// socket.io for realtime updates ----------------------------------------------------------------
// provide timeline updates when a new tweet is created.
socketIO.on('connection', function (socket) {
    console.log('socket.io: a user connected');

});

//twitter stream https://dev.twitter.com/streaming/reference/post/statuses/filter    

var params = { follow: cfg.twitter_userID };
var stream = client.stream('statuses/filter', params);
stream.on('data', function (event) {
    console.log('received twitter stream data.');
    socketIO.emit('tweet', event);
    console.log('socket.io tweet emit sent: ' + event.text);
});

stream.on('error', function (error) {
    console.log(error);
});
// ----------------------------------------------------------------------------------------------





