function opponentDisconnect() {
    if (redirectionTime > 0) {
        cover.getElementsByTagName("h1")[0].innerHTML = `The opponent has disconnected<br>Redirection to homepage in ${redirectionTime}s`;
        cover.getElementsByTagName("h1")[0].style.color = "red";
        cover.getElementsByTagName("img")[0].style.display = "none";
        cover.style.display = "flex";
        redirectionTime--;
    } else {
        cover.getElementsByTagName("h1")[0].innerHTML = `The opponent has disconnected<br>Redirection to homepage in ${redirectionTime}s`;
        clearInterval(redirectInterval);
        window.location.href = "/";
    }
}
//Remove the listeners
function removePlacingListeners() {
    for (let i = 0; i < elementsListeners.length; i += 2) {
        elementsListeners[i].removeEventListener("click", elementsListeners[i + 1]);
    }
    if (shipSelected != "") {
        shipSelected.classList.remove("ship-selected");
    }
    for (let icon of removeIcons) {
        icon.style.display = "none";
    }
}
let shipsRemaining;
//Placing the remaining ships randomly
function placeRemainingShips() {
    if (placedShips.length != ships.length) {
        //Not all ships have been placed
        if (shipPlace) {
            while (shipPlace) {
                //The user was placing a ship
                if (lastPlaceCoords.length == 2) {
                    let orientationChoice = random(0, 1); //0 --> horizontal 1 --> vertical
                    if (orientationChoice == 0) {
                        let i = lastPlaceCoords[0];
                        let j = lastPlaceCoords[1] + 1;
                        if (!placeShip(i, j)) {
                            i = lastPlaceCoords[0];
                            j = lastPlaceCoords[1] - 1;
                            if (!placeShip(i, j)) {
                                removeShip(rmIndex);
                            }
                        }
                    } else {
                        let i = lastPlaceCoords[0] + 1;
                        let j = lastPlaceCoords[1];
                        if (!placeShip(i, j)) {
                            i = lastPlaceCoords[0] - 1;
                            j = lastPlaceCoords[1];
                            if (!placeShip(i, j)) {
                                removeShip(rmIndex);
                            }
                        }
                    }
                } else {
                    let arrI = [];
                    let arrJ = [];
                    for (let c = 0; c < lastPlaceCoords.length; c++) {
                        if (c % 2 == 0) {
                            arrI.push(lastPlaceCoords[c]);
                        } else {
                            arrJ.push(lastPlaceCoords[c]);
                        }
                    }
                    let maxI = Math.max.apply(Math, arrI);
                    let minI = Math.min.apply(Math, arrI);
                    let maxJ = Math.max.apply(Math, arrJ);
                    let minJ = Math.min.apply(Math, arrJ);
                    if (lastPlaceCoords[lastPlaceCoords.length - 1] == lastPlaceCoords[lastPlaceCoords.length - 3]) {
                        //The ship is orientated vertically
                        if (!placeShip(maxI + 1, maxJ)) {
                            if (!placeShip(minI - 1, maxJ)) {
                                removeShip(rmIndex);
                            }
                        }
                    } else {
                        //The ship is orientated horizontally
                        if (!placeShip(maxI, maxJ + 1)) {
                            if (!placeShip(maxI, minJ - 1)) {
                                removeShip(rmIndex);
                            }
                        }
                    }
                }
            }
            placeRemainingShips();
        } else {
            //Random placing the remaining ships
            shipsRemaining = [];
            for (let ship of ships) {
                if (!placedShips.includes(ship)) {
                    shipsRemaining.push(ship);
                }
            }
            while (shipsRemaining.length != 0) {
                let succesfullyPlaced = true;
                shipSelected = shipsRemaining[0];
                let orientationChoice = random(0, 1); //0 --> horizontal 1 --> vertical
                let i;
                let j;
                do {
                    i = random(0, 9);
                    j = random(0, 9);
                } while (!placeShip(i, j));
                do {
                    let arrI = [];
                    let arrJ = [];
                    for (let k = 0; k < lastPlaceCoords.length; k++) {
                        if (k % 2 == 0) {
                            arrI.push(lastPlaceCoords[k]);
                        } else {
                            arrJ.push(lastPlaceCoords[k]);
                        }
                    }
                    let maxI = Math.max.apply(Math, arrI);
                    let minI = Math.min.apply(Math, arrI);
                    let maxJ = Math.max.apply(Math, arrJ);
                    let minJ = Math.min.apply(Math, arrJ);
                    if (orientationChoice == 0) {
                        if (!placeShip(maxI, maxJ + 1)) {
                            if (!placeShip(maxI, minJ - 1)) {
                                removeShip(rmIndex);
                                succesfullyPlaced = false;
                            }
                        }
                    } else {
                        if (!placeShip(maxI + 1, maxJ)) {
                            if (!placeShip(minI - 1, maxJ)) {
                                removeShip(rmIndex);
                                succesfullyPlaced = false;
                            }
                        }
                    }
                } while (shipPlace);
                if (succesfullyPlaced) {
                    removeRemainingShip(shipsRemaining[0]);
                }
            }
        }
    }
}

function removeRemainingShip(s) {
    let newShipsRemaining = [];
    for (let ship of shipsRemaining) {
        if (ship != s) {
            newShipsRemaining.push(ship);
        }
    }
    shipsRemaining = newShipsRemaining;
}

//Return a random number between min and max included
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeShip(i, j) {
    if (i < 0 || i > 9 || j < 0 || j > 9) {
        return false;
    }
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
            removeIcons[rmIndex].style.display = "block";
        }
        if (lastPlaceCoords.length == 0) {
            if (actualTable[i][j] == "") {
                place(i, j);
                placedCoords[rmIndex].push(i, j);
            } else {
                return false;
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
                        return false;
                    }
                } else {
                    return false;
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
                            return false;
                        }
                    } else {
                        return false;
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
                            return false;
                        }
                    } else {
                        return false;
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
        return false;
    }
    return true;
}
