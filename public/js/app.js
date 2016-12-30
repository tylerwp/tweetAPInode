$(document).ready(function () {


    //ajax get /following and place it in app--user--list
    $.get('/following', function (data, status) {
        $('.app--user--list').html(data);
        //console.log(data);
    });

    //ajax get /direct messages and place it in app--message--conversation
    $.get('/directMsg', function (data, status) {
        $('.app--message--conversation').html(data);
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

    

});
