let playOnlineBtn = document.getElementById("btn-plo");
playOnlineBtn.addEventListener("click", () => {
  Swal.fire({
    title: "What do you want to do?",
    icon: "question",
    html: `
    <button class="selection-button" value="NO-ROOM">Play with random players</button>
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
    });
  }
});
