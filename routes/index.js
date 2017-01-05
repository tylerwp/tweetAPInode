'use strict';

var twitterConfig = require('../config.json');
var express = require('express');
var router = express.Router();
var hbs = require('hbs');
var Twitter = require('twitter');
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
            //get hbs partials and return view for each
            var followingUsers = '';
            for(var i = 0; i < follow.users.length; i++) {
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
    // filter messages down to last correspondence 

    //https://dev.twitter.com/rest/reference
    var client = new Twitter(twitterConfig);
    var getJson = req.params.getJson;
    var params = { count: 5 };
    var allMessages = [];
    var returnMessages = ['',''];

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
                    recipient:usrMessages[i].recipient_screen_name,
                    type: 'sender'
                })
            }

            //get messages sent and add them to message object
            client.get('direct_messages/sent', params, function (error, usrMessages, response) {

                if (!error) {

                    for (var i = 0; i < usrMessages.length; i++) {
                        allMessages.push({
                            text: usrMessages[i].text,
                            created_at_str: usrMessages[i].created_at,
                            created_at: Date.parse(usrMessages[i].created_at),
                            sender: usrMessages[i].sender_screen_name,
                            profile_image_url: usrMessages[i].sender.profile_image_url,
                            recipient:usrMessages[i].recipient_screen_name,
                            type: 'me'
                        })
                    }

                    // sort and return results
                    allMessages.sort(function (a, b) { return b.created_at - a.created_at });

                    //filter out message to show only the last correspondence and update "Conversation with" in view.
                    // get last message
                        // if type = sender then filter by sender name
                        // else filter by recipient
                    var conversationWith = '';
                    if(allMessages[0].type == 'sender'){
                        conversationWith = allMessages[0].sender;
                    }else{
                        conversationWith = allMessages[0].recipient;
                    }
                    // add name to return array.
                    returnMessages[1] = conversationWith;

                    var filteredMessages = allMessages.filter(function(value){
                        if(value.type == 'sender'){
                            if(value.sender == conversationWith){
                                return true;
                            }else{
                                return false;
                            }
                        }else{
                            if(value.recipient == conversationWith){
                                return true;
                            }else{
                                return false;
                            }
                        }
                    });

                    for (var i = 0; i < filteredMessages.length; i++) {
                        //create view
                        var messageView = hbs.handlebars.compile('{{> messageView}}');

                        if (filteredMessages[i].type == 'me') {
                            //// return results                        
                            returnMessages[0] += messageView({ message: filteredMessages[i].text, created_at: filteredMessages[i].created_at_str, profile_image_url: filteredMessages[i].profile_image_url, me: '--me' });
                        } else {
                            returnMessages[0] += messageView({ message: filteredMessages[i].text, created_at: filteredMessages[i].created_at_str, profile_image_url: filteredMessages[i].profile_image_url, me: '' });
                        }
                        var test = filteredMessages[i];
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
    
});

// receive post for new tweet status update.
router.post('/statuses/update/', function (req, res) {
    var client = new Twitter(twitterConfig);
    
    var tweet = req.body.tweet;
    var params = { status: tweet };//set params for twitter API
    
    //https://dev.twitter.com/rest/reference/post/statuses/update

    client.post('statuses/update', params, function (error, tweet, response) {
        if (error) throw error;         
        console.log('tweet sent');
    });

    // The request has been fulfilled
      res.status(201).json({tweet:'sent'});

});


module.exports = router;
