let socket = io();
let cover = document.getElementById("cover");
let timer = document.getElementById("timerCount");
let timerDiv = document.getElementsByClassName("timerDiv")[0];
let placeTime = 60; // Time to place the ships (in s)
let placeTimerInterval;
socket.on("game-start", () =>{
    cover.style.display = "none";
    placeTimerInterval = setInterval(placeTimer, 1000);
});
let redirectionTime = 5;
let redirectInterval;
socket.on("opponent-disconnect", () =>{
    redirectInterval = setInterval(opponentDisconnect, 1000);
});
function opponentDisconnect(){
    if(redirectionTime > 0){
        cover.getElementsByTagName("h1")[0].innerHTML = `The opponent has disconnected<br>Redirection to homepage in ${redirectionTime}s`;
        cover.getElementsByTagName("h1")[0].style.color = "red";
        cover.style.display = "flex";
        redirectionTime--;
    }else{
        cover.getElementsByTagName("h1")[0].innerHTML = `The opponent has disconnected<br>Redirection to homepage in ${redirectionTime}s`;
        clearInterval(redirectInterval);
        window.location.href = "/";
    }
}
function placeTimer(){
    let minutes = Math.floor(placeTime / 60);
    let seconds = placeTime % 60;
    timerDiv.style.display = "block";
    if(placeTime > 20){
        timer.innerHTML = `You have <span class="green-span">${minutes}:${seconds}</span> to place the ships!`;
    }else if(placeTime <= 20 && placeTime > 10){
        timer.innerHTML = `You have <span class="orange-span">${minutes}:${seconds}</span> to place the ships!`;
    }else if(placeTime <= 10 && placeTime > 0){
        timer.innerHTML = `You have <span class="red-span">${minutes}:${seconds}</span> to place the ships!`;
    }else if(placeTime <= 0){
        clearInterval(placeTimerInterval);
        timer.style.display = 'none';
        removePlacingListeners();
    }
    placeTime--;
}
//Remove the listeners
function removePlacingListeners(){
    for(let i = 0; i < elementsListeners.length; i += 2){
        elementsListeners[i].removeEventListener("click", elementsListeners[i+1]);
    }
    shipSelected.classList.remove("ship-selected");
    for(let icon of removeIcons){
        icon.style.display = "none";
    }
}