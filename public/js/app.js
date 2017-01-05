$(document).ready(function () {


    //ajax get /following and place it in app--user--list
    $.get('/following', function (data, status) {
        $('.app--user--list').html(data);
        //console.log(data);
    });

    //ajax get /direct messages and place it in app--message--conversation
    $.get('/directMsg', function (data, status) {
        $('.app--message--conversation').html(data[0]);
        $('.app--message--list h3 a').html(data[1]);
        //console.log(data);
    }).done(function () {
        // update time ago
        jQuery("time.timeago").timeago();
    });

    $.get('/userTimeline', function (data, status) {
        $('.app--tweet--list').html(data);
        //console.log(data);
    }).done(function () {
        // update time ago
        // jQuery("time.timeago").timeago();
    });


    // max characters for twitter text area
    //
    var maxLength = 140;
    $('#tweet-textarea').keyup(function (e) {
        var length = $(this).val().length;
        length = maxLength - length;
        $('#tweet-char').text(length);
        if (length < 0) {
            $('#tweet-char').addClass('overRed');
        } else {
            $('#tweet-char').removeClass('overRed');
        }

        // enter key pressed
        if (e.which === 13) {
            postTweet($('#tweet-textarea').val());
        }

    });

    $('.button-primary').on('click', function (event) {
        event.preventDefault();
        postTweet($('#tweet-textarea').val());
    });

    function postTweet(message) {
        // console.log(message);
        if (message.length > 0) {
            $.post('/statuses/update/', { tweet: message }, function (data) {
                //Tweet sent, clear textarea
                console.log('tweet sent');
                $('#tweet-textarea').val('');

                //ajax get /following and place it in app--user--list
                $.get('/following', function (data, status) {
                    $('.app--user--list').html(data);
                    //console.log(data);
                });


            });

        } else {
            // field required
            console.log('Error: no data.');
        }
    }


});

var socket = io();
socket.on('tweet', function (msg) {
    var tweet = msg.text;

    console.log('Socket.io emit tweet: ' + tweet);
   
    //ajax update user Timeline
    $.get('/userTimeline', function (data, status) {
        $('.app--tweet--list').html(data);
        console.log('Timeline updated.');
    }).done(function () {
        // update time ago
        // jQuery("time.timeago").timeago();
    });

});
