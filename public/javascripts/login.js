onDemoLogin = () => {
    $('#email').val('demo@reminderai.com').trigger('change');
    $('#password').val('demo').trigger('change');
    $('.submit-btn').click();
}