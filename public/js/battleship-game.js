/**
 * Script per gestire la comunicazione con il server durante la partita
 * tramite i WebSocket.
 * 
 * @author Davide Branchi
 */
let nick = sessionStorage.getItem("nick")
if(nick == null){
    nick = "Unknown player"
}
let socket = io({query:{room: sessionStorage.getItem("room"), join: sessionStorage.getItem("join")}});
let cover = document.getElementById("cover");
let roomDiv = document.getElementsByClassName("roomDiv")[0];
let roomSpan = document.getElementsByClassName("roomSpan")[0];
let coverH1 = cover.getElementsByTagName("h1")[0];
let coverImg = cover.getElementsByTagName("img")[0];
let timer = document.getElementById("timerCount");
let timerDiv = document.getElementsByClassName("timerDiv")[0];
let timerH = timerDiv.getElementsByTagName("h2")[0];
let readyBtn = document.getElementsByClassName("status-span")[0];
let readyBtnOpponent = document.getElementsByClassName("status-span")[1];
let nickDiv = document.getElementsByClassName("nick-div")[0];
let opponentNick = document.getElementsByClassName("opp-nick-span")[0];
let personalNick = document.getElementsByClassName("nick-span")[0];
let winDiv = document.getElementById("winDiv");
let loseDiv = document.getElementById("loseDiv");
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
socket.on("room-number", (roomNumber) => {
    roomDiv.style.display = "block";
    roomSpan.innerHTML = roomNumber;
});
socket.on("404-room", (roomNumber) => {
    showErrorAlertSub(`Room "` + roomNumber + `" not found!`, "Redirection to homepage in 5s");
    setTimeout(() =>{
        window.location.href = "/";
    }, 5000);
});
socket.on("show-nick", (nickOpponent) => {
    nickDiv.style.display = "block";
    personalNick.innerHTML = nick;
    opponentNick.innerHTML = nickOpponent;
});
socket.on("request-nick", ()=>{
    socket.emit("send-nick", nick);
});
let redirectionTime = 5;
let redirectInterval;
socket.on("opponent-disconnect", () => {
    redirectInterval = setInterval(opponentDisconnect, 1000);
});
/**
 * Funzione per gestire il timer per piazzare le navi all'inizio della partita.
 */
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
/**
 * Funzione per inviare i dati del turno al server (cella selezionata sulla tabella dell'avversario)
 */
function sendTurnData(){
    socket.emit("turn-data", cellSelected);
}
socket.on("win", () =>{
    coverH1.style.display = "none";
    timerDiv.visibility = "hidden";
    coverImg.style.display = "none";
    cover.style.display = "flex";
    winDiv.style.display = "block";
});
socket.on("lose", () =>{
    coverH1.style.display = "none";
    timerDiv.visibility = "hidden";
    coverImg.style.display = "none";
    cover.style.display = "flex";
    loseDiv.style.display = "block";
});