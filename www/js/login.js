$(document).ready(function () {
    loginBtnClickHandler();
    enterKeyHandler();
});

function loginBtnClickHandler() {
    $("#loginBtn").click(function () {
        loginFunction();
        // var salt = "ac6.tdJm#n/sr3xd#%m+EU3mHv<1s#[w--vg6B-u|,jl3V*UHM-L79fc2FyO%z)";
        // var finalPassword = password + salt;
        // var hashedPassword = sha512(finalPassword);

    });
}

function loginFunction() {
    var userId = $("#userIdTxt").val();
    var password = $("#passwordTxt").val();
    login(userId, password);
}

async function login(userId, password) {
    var methodName = "LoginUser";
    var parameters = { userId: userId, password: password };
    try {
        let data = await ajaxPost(methodName, parameters);
        LoginHandler(data);
    } catch (ex) {
        console.log(ex);
    }
}

function LoginHandler(data) {
    var result = data.LoginResult;
    if (result === true) {
        sessionStorage.setItem("userId", data.UserId);
        sessionStorage.setItem("timezone", data.Timezone);
        resetConstArrays();
        GetUserRelatedFleetAndVessels();
    } else {
        customAlert("Error", "Wrong username or password", false, null);
    }
}

async function GetUserRelatedFleetAndVessels() {
    var method = "GetUserRelatedFleetAndVessels";
    var parameters = PARAMETER_USERID;
    try {
        let data = await ajaxGet(method, parameters);
        storeFleetAndVesselsForDropDownList(data);
    } catch (ex) {
        console.log(ex);
    }

}

function storeFleetAndVesselsForDropDownList(data) {
    let fleetObjArray = [];
    let fleetVesselObjArray = [];
    for (let i = 0; i < data.length; i++) {
        let resultArray = data[i];
        let fleetSplitString = data[i].Key.split("-");
        let vesselList = data[i].Result.split(";");

        let fleetId = fleetSplitString[0];
        let fleetName = fleetSplitString[1];
        let fleetObj = { fleetId: fleetId, fleetName: fleetName };
        let fleetVesselObj = { fleetId: fleetId, vesselList: data[i].Result };

        fleetObjArray.push(fleetObj);
        fleetVesselObjArray.push(fleetVesselObj)
    }

    fleetObjArray.sort(function (a, b) {
        return a.fleetName.localeCompare(b.fleetName);
    });
    
    sessionStorage.setItem("fleetObj" , JSON.stringify(fleetObjArray));
    sessionStorage.setItem("fleetVesselObj" , JSON.stringify(fleetVesselObjArray));

    redirectPageWithoutReturn("/main/FleetDashboard.html");
}

function enterKeyHandler() {
    $("#userIdTxt").bind("keypress", function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            loginFunction();
        }
    });

    $("#passwordTxt").bind("keypress", function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            loginFunction();
        }
    });
}

