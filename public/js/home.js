/**
 * Script per gestire gli eventi della home page.
 * 
 * @author Davide Branchi
 */
let playOnlineBtn = document.getElementById("btn-plo");
playOnlineBtn.addEventListener("click", () => {
  let responsiveVal = "";
  if(window.innerWidth <= 768){
    responsiveVal = "<br><br>"
  }
  Swal.fire({
    title: "What do you want to do?",
    icon: "question",
    html: `
    <button class="selection-button" value="NO-ROOM">Play with random players</button>
    ${responsiveVal}
    <button class="selection-button" value="CREATE-ROOM">Create a private room</button>
    <br>
    <br>
    <button class="selection-button" value="JOIN-ROOM">Join an existing room</button>
    `,
    showCancelButton: false,
    showConfirmButton: false,
  });
  let selectionButtons = document.getElementsByClassName("selection-button");
  for (let btn of selectionButtons) {
    btn.addEventListener("click", () => {
      Swal.fire({
        title: "Insert a nickname",
        input: "text",
        showCancelButton: true,
      }).then((resultNick) => {
        if (resultNick.value) {
          sessionStorage.setItem("nick", resultNick.value);
          sessionStorage.setItem("room", btn.value);
          if (btn.value == "JOIN-ROOM") {
            Swal.fire({
              title: "Insert the room number",
              input: "text",
              showCancelButton: true,
            }).then((result) => {
              if (result.value) {
                sessionStorage.setItem("join", result.value);
                window.location.href = "/game";
              }
            });
          } else {
            window.location.href = "/game";
          }  
        }
      });
    });
  }
});

let helpButton = document.getElementById("btn-hel");
helpButton.addEventListener("click", () => {
  let responsiveVal = "";
  if (window.innerWidth <= 768) {
    responsiveVal = "<br><br>"
  }
  Swal.fire({
    class: "helppop",
    title: "How to play",
    icon: "info",
    html: `
    <p style='text-align:justify'>In the beginning phase of the game the two players have 60 seconds to arrange the ships in their grid.
    At the end of this phase the first player selects a cell where he thinks there is an enemy ship, if the selected cell contains the ship then it will be hit.
    Once the first player has made his choice, the turn passes to the opponent who will do the same.
    The player who destroys all the opposing ships first wins the game.<p>
    `,
    showCancelButton: true,
    showConfirmButton: false,
  });
});