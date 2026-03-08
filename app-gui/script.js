var bridge;

// Initialize the connection to the Python app
document.addEventListener("DOMContentLoaded", function () {
    if (typeof qt !== 'undefined') {
        new QWebChannel(qt.webChannelTransport, function (channel) {
            bridge = channel.objects.pybridge;
            console.log("Connected to Python bridge");
        });
    } else {
        console.warn("Qt bridge not found. Are you running this in the Python app?");
    }
});

function Enable() {
    if (bridge) {
        bridge.button_clicked();
    } else {
        window.location.href = "https://example.com"
    }
}