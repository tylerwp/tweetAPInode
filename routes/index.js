var cfg = require('../config.json');
var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var Twitter = require('twitter');
var fs = require('fs');
var path = require('path');


//var client = new Twitter(cfg);


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {});
});


hbs.registerHelper('timeLine','{{> timelineView}}');

hbs.registerHelper('following', '<strong>test test test</strong>');

hbs.registerHelper('directMessage', '<strong>test test test</strong>');

//twitter stream
    //socket io 
//var stream = client.stream('statuses/filter', {track: 'lego'});
//stream.on('data', function(event) {
 // console.log(event && event.text);
//});
 
//stream.on('error', function(error) {
//   console.log(error);
//});




function getTimeline() {
    // call twitter API

    // ISSUE.... not getting rendered to the view as its non-blocking---------------------------------
    var params = { screen_name: 'tylerwp' };//set params for twitter API
    var htmlOutput = "";
    // call get to statuses/user_timeline
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            console.log('Connected...Last tweet: ' + tweets[0].created_at);

            // temporary html dom for testing
            var htmlTemplate = "";
            // get template file and store it in var           
            fs.readFile(path.join(__dirname, '../views/TimelineView.html'), 'utf8', function (err, html) {
                htmlTemplate += html;
                // loop through tweets and render html using handlebars and the template 
                for (var i = 0; i < tweets.length; i++) {

                    var tw = {
                        text: tweets[i].text,
                        created_at: tweets[i].created_at
                    };
                    // here we take the html template and add the data                 

                    var template = hbs.handlebars.compile(htmlTemplate);
                    htmlOutput += template(tw);

                }

            });
            return htmlOutput;

        } else {
            console.log(error);
        }
    });
    //---------------------------------------------------------------------------------------------------------
}


module.exports = router;
