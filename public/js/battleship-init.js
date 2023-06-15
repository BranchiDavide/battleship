/**
 * Script per gestire tutto ciò che riguarda il posizionamento e la
 * rimozione della navi.
 * 
 * @author Davide Branchi
 */
let mainTable = document.getElementById("battleshipMainTable");
let ships = document.querySelectorAll(`[class*="ship-"]`);
let removeIcons = document.getElementsByClassName("removeImg");
let shipSelected = ships[0];
let elementsListeners = []; //Array with all the listeners of the elements ([elem,list,elem.list...])
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
for (let i = 0; i < ships.length; i++) {
    placedCoords.push([]);
}
for (let i = 0; i < 10; i++) {
    mtTd.push([]);
    actualTable.push([]);
    for (let j = 0; j < 10; j++) {
        mtTd[i].push("");
        actualTable[i].push("");
    }
}
let tmpI = 0;
let tmpJ = 0;
//Generating array with all table td
for (let row of mainTable.getElementsByTagName("tr")) {
    mtTr.push(row);
    let cells = row.getElementsByTagName("td");
    for (let cell of cells) {
        if (tmpJ > mtTd[tmpI].length - 1) {
            tmpJ = 0;
            tmpI++;
        }
        mtTd[tmpI][tmpJ] = cell;
        tmpJ++;
    }
}
//Box-shadow when ship is selected (ship selection listener)
shipSelected.classList.add("ship-selected");
for (let ship of ships) {
    ship.addEventListener("click", shipSelectionListener);
    elementsListeners.push(ship);
    elementsListeners.push(shipSelectionListener);
}
/**
 * Funzione per gestire la selezione di una nave.
 * @param event evento
 */
function shipSelectionListener(event) {
    if (event.target.tagName != "IMG") {
        let validShip = true;
        for (let shipP of placedShips) {
            if (this == shipP) {
                validShip = false;
            }
        }
        if (!shipPlace && validShip) {
            if (shipSelected != "") {
                shipSelected.classList.remove("ship-selected");
            }
            shipSelected = this;
            shipSelected.classList.add("ship-selected");
        } else {
            if (!validShip) {
                showErrorAlert("Ship already placed");
            } else {
                showWarningAlert("You have to place the ship before");
            }
        }
    }
}
//Setting td listeners
for (let i = 0; i < mtTd.length; i++) {
    for (let j = 0; j < mtTd[i].length; j++) {
        let listener = placeShipEvent(i, j);
        mtTd[i][j].addEventListener("click", listener);
        elementsListeners.push(mtTd[i][j]);
        elementsListeners.push(listener);
    }
}
/**
 * Funzione eseguita quando l'utente preme su una cella della tabella,
 * vengono effettuati tutti i controlli necessari per verificare che la cella
 * sia valida ecc..
 * @param i riga della tabella
 * @param j colonna della tabella
 */
function placeShipEvent(i, j) {
    return function () {
        if (shipSelected != "") {
            if (!shipPlace) {
                shipPlace = true;
                placeIndex = 0;
                lastPlaceCoords = [];
                let shipSelectedTable = shipSelected
                    .getElementsByTagName("table")[0]
                    .getElementsByTagName("tr")[0]
                    .getElementsByTagName("td");
                shipSelectedTd = [];
                for (let td of shipSelectedTable) {
                    shipSelectedTd.push(td);
                }
                for (let c = 0; c < ships.length; c++) {
                    if (ships[c] == shipSelected) {
                        rmIndex = c;
                    }
                }
            }
            if (lastPlaceCoords.length == 0) {
                if (actualTable[i][j] == "") {
                    place(i, j);
                    placedCoords[rmIndex].push(i, j);
                    removeIcons[rmIndex].style.display = "block";
                } else {
                    showErrorAlert("Invalid position");
                }
            } else {
                if (lastPlaceCoords.length == 2) {
                    if (
                        (Math.abs(i - lastPlaceCoords[0]) == 1 &&
                            j == lastPlaceCoords[1]) ||
                        (Math.abs(j - lastPlaceCoords[1]) == 1 && i == lastPlaceCoords[0])
                    ) {
                        if (actualTable[i][j] == "") {
                            place(i, j);
                            placedCoords[rmIndex].push(i, j);
                        } else {
                            showErrorAlert("Invalid position");
                        }
                    } else {
                        showErrorAlert("Invalid position");
                    }
                } else {
                    if (lastPlaceCoords[lastPlaceCoords.length - 1] == lastPlaceCoords[lastPlaceCoords.length - 3]) {
                        //The ship is orientated vertically
                        let validI = false;
                        for (let c = 0; c < lastPlaceCoords.length; c++) {
                            if (c % 2 == 0) {
                                if (Math.abs(i - lastPlaceCoords[c]) == 1) {
                                    validI = true;
                                }
                            }
                        }
                        if (j == lastPlaceCoords[lastPlaceCoords.length - 1] && validI) {
                            if (actualTable[i][j] == "") {
                                place(i, j);
                                placedCoords[rmIndex].push(i, j);
                            } else {
                                showErrorAlert("Invalid position");
                            }
                        } else {
                            showErrorAlert("Invalid position");
                        }
                    } else {
                        //The ship is orientated horizontally
                        let validJ = false;
                        for (let c = 0; c < lastPlaceCoords.length; c++) {
                            if (c % 2 != 0) {
                                if (Math.abs(j - lastPlaceCoords[c]) == 1) {
                                    validJ = true;
                                }
                            }
                        }
                        if (i == lastPlaceCoords[lastPlaceCoords.length - 2] && validJ) {
                            if (actualTable[i][j] == "") {
                                place(i, j);
                                placedCoords[rmIndex].push(i, j);
                            } else {
                                showErrorAlert("Invalid position");
                            }
                        } else {
                            showErrorAlert("Invalid position");
                        }
                    }
                }
            }
            if (placeIndex == shipSelectedTd.length) {
                shipPlace = false;
                placedShips.push(shipSelected);
                for (let c = 0; c < ships.length; c++) {
                    if (ships[c] == shipSelected) {
                        ships[c].classList.remove("ship-selected");
                    }
                }
                shipSelected = "";
            }
        } else {
            showWarningAlert("Please select a ship");
        }
    };
}
/**
 * Funzione per piazzare concretamenta la nave sulla tabella
 * @param i riga della tabella
 * @param j colonna della tabella
 */
function place(i, j) {
    mtTd[i][j].classList.add("boat-cell");
    lastPlaceCoords.push(i);
    lastPlaceCoords.push(j);
    actualTable[i][j] = "X";
    shipSelectedTd[placeIndex].classList.remove("boat-cell");
    shipSelectedTd[placeIndex].classList.add("boat-cell-placed");
    placeIndex++;
}
//Setting remove icon listeners
for (let i = 0; i < removeIcons.length; i++) {
    removeIcons[i].addEventListener("click", function () {
        if (rmIndex == i || !shipPlace) {
            removeShip(i);
            removeIcons[i].style.display = "none";
        } else {
            showWarningAlert("Finish placing the current ship before removing another");
        }
    });
}
/**
 * Funzione per rimuovere una nave dalla tabella.
 * @param index indice della nave da rimuovere
 */
function removeShip(index) {
    let removeCoords = placedCoords[index];
    placedCoords[index] = [];
    for (let i = 0; i < removeCoords.length; i += 2) {
        let row = removeCoords[i];
        let colum = removeCoords[i + 1];
        mtTd[row][colum].classList.remove("boat-cell");
        let restoreShipTd = ships[index]
            .getElementsByTagName("table")[0]
            .getElementsByTagName("tr")[0]
            .getElementsByTagName("td");
        for (let cell of restoreShipTd) {
            cell.classList.remove("boat-cell-placed");
            cell.classList.add("boat-cell");
        }
        actualTable[row][colum] = "";
    }
    let newPlacedShips = [];
    for (let i = 0; i < placedShips.length; i++) {
        if (ships[index] != placedShips[i]) {
            newPlacedShips.push(placedShips[i]);
        }
    }
    placedShips = newPlacedShips;
    shipPlace = false;
}
