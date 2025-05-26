let players = []; // Array to store player objects

// --- Helper Functions ---

// Loads players from localStorage
function loadPlayers() {
    const storedPlayers = localStorage.getItem('playerRankings');
    if (storedPlayers) {
        players = JSON.parse(storedPlayers);
    }
}

// Saves players to localStorage
function savePlayers() {
    localStorage.setItem('playerRankings', JSON.stringify(players));
}

// Generates initials for player avatar
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// Combines stage and sub-stage into a readable string
function getFullStageText(stage, stage1Sub) {
    if (stage === 'stage-0') return 'Stage 0 - Legendary';
    if (stage === 'stage-1') {
        if (stage1Sub) {
            const subText = stage1Sub.replace('-', ' '); // e.g., "high-strong" -> "high strong"
            return `Stage 1 - ${subText.charAt(0).toUpperCase() + subText.slice(1)}`;
        }
        return 'Stage 1 - Elite'; // Fallback if no sub-stage selected for Stage 1
    }
    if (stage === 'stage-2') return 'Stage 2 - Skilled';
    if (stage === 'stage-3') return 'Stage 3 - Novice';
    return 'Unknown Stage';
}

// Returns the CSS class for the stage badge
function getStageClass(stage, stage1Sub) {
    if (stage === 'stage-0') return 'stage-0';
    if (stage === 'stage-1') {
        // Ensure the sub-stage part exists to form a valid class
        return stage1Sub ? `stage-1-${stage1Sub}` : 'stage-1-high-strong'; // Default to a class if sub-stage is missing
    }
    if (stage === 'stage-2') return 'stage-2';
    if (stage === 'stage-3') return 'stage-3';
    return ''; // Return empty string for unknown stage
}

// Returns a numerical rank for sorting players (lower number = higher rank)
function getStageRank(stage, stage1Sub) {
    const rankings = {
        'stage-0': 1,
        'stage-1-high-strong': 2,
        'stage-1-high-solid': 3,
        // No 'stage-1-high-weak' in your CSS, so removed.
        'stage-1-mid-strong': 4,
        'stage-1-mid-solid': 5,
        // No 'stage-1-mid-weak' in your CSS, so removed.
        'stage-1-low-strong': 6,
        'stage-1-low-solid': 7,
        // No 'stage-1-low-weak' in your CSS, so removed.
        'stage-2': 8,
        'stage-3': 9
    };
    
    // Construct the key for Stage 1 correctly
    if (stage === 'stage-1' && stage1Sub) {
        return rankings[`${stage}-${stage1Sub}`] || 999;
    }
    return rankings[stage] || 999; // Fallback for invalid stage or no sub-stage
}

// --- Admin Panel Functions ---

// Toggles the visibility of the admin panel
function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('active');
    // Clear form and update list when opening/closing
    if (!panel.classList.contains('active')) {
        clearForm();
    }
    updatePlayerList(); // Always update admin list when toggling
}

// Shows/hides Stage 1 subdivision options based on selected stage
function updateStageOptions() {
    const stageSelect = document.getElementById('playerStage');
    const stage1OptionsDiv = document.getElementById('stage1Options');
    const stage1SubSelect = document.getElementById('stage1Sub');

    if (stageSelect.value === 'stage-1') {
        stage1OptionsDiv.style.display = 'block';
        stage1SubSelect.required = true;
    } else {
        stage1OptionsDiv.style.display = 'none';
        stage1SubSelect.required = false;
        stage1SubSelect.value = ''; // Clear selection when hidden
    }
}

// Handles adding a new player via the admin form
function addPlayer(event) {
    event.preventDefault(); // Prevent default form submission (page reload)

    const nameInput = document.getElementById('playerName');
    const stageSelect = document.getElementById('playerStage');
    const stage1SubSelect = document.getElementById('stage1Sub');
    const tabSelect = document.getElementById('playerTab');

    const name = nameInput.value.trim();
    const stage = stageSelect.value;
    const stage1Sub = stage1SubSelect.value;
    const tab = tabSelect.value;

    // Basic validation
    if (!name || !stage || !tab || (stage === 'stage-1' && !stage1Sub)) {
        alert('Please fill in all required fields, including Stage 1 subdivision if applicable.');
        return;
    }

    // Check if player already exists (case-insensitive to prevent duplicates)
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Player with this name already exists!');
        return;
    }

    // Create player object
    const player = {
        id: Date.now(), // Unique ID (timestamp is simple for small apps)
        name: name,
        stage: stage,
        stage1Sub: stage === 'stage-1' ? stage1Sub : '', // Only store sub-stage if stage is 'stage-1'
        tab: tab,
        fullStage: getFullStageText(stage, stage1Sub) // Pre-calculate for display
    };

    players.push(player); // Add new player to array
    savePlayers();       // Save updated array to localStorage
    updatePlayerList();  // Re-render player list in admin panel
    updateLeaderboards(); // Re-render main view leaderboards
    clearForm();         // Clear the form fields
    alert('Player added successfully!');
}

// Handles deleting a player
function deletePlayer(id) {
    if (confirm('Are you sure you want to delete this player?')) {
        players = players.filter(p => p.id !== id); // Remove player by ID
        savePlayers();      // Save updated array
        updatePlayerList(); // Re-render admin list
        updateLeaderboards(); // Re-render main views
    }
}

// Clears the add player form and resets options
function clearForm() {
    document.getElementById('addPlayerForm').reset(); // Correct form ID
    updateStageOptions(); // Ensures Stage 1 options are hidden after clearing
}

// Updates the list of players displayed in the Admin Panel's "Manage Existing Players" section
function updatePlayerList() {
    const managePlayerList = document.getElementById('managePlayerList');
    // Ensure element exists before trying to manipulate it
    if (!managePlayerList) {
        console.error("Element with ID 'managePlayerList' not found.");
        return;
    }

    if (players.length === 0) {
        managePlayerList.innerHTML = '<div style="text-align: center; color: #666; padding: 2rem;">No players added yet</div>';
        return;
    }

    // Generate HTML for each player in the manage list
    managePlayerList.innerHTML = players.map(player => {
        // Convert 'tab' value for display in admin panel
        let tabDisplay = '';
        if (player.tab === 'tierView') tabDisplay = 'Tier View Only';
        else if (player.tab === 'leaderboardView') tabDisplay = 'Leaderboard View Only';
        else if (player.tab === 'both') tabDisplay = 'Both Views';

        return `
            <div class="player-item">
                <div class="player-info-admin">
                    <div class="player-name-admin">${player.name}</div>
                    <div class="player-stage-admin">(${player.fullStage}) - ${tabDisplay}</div>
                </div>
                <button class="btn btn-danger" onclick="deletePlayer(${player.id})">Delete</button>
            </div>
        `;
    }).join('');
}

// --- Main View Rendering Functions ---

// Main function to update both main view leaderboards
function updateLeaderboards() {
    renderLeaderboardView(); // Update the global leaderboard
    renderTierView();       // Update the tiered view
}

// Renders players to the Global Leaderboard View
function renderLeaderboardView() {
    const leaderboardContainer = document.getElementById('globalLeaderboard');
    if (!leaderboardContainer) {
        console.error("Element with ID 'globalLeaderboard' not found.");
        return;
    }

    // Store the header HTML to re-insert it
    const headerHTML = `
        <div class="leaderboard-header">
            <div>Rank</div>
            <div>Player</div>
            <div>Stage</div>
        </div>
    `;

    // Filter players that should appear in the leaderboard
    const leaderboardPlayers = players.filter(p => p.tab === 'leaderboardView' || p.tab === 'both');
    // Sort players based on their stage rank (lowest rank number = highest position)
    leaderboardPlayers.sort((a, b) => getStageRank(a.stage, a.stage1Sub) - getStageRank(b.stage, b.stage1Sub));

    if (leaderboardPlayers.length === 0) {
        // Display placeholder if no players
        leaderboardContainer.innerHTML = `
            ${headerHTML}
            <div class="player-row">
                <div class="rank other">-</div>
                <div class="player-info">
                    <div class="player-avatar">?</div>
                    <div class="player-details">
                        <h3>No players yet!</h3>
                    </div>
                </div>
                <div class="stage-info">
                    <span class="stage-badge stage-3">Add players via Admin Panel</span>
                </div>
            </div>
        `;
        return;
    }

    // Generate HTML for each player row
    const playersHTML = leaderboardPlayers.map((player, index) => {
        // Determine rank class for styling (top1, top2, top3, other)
        const rankClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'other';
        const initials = getInitials(player.name); // Get player initials for avatar

        return `
            <div class="player-row">
                <div class="rank ${rankClass}">${index + 1}</div>
                <div class="player-info">
                    <div class="player-avatar">${initials}</div>
                    <div class="player-details">
                        <h3>${player.name}</h3>
                    </div>
                </div>
                <div class="stage-info">
                    <span class="stage-badge ${getStageClass(player.stage, player.stage1Sub)}">${player.fullStage}</span>
                </div>
            </div>
        `;
    }).join('');

    // Update the container with the header and all player rows
    leaderboardContainer.innerHTML = headerHTML + playersHTML;
}

// Renders players to the Tier View
function renderTierView() {
    // Filter players that should appear in the tier view
    const tierViewPlayers = players.filter(p => p.tab === 'tierView' || p.tab === 'both');

    // Map stage keys to their corresponding DOM container IDs
    const tierContainers = {
        'stage-0': document.getElementById('tierStage0'),
        'stage-1': document.getElementById('tierStage1'),
        'stage-2': document.getElementById('tierStage2'),
        'stage-3': document.getElementById('tierStage3')
    };

    // Clear all tier columns first and add empty message
    for (const stageKey in tierContainers) {
        if (tierContainers[stageKey]) {
            tierContainers[stageKey].innerHTML = '<div class="empty-tier">No players yet.</div>';
        }
    }

    // Populate tier columns with relevant players
    tierViewPlayers.forEach(player => {
        const initials = getInitials(player.name);
        const playerHTML = `
            <div class="tier-player">
                <div class="tier-avatar">${initials}</div>
                <div class="tier-player-name">${player.name}</div>
            </div>
        `;

        const targetContainer = tierContainers[player.stage]; // Get the specific container for this player's stage
        if (targetContainer) {
            // If the container currently shows "No players yet", clear it
            if (targetContainer.querySelector('.empty-tier')) {
                targetContainer.innerHTML = '';
            }
            targetContainer.innerHTML += playerHTML; // Add player HTML
        }
    });
}

// --- Tab Switching Logic ---

// Handles switching between "Tier View" and "Leaderboard View"
function switchTab(clickedTabElement) {
    // 1. Hide all tab content sections
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // 2. Remove 'active' class from all tab buttons
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // 3. Get the ID of the content section to show from the clicked tab's data attribute
    const targetTabId = clickedTabElement.dataset.tabTarget;
    if (targetTabId) {
        document.getElementById(targetTabId).classList.add('active'); // Show the target content
    }

    // 4. Add 'active' class to the clicked tab button itself
    clickedTabElement.classList.add('active');
}

// --- Event Listeners & Initial Page Load ---

// Ensures all HTML is loaded before running JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 1. Load any saved player data from localStorage
    loadPlayers();

    // 2. Attach Event Listeners for Admin Panel Buttons
    document.querySelector('.admin-btn').addEventListener('click', toggleAdmin);
    document.getElementById('closeAdminBtn').addEventListener('click', toggleAdmin);

    // 3. Attach Event Listener for Stage Dropdown in Admin Panel (to show/hide sub-options)
    document.getElementById('playerStage').addEventListener('change', updateStageOptions);

    // 4. Attach Event Listener for the Add Player Form Submission
    document.getElementById('addPlayerForm').addEventListener('submit', addPlayer);

    // 5. Attach Event Listeners for Tab Switching Buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this); // 'this' refers to the clicked tab element
        });
    });

    // 6. Initial Render of content when the page first loads
    updatePlayerList(); // Render players in the admin panel's management list
    updateLeaderboards(); // Render players in the main Tier and Leaderboard views

    // Optional: Ensure a default tab is active if your HTML doesn't guarantee it.
    // This part is less critical if you already have 'active' class on default tab in index.html
    const defaultActiveTab = document.querySelector('.tab.active');
    const defaultActiveContent = document.querySelector('.tab-content.active');
    if (!defaultActiveTab || !defaultActiveContent) {
        // If for some reason no active tab is set in HTML, default to Tier View
        document.querySelector('.tab[data-tab-target="tierView"]').classList.add('active');
        document.getElementById('tierView').classList.add('active');
    }
});
