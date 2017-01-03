var twitterConfig = require('../config.json');
var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var Twitter = require('twitter');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var querystring = require("querystring");

//body-parser extracts the entire body portion of an incoming request stream and exposes it on req.body as something easier to interface with.
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


/* GET home page. */
router.get('/', function (req, res, next) {
    // API call to twitter to get user info before render
    var client = new Twitter(twitterConfig);
    var params = { screen_name: twitterConfig.twitter_screen_name };
    client.get('/users/show', params, function (error, user, response) {
        //set background profile image
        var profile_banner_url = 'style="background-image:url(' + user.profile_banner_url + ')"';
        if (!error) {
            res.render('index', { user: user.screen_name, profile_background_image_url: profile_banner_url, profile_image_url: user.profile_image_url, friends_count: user.friends_count });
        } else {
            console.log(error);
        }
    });

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
                var userFollowing = followingView(
                    {
                        userName: follow.users[i].name,
                        userID: follow.users[i].screen_name,
                        profile_image_url: follow.users[i].profile_image_url
                    }
                );
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
    //call both GET direct_messages, GET direct_messages/sent
    //create new array from results then sort by date

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
                    profile_image_url: usrMessages[i].sender.profile_image_url,
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
                            profile_image_url: usrMessages[i].sender.profile_image_url,
                            type: 'me'
                        })
                    }

                    // sort and return results
                    allMessages.sort(function (a, b) { return b.created_at - a.created_at });
                    for (var i = 0; i < allMessages.length; i++) {
                        //create view
                        var messageView = hbs.handlebars.compile('{{> messageView}}');

                        if (allMessages[i].type == 'me') {
                            //// return results                        
                            returnMessages += messageView({ message: allMessages[i].text, created_at: allMessages[i].created_at_str, profile_image_url: allMessages[i].profile_image_url, me: '--me' });
                        } else {
                            returnMessages += messageView({ message: allMessages[i].text, created_at: allMessages[i].created_at_str, profile_image_url: allMessages[i].profile_image_url, me: '' });
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


//route for user timeline
router.get('/userTimeline/:getJson?', function (req, res, next) {

    //https://dev.twitter.com/rest/reference
    var client = new Twitter(twitterConfig);
    var getJson = req.params.getJson;
    var timelineTweets = '';
    var params = { screen_name: twitterConfig.screen_name, count: 5 };//set params for twitter API
    var htmlOutput = "";
    // call get to statuses/user_timeline
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            for (var i = 0; i < tweets.length; i++) {
                var timelineView = hbs.handlebars.compile('{{> timelineView}}');
                timelineTweets += timelineView({
                    text: tweets[i].text,
                    created_at: tweets[i].created_at,
                    name: tweets[i].user.name,
                    screen_name: tweets[i].user.screen_name,
                    favorite_count: tweets[i].favorite_count,
                    retweet_count: tweets[i].retweet_count,
                    profile_image_url: tweets[i].user.profile_image_url
                });
            }

            if (getJson == 'json') {
                res.send(tweets);
            } else {
                res.send(timelineTweets);
            }

        } else {
            console.log(error);
        }
    });
    //---------------------------------------------------------------------------------------------------------
});

router.post('/statuses/update/', function (req, res) {
    var client = new Twitter(twitterConfig);
    //URL encode tweet
    //var tweet = querystring.stringify({query:req.body.tweet + ' #testingAPI'});
    var tweet = req.body.tweet + ' #testingAPI';
    var params = { status: tweet };//set params for twitter API
    //console.log(req.body);
    //https://dev.twitter.com/rest/reference/post/statuses/update

    //!!! Issue sending multiple tweets, could be ajax

    client.post('statuses/update', params, function (error, tweet, response) {
        if (error) throw error;
        console.log(tweet);  // Tweet body. 
        console.log(response);  // Raw response object. 
    });

});


//twitter stream
//socket io 
//var stream = client.stream('statuses/filter', {track: 'lego'});
//stream.on('data', function(event) {
// console.log(event && event.text);
//});

//stream.on('error', function(error) {
//   console.log(error);
//});




module.exports = router;
