// Game state
let currentMode = 'overall';
let players = {
    overall: [
        {
            name: "TechMaster",
            avatar: "https://avatars.githubusercontent.com/u/1?v=4",
            rank: "Combat Grandmaster",
            points: 2450,
            region: "NA",
            tiers: ["HT1", "HT1", "HT1", "LT1", "LT1"]
        },
        {
            name: "CodeNinja",
            avatar: "https://avatars.githubusercontent.com/u/2?v=4",
            rank: "Combat Master",
            points: 2380,
            region: "EU",
            tiers: ["HT1", "HT1", "HT2", "HT2", "LT1"]
        },
        {
            name: "DevGuru",
            avatar: "https://avatars.githubusercontent.com/u/3?v=4",
            rank: "Combat Master",
            points: 2290,
            region: "NA",
            tiers: ["HT1", "HT2", "HT2", "HT3", "LT2"]
        }
    ],
    sword: [
        {
            name: "SwordLord",
            avatar: "https://avatars.githubusercontent.com/u/4?v=4",
            rank: "Combat Grandmaster",
            points: 2650,
            region: "EU",
            tiers: ["HT1", "HT1", "HT1", "HT1", "LT1"]
        },
        {
            name: "BladeRunner",
            avatar: "https://avatars.githubusercontent.com/u/5?v=4",
            rank: "Combat Master",
            points: 2480,
            region: "NA",
            tiers: ["HT1", "HT1", "HT2", "LT1", "LT2"]
        },
        {
            name: "EdgeMaster",
            avatar: "https://avatars.githubusercontent.com/u/6?v=4",
            rank: "Combat Ace",
            points: 2350,
            region: "AS",
            tiers: ["HT1", "HT2", "HT3", "LT1", "LT3"]
        }
    ]
};

// DOM Elements
const modeTabs = document.querySelectorAll('.mode-tab');
const leaderboardContent = document.getElementById('leaderboardContent');
const searchInput = document.getElementById('searchInput');
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');

// Admin elements
const playerNameInput = document.getElementById('playerName');
const playerAvatarInput = document.getElementById('playerAvatar');
const playerRankSelect = document.getElementById('playerRank');
const playerRegionSelect = document.getElementById('playerRegion');
const playerModeSelect = document.getElementById('playerMode');
const playerPointsInput = document.getElementById('playerPoints');
const addPlayerBtn = document.getElementById('addPlayer');
const removePlayerSelect = document.getElementById('removePlayerSelect');
const removePlayerBtn = document.getElementById('removePlayer');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderLeaderboard();
    updateRemovePlayerSelect();
    
    // Event listeners
    modeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const mode = this.dataset.mode;
            switchMode(mode);
        });
    });
    
    searchInput.addEventListener('input', function() {
        renderLeaderboard(this.value);
    });
    
    adminToggle.addEventListener('click', function() {
        adminPanel.classList.toggle('hidden');
    });
    
    addPlayerBtn.addEventListener('click', addPlayer);
    removePlayerBtn.addEventListener('click', removePlayer);
});

// Switch between modes
function switchMode(mode) {
    currentMode = mode;
    
    // Update active tab
    modeTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.mode === mode) {
            tab.classList.add('active');
        }
    });
    
    renderLeaderboard();
}

// Render leaderboard
function renderLeaderboard(searchTerm = '') {
    const currentPlayers = players[currentMode] || [];
    
    // Filter players based on search term
    let filteredPlayers = currentPlayers.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort by points (descending)
    filteredPlayers.sort((a, b) => b.points - a.points);
    
    leaderboardContent.innerHTML = '';
    
    filteredPlayers.forEach((player, index) => {
        const entry = createLeaderboardEntry(player, index + 1);
        leaderboardContent.appendChild(entry);
    });
}

// Create leaderboard entry
function createLeaderboardEntry(player, rank) {
    const entry = document.createElement('div');
    entry.className = `leaderboard-entry rank-${rank}`;
    
    // Add sword-mode class for RGB effects on top 3
    if (currentMode === 'sword' && rank <= 3) {
        entry.classList.add('sword-mode');
    }
    
    const avatarUrl = player.avatar || `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 1000)}?v=4`;
    
    entry.innerHTML = `
        <div class="rank-number">${rank}.</div>
        <div class="player-info">
            <div class="player-avatar">
                <div class="avatar-frame"></div>
                <img src="${avatarUrl}" alt="${player.name}" class="avatar-img" onerror="this.src='https://avatars.githubusercontent.com/u/0?v=4'">
            </div>
            <div class="player-details">
                <h3>${player.name}</h3>
                <div class="player-rank">
                    <span class="rank-icon">⚔️</span>
                    ${player.rank} (${player.points} points)
                </div>
            </div>
        </div>
        <div class="region-tag region-${player.region}">${player.region}</div>
        <div class="tier-badges">
            ${player.tiers.map(tier => `<div class="tier-badge tier-${tier}">${tier}</div>`).join('')}
        </div>
    `;
    
    return entry;
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

// Remove player
function removePlayer() {
    const playerToRemove = removePlayerSelect.value;
    if (!playerToRemove) {
        alert('Please select a player to remove');
        return;
    }
    
    const [mode, playerName] = playerToRemove.split('|');
    
    if (players[mode]) {
        players[mode] = players[mode].filter(player => player.name !== playerName);
        
        // Update displays
        renderLeaderboard();
        updateRemovePlayerSelect();
        
        alert(`Player ${playerName} removed from ${mode} leaderboard!`);
    }
}

// Update remove player select dropdown
function updateRemovePlayerSelect() {
    removePlayerSelect.innerHTML = '<option value="">Select player to remove</option>';
    
    Object.keys(players).forEach(mode => {
        if (players[mode] && players[mode].length > 0) {
            players[mode].forEach(player => {
                const option = document.createElement('option');
                option.value = `${mode}|${player.name}`;
                option.textContent = `${player.name} (${mode})`;
                removePlayerSelect.appendChild(option);
            });
        }
    });
}

// Search functionality with keyboard shortcut
document.addEventListener('keydown', function(e) {
    if (e.key === '/' && !searchInput.matches(':focus')) {
        e.preventDefault();
        searchInput.focus();
    }
    
    if (e.key === 'Escape' && searchInput.matches(':focus')) {
        searchInput.blur();
        searchInput.value = '';
        renderLeaderboard();
    }
});

// Auto-generate GitHub-style avatars for players without custom avatars
function getGitHubAvatar(username) {
    // Create a simple hash from username for consistent avatar
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    const avatarId = Math.abs(hash) % 1000;
    return `https://avatars.githubusercontent.com/u/${avatarId}?v=4`;
}

// Add some sample data for demonstration
function addSampleData() {
    // Add more sample players to overall
    const sampleOverallPlayers = [
        { name: "GitMaster", rank: "Combat Ace", points: 2180, region: "EU", tiers: ["HT1", "HT2", "HT3", "LT1", "LT2"] },
        { name: "RepoKing", rank: "Combat Expert", points: 2050, region: "AS", tiers: ["HT2", "HT2", "HT3", "LT2", "LT3"] },
        { name: "CommitLord", rank: "Combat Veteran", points: 1920, region: "OCE", tiers: ["HT2", "HT3", "HT3", "LT3", "LT3"] }
    ];
    
    // Add more sample players to sword
    const sampleSwordPlayers = [
        { name: "SlashMaster", rank: "Combat Ace", points: 2280, region: "NA", tiers: ["HT1", "HT2", "HT2", "LT1", "LT2"] },
        { name: "CutThroat", rank: "Combat Expert", points: 2150, region: "EU", tiers: ["HT2", "HT2", "HT3", "LT2", "LT3"] },
        { name: "BladeWielder", rank: "Combat Veteran", points: 2000, region: "AS", tiers: ["HT2", "HT3", "HT3", "LT3", "LT3"] }
    ];
    
    sampleOverallPlayers.forEach(player => {
        player.avatar = getGitHubAvatar(player.name);
        players.overall.push(player);
    });
    
    sampleSwordPlayers.forEach(player => {
        player.avatar = getGitHubAvatar(player.name);
        players.sword.push(player);
    });
}

// Initialize sample data
addSampleData();

// Smooth scrolling animation for leaderboard updates
function smoothRenderLeaderboard(searchTerm = '') {
    leaderboardContent.style.opacity = '0.5';
    leaderboardContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        renderLeaderboard(searchTerm);
        leaderboardContent.style.opacity = '1';
        leaderboardContent.style.transform = 'translateY(0)';
    }, 150);
}

// Enhanced search with debouncing
let searchTimeout;
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        smoothRenderLeaderboard(this.value);
    }, 300);
});

// Add animation to tier badges
function animateTierBadges() {
    const tierBadges = document.querySelectorAll('.tier-badge');
    tierBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
        badge.classList.add('tier-animate');
    });
}

// Call animation after rendering
const originalRenderLeaderboard = renderLeaderboard;
renderLeaderboard = function(searchTerm = '') {
    originalRenderLeaderboard(searchTerm);
    setTimeout(animateTierBadges, 100);
};

// Easter egg: Konami code for special effects
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join('') === konamiSequence.join('')) {
        activateSpecialMode();
    }
});

function activateSpecialMode() {
    document.body.style.filter = 'hue-rotate(180deg) saturate(1.5)';
    setTimeout(() => {
        document.body.style.filter = '';
    }, 3000);
    
    console.log('🎉 Special mode activated! You found the easter egg!');
} random tiers based on rank
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

// Generate
