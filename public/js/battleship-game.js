let socket = io();
let cover = document.getElementById("cover");
let timer = document.getElementById("timerCount");
let timerDiv = document.getElementsByClassName("timerDiv")[0];
let readyBtn = document.getElementsByClassName("status-span")[0];
let readyBtnOpponent = document.getElementsByClassName("status-span")[1];
let placeTime = 60; // Time to place the ships (in s)
let placeTimerInterval;
socket.on("game-start", () => {
    cover.style.display = "none";
    placeTimerInterval = setInterval(placeTimer, 1000);
});
let redirectionTime = 5;
let redirectInterval;
socket.on("opponent-disconnect", () => {
    redirectInterval = setInterval(opponentDisconnect, 1000);
});
function placeTimer() {
    let minutes = Math.floor(placeTime / 60);
    let seconds = placeTime % 60;
    timerDiv.style.visibility = "visible";
    if (placeTime > 20) {
        timer.innerHTML = `You have <span class="green-span">${minutes}:${seconds}</span> to place the ships!`;
    } else if (placeTime <= 20 && placeTime > 10) {
        timer.innerHTML = `You have <span class="orange-span">${minutes}:${seconds}</span> to place the ships!`;
    } else if (placeTime <= 10 && placeTime > 0) {
        timer.innerHTML = `You have <span class="red-span">${minutes}:${seconds}</span> to place the ships!`;
    } else if (placeTime <= 0) {
        //The time is over
        clearInterval(placeTimerInterval);
        timer.style.visibility = "hidden";
        placeRemainingShips();
        removePlacingListeners();
    }
    placeTime--;
}
//Ready button click event
readyBtn.addEventListener("click", function readyEvent(){
    if(placedShips.length == ships.length){
        //All the ships have been placed
        readyBtn.style.boxShadow = "-5px 5px 13px 2px rgba(47,255,28,0.6)";
        readyBtn.innerHTML = "Ready";
        removePlacingListeners();
        socket.emit("ready");
        this.removeEventListener("click", readyEvent);
    }else{
        alert("You have to place all ships before getting ready");
    }
});
socket.on("opponent-ready", () =>{
    readyBtnOpponent.style.boxShadow = "-5px 5px 13px 2px rgba(47,255,28,0.6)";
    readyBtnOpponent.innerHTML = "Ready";
});