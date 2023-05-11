let socket = io();
let cover = document.getElementById("cover");
socket.on("game-start", () =>{
    cover.style.display = "none";
});
socket.on("opponent-disconnect", () =>{
    cover.getElementsByTagName("h1")[0].innerHTML = "The opponent has disconnected";
    cover.getElementsByTagName("h1")[0].style.color = "red";
    cover.style.display = "flex";
});