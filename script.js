// Generate random tiers based on rank
function generateTiers(rank) {
    const tierSets = {
        'Combat Grandmaster': ['HT1', 'HT1', 'HT1', 'LT1', 'LT1'],
        'Combat Master': ['HT1', 'HT1', 'HT2', 'LT1', 'LT2'],
        'Combat Ace': ['HT1', 'HT2', 'HT2', 'LT2', 'LT3'],
        'Combat Expert': ['HT2', 'HT2', 'HT3', 'LT2', 'LT3'],
        'Combat Veteran': ['HT2', 'HT3', 'HT3', 'LT3', 'LT3']
    };
    return tierSets[rank] || ['HT3', 'HT3', 'LT3', 'LT3', 'LT3'];
}

// Add new player
function addPlayer() {
    const name = playerNameInput.value.trim();
    const avatar = playerAvatarInput.value.trim();
    const rank = playerRankSelect.value;
    const region = playerRegionSelect.value;
    const mode = playerModeSelect.value;
    const points = parseInt(playerPointsInput.value) || 0;

    if (!name) {
        alert('Please enter a player name');
        return;
    }

    const tiers = generateTiers(rank);

    const newPlayer = {
        name,
        avatar: avatar || `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 10000)}?v=4`,
        rank,
        points,
        region,
        tiers
    };

    if (!players[mode]) {
        players[mode] = [];
    }

    players[mode].push(newPlayer);

    // Clear form
    playerNameInput.value = '';
    playerAvatarInput.value = '';
    playerPointsInput.value = '';

    // Update displays
    renderLeaderboard();
    updateRemovePlayerSelect();

    alert(`Player ${name} added to ${mode} leaderboard!`);
}

// Remove a player
function removePlayer() {
    const name = removePlayerSelect.value;
    const mode = playerModeSelect.value;

    if (!name) {
        alert('Please select a player to remove');
        return;
    }

    if (!players[mode]) {
        alert(`No players found for mode ${mode}`);
        return;
    }

    players[mode] = players[mode].filter(player => player.name !== name);

    // Update displays
    renderLeaderboard();
    updateRemovePlayerSelect();

    alert(`Player ${name} removed from ${mode} leaderboard!`);
}
