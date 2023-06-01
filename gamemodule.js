module.exports = class Game{
    constructor(player1, player2, io){
        this.player1 = player1;
        this.player2 = player2;
        this.io = io;
        this.startGame();
        this.disconnectListeners();
    }
    startGame(){
        this.room = this.player1.id;
        this.player2.join(this.room);
        console.log("Game started in room: " + this.room);
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
    effectiveGameStart(){
        this.player1.on("start-data", (player1Table) =>{
            this.player1Table = player1Table;
        });
        this.player2.on("start-data", (player2Table) =>{
            this.player2Table = player2Table;
            this.gameLoop();
        });
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
                    console.log(response);
                  });
                turnSwitch = !turnSwitch;
            }else{
                this.player2.emit("turn");
                await this.waitForResponse(this.player2, "turn-data").then((response) => {
                    console.log(response);
                  });
                turnSwitch = !turnSwitch;
            }
        }
    }
}