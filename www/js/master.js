$(document).ready(function () {
    loadJS_ByPage();
});

function loadJS_ByPage() {
    let currentPage = getCurrentPage().toLowerCase();
    injectDynamicJavascript("global.js");

    switch (currentPage) {
        case "login":
            injectDynamicJavascript("login.js");
            break;

        case "fleetdashboard":
            injectDynamicJavascript("fleetdashboard.js");
            break;

        case "vesseldashboard":
            injectDynamicJavascript("vesseldashboard.js");
            break;

        case "analogreading":
            injectDynamicJavascript("analogreading.js");
            break;

        case "fuelcons":
            injectDynamicJavascript("fuelcons.js");
            break;

        case "othersignal":
            injectDynamicJavascript("othersignal.js");
            break;

        case "report":
            injectDynamicJavascript("report.js");
            break;
    }
}

function injectDynamicJavascript(filename) {
    let currentTime = Date.now();
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "../js/" + filename + "?v=" + currentTime;
    document.body.appendChild(script);
}

function getCurrentPage() {
    var currentUrl = window.location.href;
    var lastIndex = currentUrl.lastIndexOf("/");
    var currentPage = currentUrl.substring(lastIndex + 1);
    let result = currentPage.substring(0, currentPage.lastIndexOf("."));
    return result;
}