function join() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      window.location.href = `http://localhost:1234/${code}`;
    }
}
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code === "UNKNOWNPARTYCODE") {
    document.getElementById("title").innerHTML ="Invalid - User might not be Party Leader";
    document.getElementById("description").innerHTML ="The Script of the User couldn't generate a party code. Please join normally.";
} else {
    document.getElementById("code").innerHTML = code;
}
