const express = require('express');
const Game = require("./gamemodule");
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const {instrument} = require("@socket.io/admin-ui");
const port = 80;
const consoleStamp =require('console-stamp')(console, '[HH:MM:ss]');
const io = new Server(server);
instrument(io, {
    auth: {
        type: "basic",
        username: process.env.ADMINPANEL_USER,
        password: require('bcrypt').hashSync(process.env.ADMINPANEL_PASS, 10)
    }
});  
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
let availableRooms = [];
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function generateRoomCode(){
    let roomNumber;
    let validRoomNumber;
    do{
        roomNumber = getRndInteger(100000,999999);
        validRoomNumber = true;
        for(let i = 0; i < availableRooms.length; i++) {
            for(let j = 0; j < availableRooms[i].length; j++){
                if(availableRooms[i][j] == roomNumber){
                    validRoomNumber = false;
                }
            }
        }
    }while(!validRoomNumber);
    return roomNumber;
}
io.on('connection', (socket) => {
    let connectionData = socket.request._query['room'];
    let joinRoomConnection = socket.request._query['join'];
    if(connectionData == "CREATE-ROOM"){
        console.log("A user connected with id: " + socket.id);
        console.log("Creating private game room");
        let roomNumber = generateRoomCode();
        availableRooms.push([roomNumber, socket]);
        console.log("Private room created with code: " + roomNumber);
        socket.emit("room-number", roomNumber);

        socket.on("disconnect", () =>{
            console.log("A user disconnected with id: " + socket.id);
            let delRoom;
            let newAvailableRooms = [];
            for(let i = 0; i < availableRooms.length; i++) {
                if(availableRooms[i][1] != socket){
                    newAvailableRooms.push(availableRooms[i]);
                }else{
                    delRoom = availableRooms[i][0];
                }
            }
            availableRooms = newAvailableRooms;
        });
    }else if(connectionData == "JOIN-ROOM"){
        console.log("A user connected with id: " + socket.id);
        console.log("Joining room: " + joinRoomConnection);
        let validRoom = false;
        for(let i = 0; i < availableRooms.length; i++) {
            if(availableRooms[i][0] == joinRoomConnection){
                validRoom = true;
                const newG = new Game(availableRooms[i][1], socket, io, joinRoomConnection);
                let delRoomAtIndex = i;
                let newAvailableRooms = [];
                for(let j = 0; j < availableRooms.length; j++) {
                    if(j != i){
                        newAvailableRooms.push(availableRooms[j]);
                    }
                }
                availableRooms = newAvailableRooms;
                break;
            }
        }
        if(!validRoom){
            socket.emit("404-room", joinRoomConnection);
            console.log("Room: " + joinRoomConnection + " not found!");
        }else{
            socket.emit("room-number", joinRoomConnection);
        }

        socket.on("disconnect", () =>{
            console.log("A user disconnected with id: " + socket.id);
        });
    }else{
        console.log("A user connected with id: " + socket.id);
        console.log("Random player game");
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
        });
    }
});
