const express = require('express');
const app = express();
const port = 80;
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) =>{
    res.sendFile(`${__dirname}/public/index.html`);
});
app.get("/game", (req, res) =>{
    res.sendFile(`${__dirname}/public/game.html`);
});
app.listen(port, () =>{
    console.log(`Server listening on port ${port}`);
})