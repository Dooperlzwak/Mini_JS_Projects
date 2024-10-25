let currentPlayer = "X";
let gameActive = true;
const gameState = ["", "", "", "", "", "", "", "", ""];
const cells = document.querySelectorAll(".cell");
const statusDisplay = document.getElementById("status");
const restartButton = document.getElementById("restartButton");
const currentPlayerDisplay = document.getElementById("currentPlayer");
const themeCheckbox = document.getElementById("themeCheckbox");

const winningConditions = [
 [0, 1, 2],
 [3, 4, 5],
 [6, 7, 8],
 [0, 3, 6],
 [1, 4, 7],
 [2, 5, 8],
 [0, 4, 8],
 [2, 4, 6],
];

cells.forEach((cell) => {
 cell.addEventListener("click", handleCellClick);
});

restartButton.addEventListener("click", restartGame);

function handleCellClick(event) {
 const cell = event.target;
 const index = cell.getAttribute("data-index");

 if (gameState[index] !== "" || !gameActive) {
  return;
 }

 gameState[index] = currentPlayer;
 cell.textContent = currentPlayer;
 cell.classList.add(currentPlayer);

 checkResult();
}

function checkResult() {
 let roundWon = false;
 for (let i = 0; i < winningConditions.length; i++) {
  const winCondition = winningConditions[i];
  let a = gameState[winCondition[0]];
  let b = gameState[winCondition[1]];
  let c = gameState[winCondition[2]];

  if (a === "" || b === "" || c === "") {
   continue;
  }

  if (a === b && b === c) {
   roundWon = true;
   // Highlight winning cells
   winCondition.forEach((index) => {
    cells[index].classList.add("winner");
   });
   break;
  }
 }

 if (roundWon) {
  statusDisplay.innerHTML = `Player <span>${currentPlayer}</span> has won!`;
  gameActive = false;
  return;
 }

 // Check for tie
 let roundTie = !gameState.includes("");
 if (roundTie) {
  statusDisplay.textContent = `Game ended in a tie!`;
  gameActive = false;
  // Highlight all cells
  cells.forEach((cell) => {
   cell.classList.add("tie");
  });
  return;
 }

 // Switch player
 currentPlayer = currentPlayer === "X" ? "O" : "X";
 currentPlayerDisplay.textContent = currentPlayer;
 statusDisplay.innerHTML = `Player <span>${currentPlayer}</span>'s turn`;
}

function restartGame() {
 currentPlayer = "X";
 gameActive = true;
 gameState.fill("");
 currentPlayerDisplay.textContent = currentPlayer;
 statusDisplay.innerHTML = `Player <span>${currentPlayer}</span>'s turn`;
 cells.forEach((cell) => {
  cell.textContent = "";
  cell.className = "cell";
 });
}

// Theme Switcher
// Check for saved theme preference on page load
if (localStorage.getItem("theme") === "light") {
 themeCheckbox.checked = true;
 document.body.classList.add("light-mode");
}

themeCheckbox.addEventListener("change", function () {
 if (this.checked) {
  document.body.classList.add("light-mode");
  localStorage.setItem("theme", "light");
 } else {
  document.body.classList.remove("light-mode");
  localStorage.setItem("theme", "dark");
 }
});
