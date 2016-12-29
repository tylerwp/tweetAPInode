var twitterConfig = require('../config.json');
var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var Twitter = require('twitter');
var fs = require('fs');
var path = require('path');


//var client = new Twitter(twitterConfig);


/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {});
});

//route for user following
router.get('/following/:getJson?', function (req, res, next) {
    //get twitter user followers and return json or html
    //https://dev.twitter.com/rest/reference
    var client = new Twitter(twitterConfig);
    var getJson = req.params.getJson;
    var params = { screen_name: twitterConfig.screen_name, count: 5 };
    client.get('friends/list', params, function (error, follow, response) {
        if (!error) {
            //console.log(follow);           
            //get hbs partials and return view for each
            var followingUsers = '';
            for (var i = 0; i < follow.users.length; i++) {
                var followingView = hbs.handlebars.compile('{{> followingView}}');
                var userFollowing = followingView({ userName: follow.users[i].name, userID: follow.users[i].screen_name });
                followingUsers += userFollowing;
            }
            //send json or html depending on route parameter
            if (getJson == 'json') {
                res.send(follow);
            } else {
                res.send(followingUsers);
            }

        } else {
            console.log(error);
        }
    });
});


//route for user direct messages
router.get('/directMsg/:getJson?', function (req, res, next) {
    //get twitter user direct messages
    /*ISSUE...
    
        need to call both GET direct_messages, GET direct_messages/sent
        create new array from them then sort by the new array by date
        //sort the by date -> array.sort(function(a,b){return a.getTime() - b.getTime()});

    */
    //https://dev.twitter.com/rest/reference
    var client = new Twitter(twitterConfig);
    var getJson = req.params.getJson;
    var params = { count: 5 };
    var allMessages = [];
    var returnMessages = '';

    // get messages received and add them to message object
    client.get('direct_messages', params, function (error, usrMessages, response) {
        if (!error) {


            for (var i = 0; i < usrMessages.length; i++) {
                allMessages.push({
                    text: usrMessages[i].text,
                    created_at_str: usrMessages[i].created_at,
                    created_at: Date.parse(usrMessages[i].created_at),
                    sender: usrMessages[i].sender_screen_name,
                    type: 'sender'
                })
            }

            //get messages sent and add then to message object
            client.get('direct_messages/sent', params, function (error, usrMessages, response) {

                if (!error) {

                    for (var i = 0; i < usrMessages.length; i++) {
                        allMessages.push({
                            text: usrMessages[i].text,
                            created_at_str: usrMessages[i].created_at,
                            created_at: Date.parse(usrMessages[i].created_at),
                            sender: usrMessages[i].sender_screen_name,
                            type: 'me'
                        })
                    }

                    // sort and return results
                    allMessages.sort(function (a, b) { return a.created_at - b.created_at });
                    for (var i = 0; i < allMessages.length; i++) {
                        //create view
                        var messageView = hbs.handlebars.compile('{{> messageView}}');

                        if (allMessages[i].type == 'me') {
                            //// return results                        
                            returnMessages += messageView({ message: allMessages[i].text, created_at: allMessages[i].created_at_str, me: '--me' });
                        } else {
                            returnMessages += messageView({ message: allMessages[i].text, created_at: allMessages[i].created_at_str, me: '' });
                        }
                        var test = allMessages[i];
                    }
                    res.send(returnMessages);

                } else {
                    console.log(error);
                }

            });




        } else {
            console.log(error);
        }
    });








});





//hbs.registerHelper('timeLine', '{{> timelineView}}');

//hbs.registerHelper('following', '<strong>test test test</strong>');

//hbs.registerHelper('directMessage', '<strong>test test test</strong>');

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
