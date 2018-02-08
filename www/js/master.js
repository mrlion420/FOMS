$(document).ready(function () {
    loadJS_ByPage();
});

async function loadJS_ByPage() {
    let currentPage = getCurrentPage().toLowerCase();
    await injectDynamicJavascript("global.js");

    switch (currentPage) {
        case "login":
            await injectDynamicJavascript("login.js");
            break;

        case "fleetdashboard":
            await injectDynamicJavascript("fleetdashboard.js");
            break;

        case "vesseldashboard":
            await injectDynamicJavascript("vesseldashboard.js");
            break;

        case "analogreading":
            await injectDynamicJavascript("analogreading.js");
            break;

        case "fuelcons":
            await injectDynamicJavascript("fuelcons.js");
            break;

        case "othersignal":
            await injectDynamicJavascript("othersignal.js");
            break;

        case "report":
            await injectDynamicJavascript("report.js");
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