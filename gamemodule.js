/**
 * Classe Game. Questa classe gestisce tutto ciò che riguarda il gioco
 * della battaglia navale.
 * Si occupa anche di dialogare con i due giocatori tramite i WebSocket.
 * 
 * @author Davide Branchi
 */
module.exports = class Game{
    /**
     * Costruttore della classe
     * @param player1 WebSocket del giocatore 1
     * @param player2 WebSocket del giocatore 2
     * @param io oggetto per dialogare con entrambi i WebSocket
     * @param castedRoomNumber Numero della stanza trasformato rispetto al socket id
     */
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
    /**
     * Funzione per avviare la partita
     */
    async startGame(){
        this.room = this.player1.id;
        this.player2.join(this.room);
        this.io.to(this.room).emit("game-start");
        this.player1.emit("request-nick");
        await this.waitForResponse(this.player1, "send-nick").then((response) => {
            this.player2.emit("show-nick", response);
        });
        this.player2.emit("request-nick");
        await this.waitForResponse(this.player2, "send-nick").then((response) => {
            this.player1.emit("show-nick", response);
        });
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
    /**
     * Funzione in cui vengono definite le azioni da fare in caso uno
     * dei due giocatori si disconnettesse dalla partita.
     */
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
    /**
     * Funzione invocate all effettivo avvio della partita
     */
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
    /**
     * Funzione per far rimanere in attasa di una risposta da un WebSocket
     * @param socket WebSocket da cui attendere la risposta
     * @param event evento da attendere
     */
    waitForResponse(socket, event) {
        return new Promise((resolve, reject) => {
          socket.on(event, (response) => {
            resolve(response);
          });
        });
    }
    /**
     * Funzione contenente il ciclo del gioco con i controlli per verificare
     * se un giocatore ha vinto.
     */
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
    /**
     * Controlla la cella passata sulla griglia del giocatore 1
     * @param i riga della griglia
     * @param j colonna della griglia
     * @returns stringa corrispondente allo stato della cella
     */
    checkCellPlayer1(i, j){
        if(this.player1Table[i][j] == "X"){
            this.player1Table[i][j] = "*";
            return "hit-cell";
        }else{
            this.player1Table[i][j] = "M";
            return "miss-cell";
        }
    }
    /**
     * Controlla la cella passata sulla griglia del giocatore 2
     * @param i riga della griglia
     * @param j colonna della griglia
     * @returns stringa corrispondente allo stato della cella
     */
    checkCellPlayer2(i, j){
        if(this.player2Table[i][j] == "X"){
            this.player2Table[i][j] = "*";
            return "hit-cell";
        }else{
            this.player2Table[i][j] = "M";
            return "miss-cell";
        }
    }
     /**
     * Controlla la griglia del giocatore 2 per verificare se il giocatore 1
     * ha vinto abbattendo tutte le navi
     * @returns true in caso di vincita, false altrimenti
     */
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
    /**
     * Controlla la griglia del giocatore 1 per verificare se il giocatore 2
     * ha vinto abbattendo tutte le navi
     * @returns true in caso di vincita, false altrimenti
     */
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