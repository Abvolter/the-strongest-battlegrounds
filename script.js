// Load player data from localStorage or fallback to default
let players = JSON.parse(localStorage.getItem("players")) || [
    { name: "Player1", tier: "Gold", score: 120 },
    { name: "Player2", tier: "Silver", score: 95 },
    { name: "Player3", tier: "Bronze", score: 70 }
];

function displayPlayers() {
    const list = document.getElementById("player-list");
    if (!list) return;
    list.innerHTML = "";
    players.sort((a, b) => b.score - a.score).forEach(p => {
        list.innerHTML += `<div class="player">${p.name} — ${p.tier} — ${p.score} pts</div>`;
    });
}

displayPlayers();
