'use strict';
var cfg = require('./config.json');//config for twitter API
var express = require('express');
var Mustache = require('mustache');
var Twitter = require('twitter');
var fs = require('fs');
var twitter = new Twitter();
var app = express();

var client = new Twitter({
    consumer_key: 'h8EpnGe5b7PcaKlj2MY1Ck4ko',
    consumer_secret: 'V1lNlT8kWuUJmBLlOw2QCGAImE8m9rP1sl3nLt3IWmgzp9tMYL',
    access_token_key: '17485833-nySVlvg1GgQpMUzAEMc7wYbMhSBd6qRSR6PvCgVre',
    access_token_secret: 'hrNxCqOmoemeA8Bo0WgfsZEuNRkBmIyGpd0cOEPTn7yRj'
});

// Serving static files in Express - https://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + '/public'));


app.get('/tylerwp', function (req, res) {   

    var params = { screen_name: 'tylerwp' };//set params for twitter API
    // call get to statuses/user_timeline
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            //console.log(tweets);
            var htmlOutput = "";
            // temporary html dom for testing
            var htmlTemplate = "";
            // get template file and store it in var
            fs.readFile(__dirname + '/views/TimelineView.html', 'utf8', function (err, html) {                
                htmlTemplate += html;
                // loop through tweets and render html using Mustache and the template 
                for (var i = 0; i < tweets.length; i++) {
                    
                    var tw = {
                        text: tweets[i].text,
                        created_at: tweets[i].created_at
                    };
                    var output = Mustache.render(htmlTemplate, tw);
                    htmlOutput += output;

                }
                res.send('<html><head><link href="https://fonts.googleapis.com/css?family=Work+Sans:400,600" rel="stylesheet" type="text/css"><link rel="stylesheet" href="css/global.css"></head><body>' + htmlOutput + '</body></html>');
            });


        } else {
            console.log(error);
        }
    });


});


app.get('/', function (req, res) {

    var view = {
        title: "Joe",
        calc: function () {
            return 2 + 4;
        }
    };

    var output = Mustache.render("{{title}} spends {{calc}}", view);
    res.send(output);

});

app.listen(3333, function () {
    console.log('App listing on 3333');
});



// testing 
function testTwitter() {
    var params = { screen_name: 'tylerwp' };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log(tweets);
        } else {
            console.log(error);
        }
    });
}


function TimelineHTML(tweet) {


    var tw = {
        title: "Joe",
        calc: function () {
            return 2 + 4;
        }
    };

    var output = Mustache.render("{{title}} spends {{calc}}", view);
    res.send(output);


}



