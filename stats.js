
let score = 0;
import {treffer, shots, leben, diffMult, rows, cols, restartGame, torpedoShots, highScore} from './main.js';

window.youWin = function(treffer, leben, diffMult, shots) {
    score = calculateScore(treffer, leben, diffMult, shots);
    console.log("Aktueller Score: " + score);

    window.updateScoreDisplay();

    setTimeout(() => {
        alert('Dein Score: ' + score);
        promptForNameAndSaveScore(treffer, leben, diffMult, shots);
        if (confirm('Du hast gewonnen! Nochmal?')) {
            restartGame();
        } else {
            alert('Danke fürs Spielen!');
        }
    }, 100);
}

window.youLose = function(treffer, leben, diffMult, shots) {
    score = calculateScore(treffer, leben, diffMult, shots);
    console.log("Aktueller Score: " + score);
    updateScoreDisplay();
    setTimeout(() => {
        alert('Dein Score: ' + score);
        promptForNameAndSaveScore(treffer, leben, diffMult, shots);
        if (confirm('Du hast verloren! Nochmal versuchen?')) {
            restartGame();
        } else {
            alert('Danke fürs Spielen!');
        }
    }, 100);
}

export function calculateScore(treffer, leben, diffMult, shots) {
    let score = Math.floor((treffer * 500) * ((1 + leben) * 0.8) * (diffMult) - (shots * 50));
    if (score < 0) {
        score = 0;
    }
    return score;
}

export function calcHighScore(treffer, leben, diffMult, shots) {
    let currentScore = calculateScore(treffer, leben, diffMult, shots); // Pass necessary parameters
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('highScore', highScore);
    }
}

export function promptForNameAndSaveScore(treffer, leben, diffMult, shots) {
    const playerName = prompt("Gib deinen Namen ein:");
    if (playerName) {
        const currentScore = calculateScore(treffer, leben, diffMult, shots); // Pass variables
        const newHighscore = { name: playerName, score: currentScore };

        // Load current highscores from localStorage
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

export async function saveLeaderboardToFile() {
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
    }
    finally {writableStream.close();}
}

window.saveLeaderboardToFile = saveLeaderboardToFile;

export async function loadLeaderboardFromFile() {
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

window.loadLeaderboardFromFile = loadLeaderboardFromFile;

export function clearLeaderboard() {
    if (confirm("Bist du sicher, dass du das Leaderboard zurücksetzen möchtest?")) {
        localStorage.removeItem('highScores');
        window.updateLeaderboardDisplay();
        alert("Leaderboard wurde zurückgesetzt!");
    }
}

window.clearLeaderboard = clearLeaderboard;

window.onload = function() {
    window.updateLeaderboardDisplay();
};
// Update lives display
export function updateLivesDisplay(leben) {
    const livesDisplayElement = document.getElementById('lives');
    livesDisplayElement.innerText = leben;
}
window.updateLivesDisplay = updateLivesDisplay;

// Update shots display
export function updateShotsDisplay(shots, treffer) {
    const shotsDisplayElement = document.getElementById('shotsDisplay');
    const trefferquoteDisplay = shots > 0 ? Math.min((treffer / shots) * 100, 100).toFixed(2) : 0;
    shotsDisplayElement.innerHTML = `Treffer: ${treffer} <br> Schüsse: ${shots} <br> Trefferquote: ${trefferquoteDisplay}%`;
}
window.updateShotsDisplay = updateShotsDisplay;

// Function to display the score
export function updateScoreDisplay() {
    const scoreDisplayElement = document.getElementById('scoreDisplay');
    scoreDisplayElement.innerText = score;
}
window.updateScoreDisplay = updateScoreDisplay;

export function updateTorpedoAvailability() {
    const torpedoAvailabilityElement = document.getElementById('torpedoAvailability');
    torpedoAvailabilityElement.innerText = torpedoShots;
}

window.updateTorpedoAvailability = updateTorpedoAvailability;

export function updateLeaderboardDisplay() {
    const leaderboardElement = document.getElementById('leaderboard');
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

    // Create HTML for the leaderboard
    leaderboardElement.innerHTML = '<h2>Top 10 Highscores:</h2>';
    highScores.forEach((entry, index) => {
        leaderboardElement.innerHTML += `<p>${index + 1}. ${entry.name} - ${entry.score}</p>`;
    });
}
window.updateLeaderboardDisplay = updateLeaderboardDisplay;
