var numShips = 4; // Anzahl der Schiffe
let schiffLength = 3; // Länge eines Schiffs
let schiffe = []; // Array zur Speicherung der Positionen aller Schiffe
export let treffer = 0; // Zähler für Treffer
export let shots = 0; // Zähler für abgegebene Schüsse
let loseLifeChance = 0.2; // Wahrscheinlichkeit, ein Leben zu verlieren
export let leben = 3; // Startanzahl der Leben
var torpedoActive = false; // Status des Torpedos
export var torpedoShots = 5; // Anzahl verfügbarer Torpedos
var skipLifeCounter = false;
var highScore = 0;
var rows = 7; // Anzahl der Reihen des Spielfelds
var cols = 7; // Anzahl der Spalten des Spielfelds
export var diffMult = 0; // Variable für Score-Berechnung
var currentDifficulty = 'medium'; // Standart-Wert für die Schwierigkeit

import { updateLivesDisplay, updateTorpedoAvailability, updateScoreDisplay, updateShotsDisplay } from "./stats.js";

//DOM -> Document Object Model --> So wird die Seite aufgebaut
document.addEventListener('DOMContentLoaded', () => {
    createGrid(rows, cols); // Erzeugt das Spielfeld bei Seitenladevorgang
    gameStart();
    setDifficulty();
});

window.setDifficulty = function() {
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
        button.onclick = () => onShoot(button.id, skipLifeCounter=false, lifeCounter); // Event-Handler für Klicks
        gridContainer.appendChild(button);
    }
}

// Entscheidet per Münzwurf, ob horizontales Schiff generiert wird oder vertikal
export function gameStart() {
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
function addShipIfValid(start, increment, limit) {
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
        validPosition = addShipIfValid(start, 1, row * cols + cols);
        
    }
}

function vertikalSchiffGeneration() {
    let validPosition = false;
    while (!validPosition) {
        let row = Math.floor(Math.random() * (rows - schiffLength + 1));
        let col = Math.floor(Math.random() * cols);
        let start = row * cols + col + 1;
        validPosition = addShipIfValid(start, cols, rows * cols);
    }
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

window.activateTorpedo = activateTorpedo;

window.onShoot = function(id, skipLifeCounter = false) {
    const button = document.getElementById(id);

    if (!button) {
        console.error("Fehler: Button mit ID " + id + " nicht gefunden.");
        return;
    }
    if (torpedoActive) {
        torpedoActive = false;
        torpedoShots--;
        executeTorpedo(id);
        return;
    }
    if (schiffe.includes(id)) {
        button.classList.add('buttonHit');
        button.removeAttribute("onclick");
        treffer++;
        shots++;
        if (!skipLifeCounter) {
            lifeCounter(leben);
        }
        if (treffer === numShips * schiffLength) {
            youWin();
        }
    } else {
        button.classList.add('buttonFail');
        button.removeAttribute("onclick");
        shots++;
        if (!skipLifeCounter) {
            lifeCounter(leben);
        }
    }
    updateShotsDisplay(shots, treffer); // Update shots display
}


export function lifeCounter(leben, loseLifeChance) {
    var randomNumber = Math.random();
    if (randomNumber < loseLifeChance) {
        leben--; // Update lives
        updateLivesDisplay(leben); // Update lives display
        console.log('Leben verloren! ' + leben + ' Leben verbleiben.');
        if (leben < 1) {
            youLose();
        }
    }
}

function executeTorpedo(id, youWin) {
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


// Alles resetten
export function restartGame() {
    schiffe = [];
    treffer = 0; // Reset hits
    shots = 0; // Reset shots
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
    leben = 3; // Reset lives
    updateLivesDisplay(leben); // Update lives display
    updateScoreDisplay(); // Update score display
    updateTorpedoAvailability(torpedoShots); // Update torpedo display
    updateShotsDisplay(shots, treffer); // Update shots display
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
