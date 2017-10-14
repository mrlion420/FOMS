$(document).ready(function () {
    loginBtnClickHandler();
});

function loginBtnClickHandler(){
    $("#loginBtn").click(function(){
        var userId = $("#userIdTxt").val();
        var password = $("#passwordTxt").val();
        var salt = "ac6.tdJm#n/sr3xd#%m+EU3mHv<1s#[w--vg6B-u|,jl3V*UHM-L79fc2FyO%z)";
        var finalPassword = password + salt;
        var hashedPassword = sha512(finalPassword);
        console.log(hashedPassword);
    });
}


