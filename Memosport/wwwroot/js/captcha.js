$(document).ready( function() {
     createCaptchaImg();

     /*
      * captchaBttn
      */

     $('.captcha-bttn').click( function() {
        createCaptchaImg();
     });
});

function createCaptchaImg() {
    obj = {reqOption : 5};

    $.ajax({
       url: '/captcha/',
       type: 'post',
       data: obj,
       dataType: 'json',
       success: function(data) {
                // captcha Bild erzeugen
                $('.captcha-img').html('<img src="data:image/png;base64,'+ data.arr.captchaImg + '" alt="letters" />');

                // captcha letter erzeugen
                $('.captcha-letters').val(data.arr.captchaLetters);
       },
       error: function() {
       }
    });
}