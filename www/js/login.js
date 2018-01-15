$(document).ready(function () {
    loginBtnClickHandler();
    enterKeyHandler();
});

function loginBtnClickHandler(){
    $("#loginBtn").click(function(){
        loginFunction();
        // var salt = "ac6.tdJm#n/sr3xd#%m+EU3mHv<1s#[w--vg6B-u|,jl3V*UHM-L79fc2FyO%z)";
        // var finalPassword = password + salt;
        // var hashedPassword = sha512(finalPassword);
        
    });
}

function loginFunction(){
    var userId = $("#userIdTxt").val();
    var password = $("#passwordTxt").val();
    login(userId, password);
}

async function login(userId,password){
    var methodName = "LoginUser";
    var parameters = { userId : userId, password : password};
    try{
        let data = await ajaxPost(methodName, parameters);
        LoginHandler(data);
    }catch(ex){
        console.log(ex);
    }
}

function LoginHandler(data){
    var result = data.Result;
    if(result === TRUE){
        redirectPageWithoutReturn("/main/FleetDashboard.html");
        
    }else{
        customAlert("Error", "Wrong username or password", false , null);
    }
}

function enterKeyHandler(){
    $("#userIdTxt").bind("keypress", function(e){
        if (e.keyCode === 13) {
            e.preventDefault();
            loginFunction();
        }
    });

    $("#passwordTxt").bind("keypress", function(e){
        if(e.keyCode === 13){
            e.preventDefault();
            loginFunction();
        }
    });
}

