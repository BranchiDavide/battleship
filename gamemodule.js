module.exports = class Game{
    constructor(player1, player2, io, castedRoomNumber){
        this.player1 = player1;
        this.player2 = player2;
        this.io = io;
        this.startGame();
        if(castedRoomNumber != null){
            console.log("Game started in room: " + this.room + " ---> " + castedRoomNumber);
        }else{
            console.log("Game started in room: " + this.room);
        }
        this.disconnectListeners();
    }
    startGame(){
        this.room = this.player1.id;
        this.player2.join(this.room);
        this.io.to(this.room).emit("game-start");
        let allReady = 0; //0 players are ready
        let allReadySent = false; //effective-game-start has been already sent
        this.player1.on("ready", () =>{
            this.player2.emit("opponent-ready");
            if(allReady == 1 && !allReadySent){
                this.io.to(this.room).emit("effective-game-start");
                this.effectiveGameStart();
                allReadySent = true;
            }else{
                allReady++;
            }
        });
        this.player2.on("ready", () =>{
            this.player1.emit("opponent-ready");
            if(allReady == 1 && !allReadySent){
                this.io.to(this.room).emit("effective-game-start");
                this.effectiveGameStart();
                allReadySent = true;
            }else{
                allReady++;
            }
        });
    }
    disconnectListeners(){
        this.player1.on("disconnect", () =>{
            this.player2.emit("opponent-disconnect");
            this.player2.disconnect();
        });
        this.player2.on("disconnect", () =>{
            this.player1.emit("opponent-disconnect");
            this.player1.disconnect();
        });
    }
    async effectiveGameStart(){
        this.player1.emit("request-start-data");
        await this.waitForResponse(this.player1, "start-data").then((response) => {
            this.player1Table = response;
        });
        this.player2.emit("request-start-data");
        await this.waitForResponse(this.player2, "start-data").then((response) => {
            this.player2Table = response;
        });
        this.gameLoop();
    }
    waitForResponse(socket, event) {
        return new Promise((resolve, reject) => {
          socket.on(event, (response) => {
            resolve(response);
          });
        });
    }
    async gameLoop(){
        let gameVaild = true;
        let turnSwitch = true;
        while(gameVaild){
            if(turnSwitch){
                this.player1.emit("turn");
                await this.waitForResponse(this.player1, "turn-data").then((response) => {
                    if(response.length != 0){
                        let cellResult =  this.checkCellPlayer2(response[0], response[1]);
                        this.player1.emit("turn-data-response", cellResult);
                        response.push(cellResult);
                        this.player2.emit("mark-mtTd", response);
                        if(this.checkWinForPlayer1()){
                            this.player1.emit("win");
                            this.player2.emit("lose");
                            gameVaild = false;
                        }
                    }
                });
                turnSwitch = !turnSwitch;
            }else{
                this.player2.emit("turn");
                await this.waitForResponse(this.player2, "turn-data").then((response) => {
                    if(response.length != 0){
                        let cellResult = this.checkCellPlayer1(response[0], response[1]);
                        this.player2.emit("turn-data-response", cellResult);
                        response.push(cellResult);
                        this.player1.emit("mark-mtTd", response);
                        if(this.checkWinForPlayer2()){
                            this.player2.emit("win");
                            this.player1.emit("lose");
                            gameVaild = false;
                        }
                    }
                });
                turnSwitch = !turnSwitch;
            }
        }
    }
    checkCellPlayer1(i, j){
        if(this.player1Table[i][j] == "X"){
            this.player1Table[i][j] = "*";
            return "hit-cell";
        }else{
            this.player1Table[i][j] = "M";
            return "miss-cell";
        }
    }
    checkCellPlayer2(i, j){
        if(this.player2Table[i][j] == "X"){
            this.player2Table[i][j] = "*";
            return "hit-cell";
        }else{
            this.player2Table[i][j] = "M";
            return "miss-cell";
        }
    }
    checkWinForPlayer1(){
        let win = true;
        for(let i = 0; i < this.player2Table.length; i++){
            for(let j = 0; j < this.player2Table[i].length; j++){
                if(this.player2Table[i][j] == "X"){
                    win = false;
                }
            }
        }
        return win;
    }
    checkWinForPlayer2(){
        let win = true;
        for(let i = 0; i < this.player1Table.length; i++){
            for(let j = 0; j < this.player1Table[i].length; j++){
                if(this.player1Table[i][j] == "X"){
                    win = false;
                }
            }
        }
        return win;
    }
}