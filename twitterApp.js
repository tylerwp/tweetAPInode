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

app.use('/', index);

http.listen(3333, function () {
    console.log('App listing on 3333');
});

hbs.registerPartials(path.join(__dirname, './views/partials'), function (res) {
    // var test = res;
    //  var timel = hbs.handlebars.compile('{{> timelineView}}');
    //  var outt = timel({text:'hello!'});
});


socketIO.on('connection', function (socket) {
    console.log('a user connected');
    
});


function testStream() {

    //twitter stream https://dev.twitter.com/streaming/reference/post/statuses/filter
    //socket io 
    //var stream = client.stream('user', {Name: 'tylerwp'});
    var stream = client.stream('statuses/filter', { track: 'lego' });
    stream.on('data', function (event) {
        // console.log(event && event.text);
        var timelineView = hbs.handlebars.compile('{{> timelineView}}');
        socketIO.emit('tweet', timelineView({ text: event.text }));
        //console.log(timelineView({text:event.text}));
    });

    stream.on('error', function (error) {
        console.log(error);
    });
}



