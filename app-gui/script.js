document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("check").checked = true;

    const urlParams = new URLSearchParams(window.location.search);
    const games = urlParams.get('games');
    
    if (games === "VAL-LOL") {
        document.getElementById("installed-valorant").style.visibility = "visible";
        document.getElementById("installed-league").style.visibility = "visible";
    } else if (games === "VAL") {
        document.getElementById("installed-valorant").style.visibility = "visible";
    } else if (games === "LOL") {
        document.getElementById("installed-league").style.visibility = "visible";
    }

    const enableState = urlParams.get("enable_state");
    if (enableState === "OFF") {
        document.getElementById("enable").innerHTML = "Service Disabled";
        document.getElementById("check").checked = false;
    } else {
        document.getElementById("enable").innerHTML = "Service Enabled";
        document.getElementById("check").checked = true;
    }

    document.getElementById("check").addEventListener("change", function() {
        if (this.checked) {
            document.getElementById("enable").innerHTML = "Service Enabled";
            window.location.href = "http://localhost:8364/settings/main/enabled/ON";
        } else {
            document.getElementById("enable").innerHTML = "Service Disabled";
            window.location.href = "http://localhost:8364/settings/main/enabled/OFF";
        }
    });
});
