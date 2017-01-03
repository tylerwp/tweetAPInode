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


    // max characters for twitter text area
    //
    var maxLength = 140;
    $('#tweet-textarea').keyup(function (e) {
        var length = $(this).val().length;
        var length = maxLength - length;
        $('#tweet-char').text(length);
        if(length < 0){
            $('#tweet-char').addClass('overRed');
        }else{
            $('#tweet-char').removeClass('overRed');
        }

        // enter key pressed
        if(e.which === 13){
            postTweet($('#tweet-textarea').value);
        }

    });

    $('.button-primary').on('click',function(event){
         event.preventDefault();
         postTweet($('#tweet-textarea').val());
    });
   
    function postTweet(message){
        console.log(message);
        $.post('/statuses/update/',{tweet:message},function(){

        })
        .done(function(){
            //update timeline view
        });
    }


});
