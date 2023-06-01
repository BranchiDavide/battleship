const express = require('express');
const Game = require("./gamemodule");
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const port = 80;
const io = new Server(server);
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) =>{
    res.sendFile(`${__dirname}/public/index.html`);
});
app.get("/game", (req, res) =>{
    res.sendFile(`${__dirname}/public/game.html`);
});
server.listen(port, () =>{
    console.log(`Server listening on port ${port}`);
});

let sockets = [];
io.on('connection', (socket) => {
    console.log("A user connected with id: " + socket.id);
    sockets.push(socket);
    if(sockets.length == 2){
        //Two players connected, the game starts
        const newG = new Game(sockets[0], sockets[1], io);
        sockets = [];
    }
    socket.on("disconnect", () =>{
        console.log("A user disconnected with id: " + socket.id);
        let newSockets = [];
        for(let s of sockets){
            if(s != socket){
                newSockets.push(socket);
            }
        }
        sockets = newSockets;
        console.log("Actual sockets: " + sockets);
    });
    console.log("Actual sockets: " + sockets);
});