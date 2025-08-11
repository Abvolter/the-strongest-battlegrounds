let players = JSON.parse(localStorage.getItem("players")) || [];

function savePlayers() {
    localStorage.setItem("players", JSON.stringify(players));
}

function addPlayer() {
    const name = document.getElementById("player-name").value.trim();
    const tier = document.getElementById("player-tier").value.trim();
    const score = parseInt(document.getElementById("player-score").value);

    if (!name || !tier || isNaN(score)) {
        alert("Please fill all fields correctly!");
        return;
    }

    players.push({ name, tier, score });
    savePlayers();
    displayAdminPlayers();
}

function removePlayer(index) {
    players.splice(index, 1);
    savePlayers();
    displayAdminPlayers();
}

function displayAdminPlayers() {
    const list = document.getElementById("admin-player-list");
    list.innerHTML = "";
    players.forEach((p, i) => {
        list.innerHTML += `
            <div class="player">
                ${p.name} — ${p.tier} — ${p.score} pts
                <button onclick="removePlayer(${i})">❌</button>
            </div>
        `;
    });
}

displayAdminPlayers();

