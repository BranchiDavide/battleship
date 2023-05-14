let player1;
let player2;
let room;
let io;
function startGame(socket1, socket2, io){
    room = socket1.id;
    socket2.join(room);
    console.log("Game started in room: " + room);
    player1 = socket1;
    player2 = socket2;
    io.to(room).emit("game-start");
    setDisconnectEvent();
    setReadyEvent();
}
function setDisconnectEvent(){
    player1.on("disconnect", () =>{
        player2.emit("opponent-disconnect");
        player2.disconnect();
    });
    player2.on("disconnect", () =>{
        player1.emit("opponent-disconnect");
        player1.disconnect();
    });
}
function setReadyEvent(){
    player1.on("ready", () =>{
        player2.emit("opponent-ready");
    });
    player2.on("ready", () =>{
        player1.emit("opponent-ready");
    });
}
module.exports = { startGame };