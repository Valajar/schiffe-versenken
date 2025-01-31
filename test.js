/* 
Probleme:
    1. Torpedo Item
*/

var numShips = 3;
let schiffLength = 3;
let schiffe = [];
let treffer = 0;
let shots = 0;
let trefferquote = 0;
let loseLifeChance = 0.2;
let leben = 3;
let score = 0;
var highScore = 0;
var torpedoActive = false;
var torpedoShots = 1;


gameStart();

// Entscheidet per Münzwurf, ob horizontales Schiff generiert wird oder vertikal
function gameStart() {
    let savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore !== null) {
        highScore = parseInt(savedHighScore); // Highscore als Zahl speichern
    } else {
        highScore = 0; // Falls noch kein Highscore existiert
    }
    updateHighScoreDisplay(); // Zeige den Highscore an
    for (let m = 0; m < numShips; m++) {
        const isHorizontal = Math.random() > 0.5;
        console.log(isHorizontal);
        if (isHorizontal > 0.5) {
            horizontalSchiffGeneration();
            console.log('horizontales Schiff generiert');
        } else {
            vertikalSchiffGeneration();
            console.log('vertikales Schiff generiert');
        }
    }
    updateLivesDisplay(); // Initiale Anzeige der Leben
}

// Hinzufügen des Schiffs, wenn Position gültig ist
function addShipIfValid(start, increment) {
    let schiffPositions = [];
    for (let j = 0; j < schiffLength; j++) {
        schiffPositions.push(start + j * increment);
    }
    if (schiffPositions.every(pos => !schiffe.includes('b' + pos))) {
        for (let j = 0; j < schiffLength; j++) {
            let schiffId = 'b' + (start + j * increment);
            schiffe.push(schiffId);
            console.log('Schiffteil bei button ' + schiffId + ' hinzugefügt');
        }
        return true; // gültige Position
    }
    return false; // ungültige Position
}

function horizontalSchiffGeneration() {
    let validPosition = false;
    while (!validPosition) {
        let reihe = Math.floor(Math.random() * 5);
        console.log('reihe: ' + (reihe + 1));
        switch (reihe) {
            case 0:
                reihe = 1;
                break;
            case 1:
                reihe = 6;
                break;
            case 2:
                reihe = 11;
                break;
            case 3:
                reihe = 16;
                break;
            case 4:
                reihe = 21;
                break;
        }
        let spalte = Math.floor(Math.random() * 3);
        console.log('spalte: ' + (spalte + 1));
        var start = reihe + spalte;
        console.log('start: ' + (start));
        validPosition = addShipIfValid(start, 1);
    }
}

function vertikalSchiffGeneration() {
    let validPosition = false;
    while (!validPosition) {
        let reihe = Math.floor(Math.random() * 3);
        console.log('reihe: ' + (reihe + 1));
        switch (reihe) {
            case 0:
                reihe = 1;
                break;
            case 1:
                reihe = 6;
                break;
            case 2:
                reihe = 11;
                break;
        }
        let spalte = Math.floor(Math.random() * 5);
        console.log('spalte: ' + (spalte + 1));
        var start = reihe + spalte;
        validPosition = addShipIfValid(start, 5);
    }
}

window.onload = function() {
    updateLeaderboardDisplay();
};

// Funktion zur Anzeige der Treffer und Schüsse in der Sidebar
function updateShotsDisplay() {
    const shotsDisplayElement = document.getElementById('shotsDisplay');
    const trefferquoteDisplay = shots > 0 ? ((treffer / shots) * 100).toFixed(2) : 0;
    shotsDisplayElement.innerText = `Treffer: ${treffer} / Schüsse: ${shots} / Trefferquote: ${trefferquoteDisplay}%`;
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

// Funktion zur Anzeige des HighScores
function updateHighScoreDisplay() {
    const highScoreDisplayElement = document.getElementById('highScoreDisplay');
    highScoreDisplayElement.innerText = highScore;
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
}

function activateTorpedo() {
    if (torpedoShots > 0) {
        torpedoActive = true;
        console.log("Torpedo aktiviert! Wähle ein Ziel.");
    } else {
        console.log("Keine Torpedos mehr verfügbar!");
    }
}

// ===== Haupt-Schussfunktion =====
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
        skipLifeCounter = true;
        executeTorpedo(id);
        return;
    }
    if (schiffe.includes(id)) {
        button.classList.add('buttonHit');
        button.removeAttribute("onclick");
        treffer++;
        shots++;
        if (!skipLifeCounter) {
            lifeCounter();
        }
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

// ===== Torpedo-Logik: Trifft 3x3-Feld =====
function executeTorpedo(id) {
    console.log("Torpedo abgefeuert auf " + id);
    let cellNumber = parseInt(id.substring(1)); // "b12" -> 12
    const rows = 5; // 5 Reihen
    const cols = 5; // 5 Spalten
    const totalCells = rows * cols; // Gesamtanzahl Felder (25)

    let targets = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            let targetCell = cellNumber + rowOffset * cols + colOffset;

            if (targetCell >= 1 && targetCell <= totalCells) {
                let sameRow = Math.floor((cellNumber - 1) / cols) === Math.floor((targetCell - 1) / cols);
                if (colOffset === 0 || sameRow) { 
                    targets.push("b" + targetCell);
                }
            }
        }
    }

    // Alle Felder in `targets` treffen oder verfehlen
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

    // Statistik aktualisieren
    shots += targets.length;
    trefferquote = treffer / shots;
    updateShotsDisplay();

    // Prüfen, ob das Spiel gewonnen wurde
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
    gameStart();
    console.clear();
    leben = 3;
    torpedoShots = 1;
    updateLivesDisplay();
    updateScoreDisplay();
}

// Setzt alle Attribute zurück
function clearBoard() {
    for (let i = 1; i <= 25; i++) {
        const button = document.getElementById('b' + i);
        button.classList.remove('buttonHit', 'buttonFail');
        button.setAttribute("onclick", "onShoot('b" + i + "')");
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
    let score = (treffer * 500) * (1+leben) - (shots * 50);
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
    updateHighScoreDisplay();
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