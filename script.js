// ====== Persistent State (localStorage) ======
const STORAGE_KEY = 'swordtiers_players_v1';

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

// ====== DOM Elements ======
const modeTabs = document.querySelectorAll('.mode-tab');
const leaderboardContent = document.getElementById('leaderboardContent');
const searchInput = document.getElementById('searchInput');
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');

const navHome = document.getElementById('navHome');
const navRankings = document.getElementById('navRankings');

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

// ====== Utils ======
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    } catch (e) {
        console.warn('Could not save players to localStorage', e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                players = parsed;
            }
        }
    } catch (e) {
        console.warn('Could not load players from localStorage', e);
    }
}

function getQueryMode() {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    return (m === 'sword' || m === 'overall') ? m : 'overall';
}

function setQueryMode(mode) {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', mode);
    history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
}

// GitHub-style avatar fallback
function getGitHubAvatar(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    const avatarId = Math.abs(hash) % 1000;
    return `https://avatars.githubusercontent.com/u/${avatarId}?v=4`;
}

// ====== Tier Gen ======
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

// ====== Render ======
function createLeaderboardEntry(player, rankNum) {
    const entry = document.createElement('div');
    entry.className = `leaderboard-entry rank-${rankNum}`;
    if (currentMode === 'sword' && rankNum <= 3) {
        entry.classList.add('sword-mode');
    }

    const avatarUrl = player.avatar && player.avatar.trim()
        ? player.avatar.trim()
        : getGitHubAvatar(player.name);

    entry.innerHTML = `
        <div class="rank-number">${rankNum}.</div>
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

function renderLeaderboard(searchTerm = '') {
    const list = (players[currentMode] || []).slice();

    const filtered = searchTerm
        ? list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : list;

    filtered.sort((a, b) => b.points - a.points);

    leaderboardContent.innerHTML = '';
    filtered.forEach((p, i) => leaderboardContent.appendChild(createLeaderboardEntry(p, i + 1)));
}

// Smooth render helper
function smoothRender(searchTerm = '') {
    leaderboardContent.style.opacity = '0.5';
    leaderboardContent.style.transform = 'translateY(10px)';
    setTimeout(() => {
        renderLeaderboard(searchTerm);
        leaderboardContent.style.opacity = '1';
        leaderboardContent.style.transform = 'translateY(0)';
    }, 150);
}

// ====== Admin Actions ======
function addPlayer() {
    const name = playerNameInput.value.trim();
    const avatar = playerAvatarInput.value.trim();
    const rank = playerRankSelect.value;
    const region = playerRegionSelect.value;
    const mode = playerModeSelect.value;
    const points = parseInt(playerPointsInput.value, 10) || 0;

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

    if (!players[mode]) players[mode] = [];
    players[mode].push(newPlayer);

    // Clear form
    playerNameInput.value = '';
    playerAvatarInput.value = '';
    playerPointsInput.value = '';

    saveState();
    smoothRender(searchInput.value);
    updateRemovePlayerSelect();

    alert(`Player ${name} added to ${mode} leaderboard!`);
}

function removePlayer() {
    const val = removePlayerSelect.value;
    if (!val) {
        alert('Please select a player to remove');
        return;
    }
    const [mode, playerName] = val.split('|');
    if (!players[mode]) return;

    players[mode] = players[mode].filter(p => p.name !== playerName);

    saveState();
    smoothRender(searchInput.value);
    updateRemovePlayerSelect();

    alert(`Player ${playerName} removed from ${mode} leaderboard!`);
}

function updateRemovePlayerSelect() {
    removePlayerSelect.innerHTML = '<option value="">Select player to remove</option>';
    Object.keys(players).forEach(mode => {
        (players[mode] || []).forEach(p => {
            const opt = document.createElement('option');
            opt.value = `${mode}|${p.name}`;
            opt.textContent = `${p.name} (${mode})`;
            removePlayerSelect.appendChild(opt);
        });
    });
}

// ====== Sample Data Boost (optional) ======
function addSampleData() {
    const sampleOverall = [
        { name: "GitMaster", rank: "Combat Ace", points: 2180, region: "EU", tiers: ["HT1", "HT2", "HT3", "LT1", "LT2"] },
        { name: "RepoKing", rank: "Combat Expert", points: 2050, region: "AS", tiers: ["HT2", "HT2", "HT3", "LT2", "LT3"] },
        { name: "CommitLord", rank: "Combat Veteran", points: 1920, region: "OCE", tiers: ["HT2", "HT3", "HT3", "LT3", "LT3"] }
    ];
    const sampleSword = [
        { name: "SlashMaster", rank: "Combat Ace", points: 2280, region: "NA", tiers: ["HT1", "HT2", "HT2", "LT1", "LT2"] },
        { name: "CutThroat", rank: "Combat Expert", points: 2150, region: "EU", tiers: ["HT2", "HT2", "HT3", "LT2", "LT3"] },
        { name: "BladeWielder", rank: "Combat Veteran", points: 2000, region: "AS", tiers: ["HT2", "HT3", "HT3", "LT3", "LT3"] }
    ];
    sampleOverall.forEach(p => {
        p.avatar = getGitHubAvatar(p.name);
        players.overall.push(p);
    });
    sampleSword.forEach(p => {
        p.avatar = getGitHubAvatar(p.name);
        players.sword.push(p);
    });
}

// ====== Events & Init ======
document.addEventListener('DOMContentLoaded', () => {
    // load persisted state first
    loadState();

    // allow deep-link pages like ?mode=sword
    currentMode = getQueryMode();

    // set active tab
    modeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === currentMode);
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;
            if (mode !== currentMode) {
                currentMode = mode;
                setQueryMode(mode);
                modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
                smoothRender(searchInput.value);
            }
        });
    });

    // nav items (optional behavior)
    if (navHome) navHome.addEventListener('click', () => {
        currentMode = 'overall';
        setQueryMode('overall');
        modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === 'overall'));
        smoothRender(searchInput.value);
    });
    if (navRankings) navRankings.addEventListener('click', () => {
        // keep current mode but refresh view
        smoothRender(searchInput.value);
    });

    // admin toggle
    adminToggle.addEventListener('click', () => {
        adminPanel.classList.toggle('hidden');
    });

    // admin actions
    addPlayerBtn.addEventListener('click', addPlayer);
    removePlayerBtn.addEventListener('click', removePlayer);

    // search (debounced)
    let searchTimeout;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        const val = this.value;
        searchTimeout = setTimeout(() => smoothRender(val), 250);
    });

    // shortcuts
    document.addEventListener('keydown', (e) => {
        // focus search with '/'
        if (e.key === '/' && !searchInput.matches(':focus')) {
            e.preventDefault();
            searchInput.focus();
        }
        // escape clears search
        if (e.key === 'Escape' && searchInput.matches(':focus')) {
            searchInput.blur();
            searchInput.value = '';
            smoothRender('');
        }
    });

    // easter egg (Konami)
    let konamiCode = [];
    const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        konamiCode = konamiCode.slice(-10);
        if (konamiCode.join('') === konamiSequence.join('')) {
            document.body.style.filter = 'hue-rotate(180deg) saturate(1.5)';
            setTimeout(() => { document.body.style.filter = ''; }, 3000);
            console.log('🎉 Special mode activated! You found the easter egg!');
        }
    });

    // if no persisted data (first visit), optionally add a few samples
    if (!localStorage.getItem(STORAGE_KEY)) {
        addSampleData();
        saveState();
    }

    // initial UI
    updateRemovePlayerSelect();
    renderLeaderboard('');
});
