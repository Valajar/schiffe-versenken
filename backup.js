var numShips = 4; // Anzahl der Schiffe
let schiffLength = 3; // Länge eines Schiffs
let schiffe = []; // Array zur Speicherung der Positionen aller Schiffe
let treffer = 0; // Zähler für Treffer
let shots = 0; // Zähler für abgegebene Schüsse
let trefferquote = 0; // Berechnung der Trefferquote
let loseLifeChance = 0.2; // Wahrscheinlichkeit, ein Leben zu verlieren
let leben = 3; // Startanzahl der Leben
let score = 0; // Aktueller Punktestand
var highScore = 0; // Bester Punktestand
var torpedoActive = false; // Status des Torpedos
var torpedoShots = 5; // Anzahl verfügbarer Torpedos
var rows = 7; // Anzahl der Reihen des Spielfelds
var cols = 7; // Anzahl der Spalten des Spielfelds
var diffMult = 0; // Variable für Score-Berechnung
var currentDifficulty = 'medium'; // Standart-Wert für die Schwierigkeit
var skipLifeCounter = false;

//DOM -> Document Object Model --> So wird die Seite aufgebaut
document.addEventListener('DOMContentLoaded', () => {
    createGrid(rows, cols); // Erzeugt das Spielfeld bei Seitenladevorgang
    gameStart();
    setDifficulty();
});

function setDifficulty() {
    const difficulty = document.getElementById('difficultySelect').value;

    switch (difficulty) {
        case 'easy':
            easyDiff();
            currentDifficulty = 'easy';
            break;
        case 'medium':
            mediumDiff();
            currentDifficulty = 'medium';
            break;
        case 'hard':
            hardDiff();
            currentDifficulty = 'hard';
            break;
    }
    createGrid(rows, cols); // Füge diese Zeile hinzu, um das Raster neu zu erstellen
    restartGame(); // Starte das Spiel neu
}


//Damit die Variablen außerhalb der "setDifficulty" Funktion callbar sind
function easyDiff(){
    rows = 5;
    cols = 5;
    numShips = 2;
    torpedoShots = 1;
    loseLifeChance = 0.2;
    diffMult = 1;
}

function mediumDiff(){
    rows = 7;
    cols = 7;
    numShips = 3;
    torpedoShots = 3;
    loseLifeChance = 0.1;
    diffMult = 2;
}
function hardDiff(){
    rows = 9;
    cols = 9;
    numShips = 4;
    torpedoShots = 4;
    loseLifeChance = 0.1;
    diffMult = 3;
}

function createGrid(rows, cols) {
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = ''; // Leert das Grid für ein neues Spiel
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`; // Definiert das Grid-Layout
    gridContainer.style.gap = '5px'; // Abstände zwischen den Zellen

    // Erzeugt die einzelnen Buttons
    for (let i = 1; i <= rows * cols; i++) {
        const button = document.createElement('button');
        button.className = 'button';
        button.id = `b${i}`;
        button.onclick = () => onShoot(button.id, skipLifeCounter = false); // Event-Handler für Klicks
        gridContainer.appendChild(button);
    }
}


// Entscheidet per Münzwurf, ob horizontales Schiff generiert wird oder vertikal
function gameStart() {
    schiffe = []; // Setzt die Schiffsliste zurück
    let savedHighScore = localStorage.getItem('highScore'); // Holt den Highscore aus dem LocalStorage
    highScore = savedHighScore ? parseInt(savedHighScore) : 0; // Setzt den Highscore

    // Platziert die Schiffe zufällig horizontal oder vertikal
    for (let m = 0; m < numShips; m++) {
        if (Math.random() > 0.5) {
            horizontalSchiffGeneration();
        } else {
            vertikalSchiffGeneration();
        }
    }
    updateLivesDisplay(); // Zeigt die verbleibenden Leben an
    updateTorpedoAvailability(); // Aktualisiert die Verfügbarkeit des Torpedos
}

// Hinzufügen des Schiffs, wenn Position gültig ist
function addShipIfValid(start, increment, limit, schiffLength) {
    let schiffPositions = [];
    for (let j = 0; j < schiffLength; j++) {
        let position = start + j * increment;
        if (position > limit || schiffe.includes('b' + position)) {
            return false;
        }
        schiffPositions.push('b' + position);
    }
    schiffe.push(...schiffPositions);
    console.log(`Schiff platziert: Positionen: ${schiffPositions.join(', ')}`);
    return true;
}

function horizontalSchiffGeneration() {
    let validPosition = false;
    while (!validPosition) {
        let row = Math.floor(Math.random() * rows);
        let col = Math.floor(Math.random() * (cols - schiffLength + 1));
        let start = row * cols + col + 1;
        // Limit korrekt setzen
        let limit = start + schiffLength - 1;
        validPosition = addShipIfValid(start, 1, limit, schiffLength);
    }
}

function vertikalSchiffGeneration() {
    let validPosition = false;
    while (!validPosition) {
        let row = Math.floor(Math.random() * (rows - schiffLength + 1));
        let col = Math.floor(Math.random() * cols);
        let start = row * cols + col + 1;
        let limit = (rows - 1) * cols + col + 1; // Limit für vertikale Schiffe
        validPosition = addShipIfValid(start, cols, limit, schiffLength);
    }
}


window.onload = function() {
    updateLeaderboardDisplay();
};
// Funktion zur Anzeige der Treffer und Schüsse in der Sidebar
function updateShotsDisplay() {
    const shotsDisplayElement = document.getElementById('shotsDisplay');
    const trefferquoteDisplay = shots > 0 ? ((treffer / shots) * 100).toFixed(2) : 0;
    shotsDisplayElement.innerHTML = `Treffer: ${treffer} <br> Schüsse: ${shots} <br> Trefferquote: ${trefferquoteDisplay}%`;
}

// Funktion zur Anzeige der Leben in der Sidebar
function updateLivesDisplay() {
    const livesDisplayElement = document.getElementById('lives');
    livesDisplayElement.innerText = leben;
}

// Funktion zur Anzeige des Scores
function updateScoreDisplay() {
    const scoreDisplayElement = document.getElementById('scoreDisplay');
    scoreDisplayElement.innerText = score;
}

function updateTorpedoAvailability() {
    const torpedoAvailabilityElement = document.getElementById('torpedoAvailability');
    torpedoAvailabilityElement.innerText = torpedoShots;
}

function updateLeaderboardDisplay() {
    const leaderboardElement = document.getElementById('leaderboard');
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Erstelle HTML für das Leaderboard
    leaderboardElement.innerHTML = '<h2>Top 10 Highscores:</h2>';
    highScores.forEach((entry, index) => {
        leaderboardElement.innerHTML += `<p>${index + 1}. ${entry.name} - ${entry.score}</p>`;
    });
}


function activateTorpedo() {
    if (torpedoShots > 0) {
        torpedoActive = true;
        console.log("Torpedo aktiviert! Wähle ein Ziel.");
    } else {
        console.log("Keine Torpedos mehr verfügbar!");
    }
    updateTorpedoAvailability();
}

function onShoot(id, skipLifeCounter = false) {
    const button = document.getElementById(id);
    
    if (!button) {
        console.error("Fehler: Button mit ID " + id + " nicht gefunden.");
        return;
    }

    // Torpedo-Logik
    if (torpedoActive) {
        torpedoActive = false;
        torpedoShots--;
        executeTorpedo(id);
        return;
    }

    if (schiffe.includes(id)) {
        skipLifeCounter = true;
        button.classList.add('buttonHit');
        button.removeAttribute("onclick");
        treffer++;
        shots++;
        if (!skipLifeCounter) {
            lifeCounter();
        }
        skipLifeCounter = false;
        if (treffer === numShips * schiffLength) {
            youWin();
        }
    } else {
        button.classList.add('buttonFail');
        button.removeAttribute("onclick");
        shots++;
        if (!skipLifeCounter) {
            lifeCounter();
        }
    }
    trefferquote = treffer / shots;
    updateShotsDisplay();
}


function executeTorpedo(id) {
    let cellNumber = parseInt(id.substring(1));
    let targets = [];

    let currentRow = Math.floor((cellNumber - 1) / cols);
    let currentCol = (cellNumber - 1) % cols;

    let offsets = [
        { row: 0, col: 0 },
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
    ];

    offsets.forEach(offset => {
        let newRow = currentRow + offset.row;
        let newCol = currentCol + offset.col;

        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            let targetCell = newRow * cols + newCol + 1;
            targets.push("b" + targetCell);
        }
    });

    targets.forEach(targetId => {
        const button = document.getElementById(targetId);
        if (!button) return;

        if (schiffe.includes(targetId)) {
            button.classList.add('buttonHit');
            treffer++;
        } else {
            button.classList.add('buttonFail');
        }
        button.removeAttribute("onclick");
    });
    updateShotsDisplay();
    updateTorpedoAvailability();
    if (treffer === numShips * schiffLength) {
        youWin();
    }
}

function youWin() {
    score = calculateScore();  
    console.log("Aktueller Score: " + score);

    updateScoreDisplay(); // Score aktualisieren

    setTimeout(() => {
        alert('Dein Score: ' + score);
        promptForNameAndSaveScore();
        if (confirm('Du hast gewonnen! Nochmal?')) {
            restartGame();
        } else {
            alert('Danke fürs Spielen!');
        }
    }, 100); // 100 ms Verzögerung, um die UI aktualisieren zu lassen
}

function youLose() {
    score = calculateScore();
    console.log("Aktueller Score: " + score);
    updateScoreDisplay(); // Score aktualisieren
    setTimeout(() => {
        alert('Dein Score: ' + score);
        promptForNameAndSaveScore();
        if (confirm('Du hast verloren! Nochmal versuchen?')) {
            restartGame();
        } else {
            alert('Danke fürs Spielen!');
        }
    }, 100);
}

// Alles resetten
function restartGame() {
    schiffe = [];
    treffer = 0;
    shots = 0;
    trefferquote = 0;
    clearBoard();
    console.clear();
    switch (currentDifficulty) {
        case 'easy':
            easyDiff();
            break;
        case 'medium':
            mediumDiff();
            break;
        case 'hard':
            hardDiff();
            break;
    }
    leben = 3;
    updateLivesDisplay();
    updateScoreDisplay();
    updateTorpedoAvailability();
    updateShotsDisplay();
    gameStart();
}

// Setzt alle Attribute der Buttons zurück
function clearBoard() {
    for (let i = 1; i <= rows * cols; i++) { // Dynamische Berechnung basierend auf der Spielfeldgröße
        const button = document.getElementById('b' + i);
        if (button) { //Buttons bekommen ihre Attribute zurückgesetzt
            button.classList.remove('buttonHit', 'buttonFail');
            button.setAttribute("onclick", "onShoot('b" + i + "')");
        }
    }
}

function lifeCounter () {
var randomNumber = Math.random();
if (randomNumber < loseLifeChance) {
    leben--;
    updateLivesDisplay();
    console.log('Leben verloren! ' + leben + ' Leben verbleiben.');
    if (leben < 1) {
        youLose();
    }
}
}

function calculateScore() {
    let score = Math.floor((treffer * 500) * ((1+leben)*0.8) * (diffMult) - (shots * 50));
    if (score < 0) {
        score = 0
    }
    return score;
}

function calcHighScore() {
    let score = calculateScore();
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

function promptForNameAndSaveScore() {
    const playerName = prompt("Gib deinen Namen ein:");
    if (playerName) {
        const score = calculateScore();
        const newHighscore = { name: playerName, score: score };

        // Lade aktuelle Highscores aus dem localStorage
        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push(newHighscore);
        highScores.sort((a, b) => b.score - a.score);

        if (highScores.length > 10) {
            highScores = highScores.slice(0, 10);
        }
        localStorage.setItem('highScores', JSON.stringify(highScores));
        updateLeaderboardDisplay();
    }
}

// Speichert das Leaderboard in einer JSON-Datei
async function saveLeaderboardToFile() {
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    const jsonBlob = new Blob([JSON.stringify(highScores, null, 2)], { type: 'application/json' });

    try {
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: "leaderboard.json",
            types: [{
                description: "JSON-Datei",
                accept: { "application/json": [".json"] }
            }]
        });

        const writableStream = await fileHandle.createWritable();
        await writableStream.write(jsonBlob);
        await writableStream.close();
        alert("Leaderboard gespeichert!");
    } catch (error) {
        console.error("Fehler beim Speichern der Datei:", error);
    } finally {
        await writableStream.close();
    }
}

// Lädt eine JSON-Datei und aktualisiert das Leaderboard
async function loadLeaderboardFromFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: "JSON-Datei",
                accept: { "application/json": [".json"] }
            }]
        });

        const file = await fileHandle.getFile();
        const text = await file.text();
        const highScores = JSON.parse(text);

        localStorage.setItem('highScores', JSON.stringify(highScores));
        updateLeaderboardDisplay();
        alert("Leaderboard geladen!");
    } catch (error) {
        console.error("Fehler beim Laden der Datei:", error);
    }
}

function clearLeaderboard() {
    if (confirm("Bist du sicher, dass du das Leaderboard zurücksetzen möchtest?")) {
        localStorage.removeItem('highScores');
        updateLeaderboardDisplay(); 
        alert("Leaderboard wurde zurückgesetzt!");
    }
}
