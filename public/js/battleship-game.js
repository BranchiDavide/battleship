let socket = io();
let cover = document.getElementById("cover");
let timer = document.getElementById("timerCount");
let timerDiv = document.getElementsByClassName("timerDiv")[0];
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
    timerDiv.style.display = "block";
    if (placeTime > 20) {
        timer.innerHTML = `You have <span class="green-span">${minutes}:${seconds}</span> to place the ships!`;
    } else if (placeTime <= 20 && placeTime > 10) {
        timer.innerHTML = `You have <span class="orange-span">${minutes}:${seconds}</span> to place the ships!`;
    } else if (placeTime <= 10 && placeTime > 0) {
        timer.innerHTML = `You have <span class="red-span">${minutes}:${seconds}</span> to place the ships!`;
    } else if (placeTime <= 0) {
        //The time is over
        clearInterval(placeTimerInterval);
        timer.style.display = 'none';
        placeRemainingShips();
        removePlacingListeners();
    }
    placeTime--;
}