let socket = io();
let cover = document.getElementById("cover");
let timer = document.getElementById("timerCount");
let timerDiv = document.getElementsByClassName("timerDiv")[0];
let timerH = timerDiv.getElementsByTagName("h2")[0];
let readyBtn = document.getElementsByClassName("status-span")[0];
let readyBtnOpponent = document.getElementsByClassName("status-span")[1];
let placeTime = 60; // Time to place the ships (in s)
let placeTimerInterval;
let turn = false;
let cellSelected = [];
let turnInterval;
let statusDivs = document.querySelectorAll(`[class^="status-div"`);
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
        timer.innerHTML = `You have <span class="green-span">${minutes}:${seconds}</span> to place ships!`;
    } else if (placeTime <= 20 && placeTime > 10) {
        timer.innerHTML = `You have <span class="orange-span">${minutes}:${seconds}</span> to place ships!`;
    } else if (placeTime <= 10 && placeTime > 0) {
        timer.innerHTML = `You have <span class="red-span">${minutes}:${seconds}</span> to place ships!`;
    } else if (placeTime <= 0) {
        //The time is over
        clearInterval(placeTimerInterval);
        timer.style.visibility = "hidden";
        placeRemainingShips();
        removePlacingListeners();
        readyBtn.click();
        socket.emit("ready");
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
        showWarningAlert("You have to place all ships before getting ready");
    }
});
socket.on("opponent-ready", () =>{
    readyBtnOpponent.style.boxShadow = "-5px 5px 13px 2px rgba(47,255,28,0.6)";
    readyBtnOpponent.innerHTML = "Ready";
});
socket.on("effective-game-start", () =>{
    placeTime = 0;
    statusDivs[0].style.display = "none";
    statusDivs[1].style.display = "none";
    setOpponentTableListeners();
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
socket.on("request-start-data", async () =>{
    await sleep(500);
    socket.emit("start-data", actualTable);
    timerH.innerHTML = "Opponent turn!";
    timerH.style.color = "red";
});
socket.on("turn", () =>{
    turn = true;
    cellSelected = [];
    turnTimerTime = 10;
    timerH.innerHTML = "Is your turn!";
    timerH.style.color = "green";
    turnInterval = setInterval(turnTimer, 1000);
});
socket.on("turn-data-response", (data) =>{
    oTd[cellSelected[0]][cellSelected[1]].classList.add(data);
});
socket.on("mark-mtTd", (response) =>{
    mtTd[response[0]][response[1]].classList.add(response[2]);
});
function sendTurnData(){
    socket.emit("turn-data", cellSelected);
}