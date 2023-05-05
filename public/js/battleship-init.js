let mainTable = document.getElementById("battleshipMainTable");
let ships = document.querySelectorAll(`[class*="ship-"]`);
let removeIcons = document.getElementsByClassName("removeImg");
let shipSelected = ships[0];
let mtTr = [];
let mtTd = [];
let actualTable = [];
let lastPlaceCoords = [];
let shipPlace = false;
let placeIndex = 0;
let shipSelectedTd = [];
let placedShips = [];
let placedCoords = [];
let rmIndex = 0;
for(let i = 0; i < ships.length; i++){
    placedCoords.push([]);
}
for(let i = 0; i < 10; i++){
    mtTd.push([]);
    actualTable.push([]);
    for(let j = 0; j < 10; j++){
        mtTd[i].push("");
        actualTable[i].push("");
    }
}
let tmpI = 0;
let tmpJ = 0;
//Generating array with all table td
for(let row of mainTable.getElementsByTagName("tr")){
    mtTr.push(row);
    let cells = row.getElementsByTagName("td");
    for(let cell of cells){
        if(tmpJ > mtTd[tmpI].length - 1){
            tmpJ = 0;
            tmpI++;
        }
        mtTd[tmpI][tmpJ] = cell;
        tmpJ++;
    }
}
//Box-shadow when ship is selected
shipSelected.classList.add("ship-selected");
for(let ship of ships){
    ship.addEventListener("click", function(event){
        if(event.target.tagName != "IMG"){
            let validShip = true;
            for(let shipP of placedShips){
                if(ship == shipP){
                    validShip = false;
                }
            }
            if(!shipPlace && validShip){
                if(shipSelected != ""){
                    shipSelected.classList.remove("ship-selected");
                }
                shipSelected = ship;
                shipSelected.classList.add("ship-selected");
            }else{
                if(!validShip){
                    alert("Ship already placed");
                }else{
                    alert("You have to place the ship before");
                }
            }
        }
    });
}
//Setting td listeners
let tdListeners = [];
for(let i = 0; i < mtTd.length; i++){
    for(let j = 0; j < mtTd[i].length; j++){
        let listener = placeShipEvent(i,j);
        mtTd[i][j].addEventListener("click", listener);
        tdListeners.push(listener);
    }
}
//Function executed when a td is pressed for placing ships with all controls
function placeShipEvent(i,j){
    return function(){
        if(shipSelected != ""){
            if(!shipPlace){
                shipPlace = true;
                placeIndex = 0;
                lastPlaceCoords = [];
                let shipSelectedTable = shipSelected.getElementsByTagName("table")[0].getElementsByTagName("tr")[0].getElementsByTagName("td");
                shipSelectedTd = [];
                for(let td of shipSelectedTable){
                    shipSelectedTd.push(td);
                }
                for(let c = 0; c < ships.length; c++){
                    if(ships[c] == shipSelected){
                        rmIndex = c;
                    }
                }
                removeIcons[rmIndex].style.display = "block";
            }
            if(lastPlaceCoords.length == 0){
                place(i,j);
                placedCoords[rmIndex].push(i,j);
            }else{
                if(lastPlaceCoords.length == 2){
                    if((Math.abs(i - lastPlaceCoords[0]) == 1 && j == lastPlaceCoords[1]) || Math.abs(j - lastPlaceCoords[1]) == 1 && i == lastPlaceCoords[0]){
                        place(i,j);
                        placedCoords[rmIndex].push(i,j);
                    }else{
                        alert("Invalid position");
                    }
                }else{
                    if(lastPlaceCoords[lastPlaceCoords.length - 1] == lastPlaceCoords[lastPlaceCoords.length - 3]){
                        //The ship is orientated vertically
                        let validI = false;
                        for(let c = 0; c < lastPlaceCoords.length; c++){
                            if(c % 2 == 0){
                                if(Math.abs(i - lastPlaceCoords[c]) == 1){
                                    validI = true;
                                }
                            }
                        }
                        if(j == lastPlaceCoords[lastPlaceCoords.length -1] && validI){
                            if(actualTable[i][j] == ""){
                                place(i,j);
                                placedCoords[rmIndex].push(i,j);
                            }else{
                                alert("Invalid position");
                            }
                        }else{
                            alert("Invalid position");
                        }
                    }else{
                        //The ship is orientated horizontally
                        let validJ = false;
                        for(let c = 0; c < lastPlaceCoords.length; c++){
                            if(c % 2 != 0){
                                if(Math.abs(j - lastPlaceCoords[c]) == 1){
                                    validJ = true;
                                }
                            }
                        }
                        if(i == lastPlaceCoords[lastPlaceCoords.length -2] && validJ){
                            if(actualTable[i][j] == ""){
                                place(i,j);
                                placedCoords[rmIndex].push(i,j);
                            }else{
                                alert("Invalid position");
                            }
                        }else{
                            alert("Invalid position")
                        }
                    }
                }
            }
            if(placeIndex == shipSelectedTd.length){
                shipPlace = false;
                placedShips.push(shipSelected);
                for(let c = 0; c < ships.length; c++){
                    if(ships[c] == shipSelected){
                        ships[c].classList.remove("ship-selected");
                    }
                }
                shipSelected = "";
                if(placedShips.length == ships.length){
                    //All the ships have been placed
                    console.log(actualTable)
                }
            }    
        }else{
            alert("Please select a ship");
        }
    }
}
//Function for placing the ship
function place(i,j){
    mtTd[i][j].classList.add("boat-cell");
    lastPlaceCoords.push(i);
    lastPlaceCoords.push(j);
    actualTable[i][j] = "X";
    shipSelectedTd[placeIndex].classList.remove("boat-cell");
    shipSelectedTd[placeIndex].classList.add("boat-cell-placed");
    placeIndex++;
}
//Setting remove icon listeners
for(let i = 0; i < removeIcons.length; i++){
    removeIcons[i].addEventListener("click", function(){
        if(rmIndex == i || !shipPlace){
            removeShip(i);
            removeIcons[i].style.display = "none";
        }else{
            alert("Finish placing the current ship before removing another");
        }
    });
}
//Function for removing a ship
function removeShip(index){
    let removeCoords = placedCoords[index];
    placedCoords[index] = [];
    for(let i = 0; i < removeCoords.length; i+=2){
        let row = removeCoords[i];
        let colum = removeCoords[i+1];
        mtTd[row][colum].classList.remove("boat-cell");
        let restoreShipTd = ships[index].getElementsByTagName("table")[0].getElementsByTagName("tr")[0].getElementsByTagName("td");
        for(let cell of restoreShipTd){
            cell.classList.remove("boat-cell-placed");
            cell.classList.add("boat-cell");
        }
        actualTable[row][colum] = "";
    }
    let newPlacedShips = [];
    for(let i = 0; i < placedShips.length; i++) {
        if(ships[index] != placedShips[i]){
            newPlacedShips.push(placedShips[i]);
        }
    }
    placedShips = newPlacedShips;
    shipPlace = false;
}